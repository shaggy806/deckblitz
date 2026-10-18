/**
 * Lookahead benchmarks: hard positions with one winning line, played out over
 * whole turns and judged on how they end.
 *
 * ## Not a gate, and not training either
 *
 * The scenarios in `scenarios.ts` ask one question and judge one answer. A
 * gate scenario is something the shipped bot must already get right; a
 * training scenario is one the right weights might fix. These are neither:
 * they are positions where the right line takes *more lookahead* than v2's
 * search has — several moves this turn that only pay off together, a combat
 * the precombat move has to plan around, or the opponents' next turn and our
 * own after it — so no weight vector is expected to fix them. They are goals
 * for a deeper search to aim at, and the yardstick for whether one finds
 * smarter lines (`npm run bot:benchmarks -w engine`). Nothing fails when one
 * goes wrong.
 *
 * ## Judged on the outcome
 *
 * Each seats the bot under test as Alice and v2 in every other seat, plays
 * `turns` turns out from the position, and judges the board it ends on — Bob
 * dead, Alice alive, a creature on the battlefield — never which action was
 * taken first. A multi-step line can start with any of its steps, and a
 * deeper search may find a different winning line than the one written here;
 * either passes.
 *
 * Each also carries its winning line and the natural mistake, scripted, and
 * `test/bot-benchmarks.test.ts` plays both: the first must pass and the second
 * fail, so a benchmark can never be unsolvable or pass by testing nothing.
 */

import type { Action, AttackerDeclaration, BlockerDeclaration } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { AutomaticController } from "../controller.js";
import type { ControllerView, PlayerController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { EvalBotController } from "./eval-bot.js";
import type { ScenarioResult } from "./scenarios.js";

/** What a benchmark's winning line has to see that a one-move search doesn't. */
export type Lookahead =
  /** Several moves this turn that are only worth anything together. */
  | "sequence"
  /** A precombat move planned around the attack, or an attack around a
   * postcombat move. */
  | "combat"
  /** What the opponents will do on their turn. */
  | "their-turn"
  /** Setting up our own next turn. */
  | "next-turn";

export interface BotBenchmark {
  readonly name: string;
  /** The winning line, and why finding it takes lookahead. */
  readonly rule: string;
  readonly lookahead: Lookahead;
  /** Turns to play out from the position before judging: 1 ends with the
   * current turn, 2 with the next player's, and so on. */
  readonly turns: number;
  /** The position, every seat on `AutomaticController`; the runner reseats
   * it. */
  setup(registry: CardRegistry): Game;
  judge(state: GameState): ScenarioResult;
  /** The winning line, scripted for Alice. */
  readonly solution: BenchmarkLine;
  /** The natural mistake, scripted for Alice — the judge must fail it. */
  readonly mistake: BenchmarkLine;
}

const A = asPlayerId("alice");
const B = asPlayerId("bob");

// --- the position ----------------------------------------------------------

/** As `scenarios.ts`'s: a board stands for the middle of a game, and the bot
 * reads the round (`earlyRemoval`, `earlyMana`). */
const MID_GAME_ROUNDS = 8;

/** A two-player game paused at `active`'s precombat main with every hand
 * empty, both libraries plain Forests unless `library` says otherwise. */
function table(registry: CardRegistry, active: PlayerId, library: Partial<Record<PlayerId, string>> = {}): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill(library[player] ?? "Forest") })),
  });
  game.advanceUntil(
    (s) =>
      s.turnOrder[s.turn.activePlayerIndex] === active &&
      s.priority.holder === active &&
      s.turn.step === "precombat-main",
  );
  game.state.turn.number += MID_GAME_ROUNDS * game.state.turnOrder.length;
  for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
  return game;
}

/** A permanent that has been there since last turn. */
const onBoard = (game: Game, name: string, player: PlayerId, tapped = false): ObjectId =>
  game.debugSpawn(name, player, "battlefield", { summoningSick: false, tapped });

const lands = (game: Game, name: string, player: PlayerId, count: number): void => {
  for (let i = 0; i < count; i += 1) onBoard(game, name, player);
};

const inHand = (game: Game, player: PlayerId, ...names: readonly string[]): void => {
  for (const name of names) game.debugSpawn(name, player, "hand");
};

const lifeOf = (game: Game, player: PlayerId, life: number): void => {
  game.state.players[player].life = life;
};

// --- reading the result ----------------------------------------------------

const named = (state: GameState, id: ObjectId): string => state.objects[id]?.cardName ?? "";

/** The permanents `player` controls named any of `names`. */
function controls(state: GameState, player: PlayerId, ...names: readonly string[]): ObjectId[] {
  return state.zones.shared.battlefield.filter(
    (id) => state.objects[id]?.controller === player && names.includes(named(state, id)),
  );
}

const lost = (state: GameState, player: PlayerId): boolean => state.players[player]?.hasLost === true;

const life = (state: GameState, player: PlayerId): number => state.players[player]?.life ?? 0;

const bobDead = (state: GameState): ScenarioResult => ({
  passed: lost(state, B),
  detail: lost(state, B) ? "bob is dead" : `bob at ${life(state, B)}`,
});

const aliceAlive = (state: GameState): ScenarioResult => ({
  passed: !lost(state, A),
  detail: lost(state, A) ? "alice died" : `alice at ${life(state, A)}`,
});

// --- scripted lines --------------------------------------------------------

/**
 * One step of a scripted line: the action to take now, or null while it isn't
 * time yet. Steps run in order; a step that returns an action is spent.
 */
export type LineStep = (view: ControllerView) => Action | null;

/** A scripted line for Alice: its steps, and how it attacks and blocks
 * (neither, unless said). */
export interface BenchmarkLine {
  readonly steps: readonly LineStep[];
  readonly attack?: (view: ControllerView) => readonly AttackerDeclaration[];
  readonly block?: (view: ControllerView) => readonly BlockerDeclaration[];
}

/** Plays a `BenchmarkLine`, and otherwise what `AutomaticController` does:
 * pass, and the default answer to anything asked. */
export class LineController extends AutomaticController {
  private readonly steps: LineStep[];
  private readonly line: BenchmarkLine;

  constructor(player: PlayerId, line: BenchmarkLine) {
    super(player);
    this.line = line;
    this.steps = [...line.steps];
  }

  override act(view: ControllerView): Action {
    if (view.state.awaiting === null) {
      const next = this.steps[0]?.(view) ?? null;
      if (next !== null && offered(view, next)) {
        this.steps.shift();
        return next;
      }
    }
    return super.act(view);
  }

  override declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    return this.line.attack?.(view) ?? [];
  }

  override declareBlockers(view: ControllerView): readonly BlockerDeclaration[] {
    return this.line.block?.(view) ?? [];
  }
}

/** Whether the engine offers `action` now — a step waits until it can be
 * paid for and is allowed (the second land drop waits for the next turn). */
function offered(view: ControllerView, action: Action): boolean {
  return view.legalActions().some((legal) => {
    if (action.type === "cast-spell" || action.type === "play-land") {
      return legal.kind === action.type && legal.card === action.card;
    }
    if (action.type === "activate-ability") {
      return (
        legal.kind === "activate-ability" &&
        legal.source === action.source &&
        legal.abilityIndex === action.abilityIndex
      );
    }
    return true;
  });
}

const handCard = (view: ControllerView, name: string): ObjectId | undefined =>
  view.state.zones.perPlayer[view.player].hand.find((id) => named(view.state, id) === name);

const mine = (view: ControllerView, name: string): ObjectId[] => controls(view.state, view.player, name);

const theirs = (view: ControllerView, player: PlayerId, name: string): ObjectId | undefined =>
  controls(view.state, player, name)[0];

/** Whether Alice holds priority in her own main phase with the stack empty. */
const sorceryTime = (view: ControllerView): boolean =>
  view.state.turnOrder[view.state.turn.activePlayerIndex] === view.player &&
  (view.state.turn.step === "precombat-main" || view.state.turn.step === "postcombat-main") &&
  view.state.zones.shared.stack.length === 0;

/** Cast `name` from hand at `target` (an object picked when the step runs),
 * once `when` holds — by default, at sorcery speed with the stack empty. */
function cast(
  name: string,
  target?: (view: ControllerView) => ObjectId | PlayerId | undefined,
  when: (view: ControllerView) => boolean = sorceryTime,
): LineStep {
  return (view) => {
    if (!when(view)) return null;
    const card = handCard(view, name);
    if (card === undefined) return null;
    const aimed = target?.(view);
    if (target !== undefined && aimed === undefined) return null;
    return {
      type: "cast-spell",
      player: view.player,
      card,
      targets:
        aimed === undefined
          ? []
          : aimed in view.state.players
            ? [{ kind: "player", player: aimed as PlayerId }]
            : [{ kind: "object", object: aimed as ObjectId }],
    };
  };
}

function playLand(name: string): LineStep {
  return (view) => {
    if (!sorceryTime(view)) return null;
    const card = handCard(view, name);
    return card === undefined ? null : { type: "play-land", player: view.player, card };
  };
}

/** Attack `defender` with every creature of ours named in `names`. */
const attackWith =
  (...names: readonly string[]) =>
  (view: ControllerView): readonly AttackerDeclaration[] =>
    names.flatMap((name) => mine(view, name)).map((attacker) => ({ attacker, defender: B }));

const inStep = (step: GameState["turn"]["step"]) => (view: ControllerView): boolean =>
  view.state.turn.step === step;

const onTurnOf = (player: PlayerId, step: GameState["turn"]["step"]) => (view: ControllerView): boolean =>
  view.state.turnOrder[view.state.turn.activePlayerIndex] === player && view.state.turn.step === step;

// --- the benchmarks --------------------------------------------------------

export const BOT_BENCHMARKS: readonly BotBenchmark[] = [
  {
    name: "two Rituals into Grave Titan",
    lookahead: "sequence",
    rule: "Two Swamps and two Dark Rituals make six mana: Ritual, Ritual, Grave Titan. Each Ritual alone leaves mana that empties unspent.",
    turns: 1,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Swamp", A, 2);
      inHand(game, A, "Dark Ritual", "Dark Ritual", "Grave Titan");
      return game;
    },
    judge: (state) => ({
      passed: controls(state, A, "Grave Titan").length > 0,
      detail: controls(state, A, "Grave Titan").length > 0 ? "Grave Titan is out" : "no Grave Titan",
    }),
    solution: { steps: [cast("Dark Ritual"), cast("Dark Ritual"), cast("Grave Titan")] },
    mistake: { steps: [cast("Dark Ritual")] },
  },
  {
    name: "Opt before the Bears finds the land drop",
    lookahead: "sequence",
    rule: "With an Island and a Forest and no land in hand, Opt first draws the Forest that pays for Grizzly Bears beside it; the Bears first leave Opt uncastable and the land drop unmade.",
    turns: 1,
    setup(registry) {
      const game = table(registry, A);
      onBoard(game, "Island", A);
      onBoard(game, "Forest", A);
      inHand(game, A, "Opt", "Grizzly Bears");
      return game;
    },
    judge(state) {
      const bears = controls(state, A, "Grizzly Bears").length > 0;
      const lands = controls(state, A, "Island", "Forest").length;
      return {
        passed: bears && lands === 3,
        detail: `${lands} lands, ${bears ? "Bears out" : "no Bears"}`,
      };
    },
    solution: { steps: [cast("Opt"), playLand("Forest"), cast("Grizzly Bears")] },
    mistake: { steps: [cast("Grizzly Bears")] },
  },
  {
    name: "the tapped land goes down on the turn with nothing to cast",
    lookahead: "next-turn",
    rule: "On two Forests holding Simic Guildgate, a Forest and Rumbling Baloth: the Guildgate now, the Forest next turn, and the Baloth comes down on four. The Forest first leaves three untapped next turn.",
    turns: 3,
    setup(registry) {
      // Alice draws Colossal Dreadmaws, so no land off the top rescues the
      // wrong order.
      const game = table(registry, A, { [A]: "Colossal Dreadmaw" });
      lands(game, "Forest", A, 2);
      inHand(game, A, "Simic Guildgate", "Forest", "Rumbling Baloth");
      return game;
    },
    judge: (state) => ({
      passed: controls(state, A, "Rumbling Baloth").length > 0,
      detail: controls(state, A, "Rumbling Baloth").length > 0 ? "Baloth is out" : "no Baloth",
    }),
    solution: { steps: [playLand("Simic Guildgate"), playLand("Forest"), cast("Rumbling Baloth")] },
    mistake: { steps: [playLand("Forest"), playLand("Simic Guildgate"), cast("Rumbling Baloth")] },
  },
  {
    name: "two Bolts to the face over two turns",
    lookahead: "next-turn",
    rule: "Bob is at 6 and Alice has one Mountain and two Lightning Bolts: one at his face now and one next turn is lethal. Bolting his Grizzly Bears, which can't kill Alice at 3 in time, wastes the win.",
    turns: 3,
    setup(registry) {
      const game = table(registry, A);
      onBoard(game, "Mountain", A);
      inHand(game, A, "Lightning Bolt", "Lightning Bolt");
      onBoard(game, "Grizzly Bears", B);
      lifeOf(game, A, 3);
      lifeOf(game, B, 6);
      return game;
    },
    judge: bobDead,
    solution: { steps: [cast("Lightning Bolt", () => B), cast("Lightning Bolt", () => B)] },
    mistake: {
      steps: [cast("Lightning Bolt", (view) => theirs(view, B, "Grizzly Bears")), cast("Lightning Bolt", () => B)],
    },
  },
  {
    name: "holds Fog rather than tapping out for a blocker",
    lookahead: "their-turn",
    rule: "At 3 life facing two 3/3s with three Forests: Centaur Courser blocks one and the other kills her, so the mana stays up for Fog on Bob's attack.",
    turns: 2,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Forest", A, 3);
      inHand(game, A, "Fog", "Centaur Courser");
      onBoard(game, "Hill Giant", B);
      onBoard(game, "Hill Giant", B);
      lifeOf(game, A, 3);
      return game;
    },
    judge: aliceAlive,
    solution: { steps: [cast("Fog", undefined, onTurnOf(B, "declare-attackers"))] },
    mistake: {
      steps: [cast("Centaur Courser")],
      block: (view) => {
        const courser = mine(view, "Centaur Courser")[0];
        const giant = theirs(view, B, "Hill Giant");
        return courser === undefined || giant === undefined ? [] : [{ blocker: courser, attacker: giant }];
      },
    },
  },
  {
    name: "Murder goes at the battle cry, not the biggest body",
    lookahead: "their-turn",
    rule: "At 10 facing Accorder Paladin, three Grizzly Bears and a Hill Giant: battle cry makes the swing 16, killing the Giant leaves 12, and only killing the 3/1 Paladin brings it under 10.",
    turns: 2,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Swamp", A, 3);
      inHand(game, A, "Murder");
      onBoard(game, "Accorder Paladin", B);
      for (let i = 0; i < 3; i += 1) onBoard(game, "Grizzly Bears", B);
      onBoard(game, "Hill Giant", B);
      lifeOf(game, A, 10);
      return game;
    },
    judge: aliceAlive,
    solution: { steps: [cast("Murder", (view) => theirs(view, B, "Accorder Paladin"))] },
    mistake: { steps: [cast("Murder", (view) => theirs(view, B, "Hill Giant"))] },
  },
  {
    name: "doesn't trade off the flier that's lethal next turn",
    lookahead: "next-turn",
    rule: "Bob, at 2 with no flier, attacks Alice at 3 with Grizzly Bears into her Wind Drake: take the 2, then the Drake swings for the win. Blocking trades it away for nothing.",
    turns: 2,
    setup(registry) {
      const game = table(registry, B);
      onBoard(game, "Wind Drake", A);
      const bears = onBoard(game, "Grizzly Bears", B);
      lifeOf(game, A, 3);
      lifeOf(game, B, 2);
      game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === B);
      game.dispatch({ type: "declare-attackers", player: B, attackers: [{ attacker: bears, defender: A }] });
      game.advanceUntil((s) => s.awaiting?.kind === "blockers" && s.awaiting.player === A);
      return game;
    },
    judge: bobDead,
    solution: { steps: [], attack: attackWith("Wind Drake") },
    mistake: {
      steps: [],
      attack: attackWith("Wind Drake"),
      block: (view) => {
        const drake = mine(view, "Wind Drake")[0];
        const bears = theirs(view, B, "Grizzly Bears");
        return drake === undefined || bears === undefined ? [] : [{ blocker: drake, attacker: bears }];
      },
    },
  },
  {
    name: "attacks with the flier before casting Wrath",
    lookahead: "combat",
    rule: "Three Craw Wurms will kill Alice next turn and Wrath of God answers them, but Air Elemental swings first: Bob takes 4 and the board is clear either way.",
    turns: 1,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Plains", A, 4);
      onBoard(game, "Air Elemental", A);
      inHand(game, A, "Wrath of God");
      for (let i = 0; i < 3; i += 1) onBoard(game, "Craw Wurm", B);
      lifeOf(game, A, 13);
      lifeOf(game, B, 8);
      return game;
    },
    judge(state) {
      const wurms = controls(state, B, "Craw Wurm").length;
      return {
        passed: life(state, B) <= 4 && wurms === 0 && !lost(state, A),
        detail: `bob at ${life(state, B)} with ${wurms} Craw Wurm(s)`,
      };
    },
    solution: {
      steps: [cast("Wrath of God", undefined, (view) => sorceryTime(view) && inStep("postcombat-main")(view))],
      attack: attackWith("Air Elemental"),
    },
    mistake: { steps: [cast("Wrath of God")], attack: attackWith("Air Elemental") },
  },
  {
    name: "Murder clears the blocker for a Giant Growth lethal",
    lookahead: "combat",
    rule: "Bob at 9 has a tapped Shivan Dragon and an untapped Grizzly Bears: Murder the Bears, swing both Coursers for 6, and Giant Growth the unblocked one for 9. Murdering the Dragon leaves him alive.",
    turns: 1,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Swamp", A, 3);
      onBoard(game, "Forest", A);
      onBoard(game, "Centaur Courser", A);
      onBoard(game, "Centaur Courser", A);
      inHand(game, A, "Murder", "Giant Growth");
      onBoard(game, "Shivan Dragon", B, true);
      onBoard(game, "Grizzly Bears", B);
      lifeOf(game, B, 9);
      return game;
    },
    judge: bobDead,
    solution: {
      steps: [
        cast("Murder", (view) => theirs(view, B, "Grizzly Bears")),
        cast("Giant Growth", (view) => mine(view, "Centaur Courser")[0], inStep("declare-blockers")),
      ],
      attack: attackWith("Centaur Courser"),
    },
    mistake: {
      steps: [
        cast("Murder", (view) => theirs(view, B, "Shivan Dragon")),
        cast("Giant Growth", (view) => mine(view, "Centaur Courser")[0], inStep("declare-blockers")),
      ],
      attack: attackWith("Centaur Courser"),
    },
  },
  {
    name: "steals the Wurm, swings with it, and sacrifices it",
    lookahead: "sequence",
    rule: "Act of Treason on Bob's Craw Wurm, attack him with it for 6, then feed it to Viscera Seer before it goes home: three moves, and the first alone hands it back at end of turn.",
    turns: 1,
    setup(registry) {
      const game = table(registry, A);
      lands(game, "Mountain", A, 3);
      onBoard(game, "Viscera Seer", A);
      inHand(game, A, "Act of Treason");
      onBoard(game, "Craw Wurm", B);
      return game;
    },
    judge(state) {
      const wurm = controls(state, B, "Craw Wurm").length > 0;
      return {
        passed: !wurm && life(state, B) <= 14,
        detail: `bob at ${life(state, B)}, ${wurm ? "Craw Wurm back with him" : "Craw Wurm gone"}`,
      };
    },
    solution: {
      steps: [
        cast("Act of Treason", (view) => theirs(view, B, "Craw Wurm")),
        (view) => {
          const seer = mine(view, "Viscera Seer")[0];
          const wurm = mine(view, "Craw Wurm")[0];
          if (!inStep("postcombat-main")(view) || seer === undefined || wurm === undefined) return null;
          return { type: "activate-ability", player: view.player, source: seer, abilityIndex: 0, sacrifice: wurm };
        },
      ],
      attack: attackWith("Craw Wurm"),
    },
    mistake: {
      steps: [cast("Act of Treason", (view) => theirs(view, B, "Craw Wurm"))],
      attack: attackWith("Craw Wurm"),
    },
  },
];

// --- running them ----------------------------------------------------------

export interface BenchmarkReport {
  readonly name: string;
  readonly rule: string;
  readonly lookahead: Lookahead;
  readonly passed: boolean;
  readonly detail: string;
  /** Wall clock for the whole play-out, nearly all of it Alice's search. */
  readonly ms: number;
}

/** The seats beside Alice: v2 on its defaults, what live rooms seat — v1's
 * blocks are loose enough (it lets a lethal attack through rather than chump)
 * that a mistake could win on them. */
const v2 = (player: PlayerId, registry: CardRegistry): PlayerController =>
  new EvalBotController(player, registry);

/**
 * Play `benchmark` out with `alice` in Alice's seat and `others` in the rest,
 * and judge where it ends.
 */
export function runBenchmark(
  benchmark: BotBenchmark,
  registry: CardRegistry,
  alice: (player: PlayerId, registry: CardRegistry) => PlayerController,
  others: (player: PlayerId, registry: CardRegistry) => PlayerController = v2,
): BenchmarkReport {
  const { name, rule, lookahead } = benchmark;
  const started = Date.now();
  try {
    const position = benchmark.setup(registry);
    const controllers: Record<PlayerId, PlayerController> = {};
    for (const player of position.state.turnOrder) {
      controllers[player] = player === A ? alice(player, registry) : others(player, registry);
    }
    const game = Game.fromSnapshot(position.state, { registry, controllers });
    const end = game.state.turn.number + benchmark.turns;
    game.advanceUntil((s) => s.turn.number >= end);
    return { name, rule, lookahead, ...benchmark.judge(game.state), ms: Date.now() - started };
  } catch (error) {
    const detail = `threw: ${String((error as Error)?.message ?? error)}`;
    return { name, rule, lookahead, passed: false, detail, ms: Date.now() - started };
  }
}

/** A scripted line in Alice's seat, as a bot factory for `runBenchmark`. */
export const playLine =
  (line: BenchmarkLine) =>
  (player: PlayerId): PlayerController =>
    new LineController(player, line);
