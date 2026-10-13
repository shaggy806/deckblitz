/**
 * A bot that plays a script: an opponent whose moves are known in advance,
 * so a lesson (`tutorials/`) or a dev-rooms board (`scripts/dev-rooms.mjs`)
 * reaches the position it was written for every time.
 *
 * A script is a list of moves named by card — "cast Grizzly Bears on turn 2",
 * "attack alice with Elvish Mystic", "block the Colossal Dreadmaw with every
 * Grizzly Bears" — resolved against the live board when the bot is asked.
 * Whatever the script doesn't cover is answered by **v1**
 * (`HeuristicBotController`): fixed and not time-budgeted, so with a fixed
 * seed, no shuffle and listed libraries a game plays out the same way every
 * time — never v2, whose search stops on a clock.
 *
 * **What a move has done is read off the game's event log**, never kept in
 * the bot. A move that isn't `repeat` is spent once the log shows the bot
 * made it (a `spell-cast`, `land-played`, `ability-activated`,
 * `attackers-declared` or `blocker-declared` of its own) — in its turn when
 * the move names one, else at any point in the game. So a bot built afresh
 * over a game restored from a snapshot (a tutorial's retry) knows exactly
 * which moves are still to come, and a move the room asked for but never
 * dispatched (a realtime room re-deciding after a wait) isn't lost.
 */

import { HeuristicBotController, activePlayerOf, createDefaultRegistry, fitCastTargets } from "engine";
import type {
  Action,
  AttackerDeclaration,
  BlockerDeclaration,
  CardRegistry,
  ControllerView,
  GameEvent,
  GameState,
  LegalAction,
  ObjectId,
  PlayerId,
  Step,
  TargetRef,
} from "engine";

/** What a scripted move does. */
export type ScriptedMoveKind = "cast" | "activate" | "play-land" | "attack" | "block" | "pass";

/**
 * One move of a script.
 *
 * - `cast` / `activate` / `play-land`: when the bot has priority with the
 *   stack empty, in step `on.step` (the precombat main unless it says),
 *   it casts / activates / plays the first card named `card` it legally can.
 *   `target` aims each of its targets: a player id, or a permanent's name
 *   (the first legal one so named); unmatched, the first legal target.
 *   `ability` picks which of the card's activated abilities, by index.
 *   Plain casts only: a modal spell or one with X is left to v1.
 * - `attack`: when the bot declares attackers, every creature named `card`
 *   (or every creature that can, without `card`) attacks `at`, a player id.
 * - `block`: when the bot declares blockers, every creature named `card` that
 *   can block the attacking creature named `at` does.
 * - `pass`: when the bot has priority in step `on.step`, it passes, whatever
 *   v1 would have done — for holding v1 back where it would spoil a lesson.
 *
 * `on.turn` limits a move to that turn of the game; without one it fits any
 * turn that is `on.whose` (the bot's own, unless it says `"theirs"` or
 * `"any"`). A move fires once — in its turn, or in the game without one —
 * unless `repeat`. `attack` and `block` ignore `on.step` and `on.whose`:
 * they answer the declaration whenever it comes.
 */
export interface ScriptedMove {
  readonly do: ScriptedMoveKind;
  readonly on?: {
    readonly turn?: number;
    readonly step?: Step;
    readonly whose?: "mine" | "theirs" | "any";
  };
  readonly card?: string | readonly string[];
  readonly target?: string;
  readonly at?: string;
  readonly ability?: number;
  readonly repeat?: boolean;
}

export interface OpponentScript {
  readonly moves: readonly ScriptedMove[];
  /**
   * Where no move applies: `"v1"` (the default) lets v1 play — lands,
   * spells, attacks and blocks; `"pass"` passes every priority window and
   * declares no attackers or blockers, leaving v1 only the decisions the
   * rules force (a discard, a sacrifice, a trigger's target).
   */
  readonly otherwise?: "v1" | "pass";
}

let sharedRegistry: CardRegistry | null = null;
/** One card registry for every scripted bot and tutorial board — building
 * the whole pool's is too slow to do per room. */
export const scriptRegistry = (): CardRegistry => (sharedRegistry ??= createDefaultRegistry());

const namesOf = (move: ScriptedMove): readonly string[] =>
  move.card === undefined ? [] : typeof move.card === "string" ? [move.card] : move.card;

/** The events of turn `turn`, or of the whole game for `undefined`. */
function eventsOfTurn(log: readonly GameEvent[], turn: number | undefined): readonly GameEvent[] {
  if (turn === undefined) return log;
  const start = log.findIndex((e) => e.type === "turn-began" && e.turn === turn);
  if (start < 0) return [];
  const end = log.findIndex((e, i) => i > start && e.type === "turn-began");
  return log.slice(start, end < 0 ? log.length : end);
}

/** Whether `event` is `player` making `move`. */
function madeMove(state: GameState, player: PlayerId, move: ScriptedMove, event: GameEvent): boolean {
  const names = namesOf(move);
  const named = (id: ObjectId): boolean => names.length === 0 || names.includes(state.objects[id]?.cardName ?? "");
  switch (move.do) {
    case "cast":
      return event.type === "spell-cast" && event.player === player && named(event.object);
    case "play-land":
      return event.type === "land-played" && event.player === player && named(event.object);
    case "activate":
      return event.type === "ability-activated" && event.player === player && named(event.source);
    case "attack":
      return event.type === "attackers-declared" && event.player === player && event.attackers.length > 0;
    case "block":
      return event.type === "blocker-declared" && state.objects[event.blocker]?.controller === player;
    case "pass":
      return false;
  }
}

/** Two moves that leave the same mark in the log, so the second of them is
 * spent only by a second such event. */
const sameMark = (a: ScriptedMove, b: ScriptedMove): boolean =>
  a.do === b.do && a.on?.turn === b.on?.turn && namesOf(a).join("\n") === namesOf(b).join("\n");

/** The first of `options` the script's `target` names, else the first. */
function aim(state: GameState, options: readonly TargetRef[], target: string | undefined): TargetRef | null {
  if (target !== undefined) {
    const named = options.find(
      (o) =>
        (o.kind === "player" && o.player === target) ||
        (o.kind === "object" && state.objects[o.object]?.cardName === target),
    );
    if (named !== undefined) return named;
  }
  return options[0] ?? null;
}

export class ScriptedBot extends HeuristicBotController {
  private readonly script: OpponentScript;

  constructor(player: PlayerId, script: OpponentScript, registry: CardRegistry = scriptRegistry()) {
    super(player, registry);
    this.script = script;
  }

  /** The moves not yet spent, in script order. */
  private openMoves(state: GameState): ScriptedMove[] {
    const moves = this.script.moves;
    return moves.filter((move, i) => {
      if (move.repeat === true || move.do === "pass") return true;
      if (move.on?.turn !== undefined && move.on.turn < state.turn.number) return false;
      // This is the k-th move leaving its mark: spent once the log shows k.
      const rank = moves.slice(0, i + 1).filter((m) => m.repeat !== true && sameMark(m, move)).length;
      let made = 0;
      for (const event of eventsOfTurn(state.eventLog, move.on?.turn)) {
        if (madeMove(state, this.playerId, move, event)) made += 1;
      }
      return made < rank;
    });
  }

  /** Whether a priority-window move fits this turn and step. */
  private fitsWindow(state: GameState, move: ScriptedMove): boolean {
    if (move.on?.turn !== undefined && move.on.turn !== state.turn.number) return false;
    if (state.turn.step !== (move.on?.step ?? "precombat-main")) return false;
    if (move.on?.turn !== undefined) return true;
    const whose = move.on?.whose ?? "mine";
    const mine = activePlayerOf(state) === this.playerId;
    return whose === "any" || (whose === "mine") === mine;
  }

  private fitsTurn(state: GameState, move: ScriptedMove): boolean {
    return move.on?.turn === undefined || move.on.turn === state.turn.number;
  }

  override act(view: ControllerView): Action {
    const state = view.state;
    // A decision (attackers and blockers among them, answered below): v1's
    // own routing, which reaches this class's `declareAttackers` and
    // `declareBlockers`.
    if (state.awaiting !== null) return super.act(view);
    const legal = view.legalActions();
    for (const move of this.openMoves(state)) {
      if (move.do === "attack" || move.do === "block" || !this.fitsWindow(state, move)) continue;
      if (move.do === "pass") return { type: "pass-priority", player: this.playerId };
      if (state.zones.shared.stack.length > 0) continue;
      const action = this.moveAction(state, legal, move);
      if (action !== null) return action;
    }
    if (this.script.otherwise === "pass") return { type: "pass-priority", player: this.playerId };
    return super.act(view);
  }

  /** `move` as an action against `legal`, or `null` if it can't be made now. */
  private moveAction(state: GameState, legal: readonly LegalAction[], move: ScriptedMove): Action | null {
    const names = namesOf(move);
    const player = this.playerId;
    const isNamed = (name: string): boolean => names.length === 0 || names.includes(name);
    if (move.do === "play-land") {
      const offer = legal.find((a) => a.kind === "play-land" && isNamed(a.cardName));
      if (offer?.kind !== "play-land") return null;
      return {
        type: "play-land",
        player,
        card: offer.card,
        ...(offer.face !== undefined ? { face: offer.face } : {}),
        ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
      };
    }
    if (move.do === "cast") {
      const offer = legal.find(
        (a) =>
          a.kind === "cast-spell" &&
          isNamed(a.cardName) &&
          a.castModal === undefined &&
          a.xCost === undefined &&
          a.kicked !== true &&
          a.altCost !== true &&
          a.costOption === undefined,
      );
      if (offer?.kind !== "cast-spell") return null;
      const chosen = offer.targetOptions.map((options) => aim(state, options, move.target));
      const targets = fitCastTargets(offer, chosen, offer.targetOptions, offer.targetSpecs);
      if (targets === null) return null;
      return {
        type: "cast-spell",
        player,
        card: offer.card,
        targets,
        ...(offer.via !== undefined ? { via: offer.via } : {}),
        ...(offer.face !== undefined ? { face: offer.face } : {}),
        ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
      };
    }
    if (move.do === "activate") {
      const offer = legal.find(
        (a) =>
          a.kind === "activate-ability" &&
          isNamed(a.cardName) &&
          (move.ability === undefined || a.abilityIndex === move.ability) &&
          a.xCost === undefined,
      );
      if (offer?.kind !== "activate-ability") return null;
      const sacrifice = offer.sacrifice?.choices[0];
      return {
        type: "activate-ability",
        player,
        source: offer.source,
        abilityIndex: offer.abilityIndex,
        targets: offer.targetOptions.map((options) => aim(state, options, move.target)),
        ...(sacrifice !== undefined ? { sacrifice } : {}),
      };
    }
    return null;
  }

  override declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    const state = view.state;
    const move = this.openMoves(state).find((m) => m.do === "attack" && this.fitsTurn(state, m));
    if (move === undefined) return this.script.otherwise === "pass" ? [] : super.declareAttackers(view);
    const offer = view.legalActions().find((a) => a.kind === "declare-attackers");
    if (offer?.kind !== "declare-attackers" || move.at === undefined) return [];
    const at = move.at;
    const names = namesOf(move);
    return offer.eligible
      .filter((id) => names.length === 0 || names.includes(state.objects[id]?.cardName ?? ""))
      .filter((id) => (offer.defendersFor[id] ?? []).includes(at as PlayerId))
      .map((attacker) => ({ attacker, defender: at as PlayerId }));
  }

  override declareBlockers(view: ControllerView): readonly BlockerDeclaration[] {
    const state = view.state;
    const move = this.openMoves(state).find((m) => m.do === "block" && this.fitsTurn(state, m));
    if (move === undefined) return this.script.otherwise === "pass" ? [] : super.declareBlockers(view);
    const offer = view.legalActions().find((a) => a.kind === "declare-blockers");
    if (offer?.kind !== "declare-blockers") return [];
    const attacker = state.zones.shared.battlefield.find(
      (id) => state.objects[id]?.cardName === move.at && state.objects[id]?.attacking !== null,
    );
    if (attacker === undefined) return [];
    const names = namesOf(move);
    return offer.eligible
      .filter((e) => names.length === 0 || names.includes(state.objects[e.blocker]?.cardName ?? ""))
      .filter((e) => e.canBlock.includes(attacker))
      .map((e) => ({ blocker: e.blocker, attacker }));
  }
}
