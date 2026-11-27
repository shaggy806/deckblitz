/**
 * An until-end-of-turn pump is only worth its mana where it can matter: in
 * combat, in the bot's own first main phase (setting up an attack), or in
 * answer to something on the stack. On seed 50 v2 spent every land and
 * Treasure in its upkeep on Lathliss, Dragon Queen's "+1/+0 until end of
 * turn" and cast nothing that turn (`effect-worth.ts`,
 * `temporaryEffectCanMatter`).
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { AutomaticController, HeuristicBotController } from "../controller.js";
import type { ControllerView } from "../controller.js";
import { onlyUntilEndOfTurn, temporaryEffectCanMatter } from "../effect-worth.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

/** Alice's turn at `step`, with Lathliss and eight untapped Mountains. */
function at(step: GameState["turn"]["step"]): Game {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxHandSize: 99, maxLandsPerTurn: 0 },
    controllers: { [A]: new AutomaticController(A), [B]: new AutomaticController(B) },
    decks: [
      { player: A, cards: Array(40).fill("Mountain") },
      { player: B, cards: Array(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === step && s.priority.holder === A);
  game.debugSpawn("Lathliss, Dragon Queen", A, "battlefield", { summoningSick: false });
  for (let i = 0; i < 8; i += 1) game.debugSpawn("Mountain", A, "battlefield");
  return game;
}

const viewOf = (game: Game): ControllerView => ({
  state: game.state,
  player: A,
  legalActions: () => game.legalActions(A),
});

const pumps = (game: Game) =>
  game.legalActions(A).filter((l) => l.kind === "activate-ability" && l.cardName === "Lathliss, Dragon Queen");

describe("until-end-of-turn pumps", () => {
  it("are read off the effect: a pump or a keyword grant, not a draw", () => {
    const lathliss = registry.get("Lathliss, Dragon Queen").activated?.[0];
    expect(onlyUntilEndOfTurn(lathliss?.effect)).toBe(true);
    expect(onlyUntilEndOfTurn(registry.get("Giant Growth").effect)).toBe(true);
    expect(onlyUntilEndOfTurn(registry.get("Divination").effect)).toBe(false);
  });

  it("are left alone in the upkeep, by v2 and v1", () => {
    const game = at("upkeep");
    expect(pumps(game)).not.toHaveLength(0);
    expect(temporaryEffectCanMatter(game.state, A)).toBe(false);
    expect(new EvalBotController(A, registry).act(viewOf(game)).type).toBe("pass-priority");
    expect(new HeuristicBotController(A, registry).act(viewOf(game)).type).toBe("pass-priority");
  });

  it("stay on offer in the first main phase and in answer to a spell", () => {
    const main = at("precombat-main");
    expect(temporaryEffectCanMatter(main.state, A)).toBe(true);
    const upkeep = at("upkeep");
    const bolt = upkeep.debugSpawn("Lightning Bolt", B, "hand");
    upkeep.debugSpawn("Mountain", B, "battlefield");
    upkeep.dispatch({ type: "pass-priority", player: A });
    upkeep.dispatch({ type: "cast-spell", player: B, card: bolt, targets: [{ kind: "player", player: A }] });
    upkeep.advanceUntil((s) => s.priority.holder === A);
    expect(temporaryEffectCanMatter(upkeep.state, A)).toBe(true);
  });

  it("holds mana through its own upkeep for the main phase", () => {
    // Scavenging Ooze's exile is a lasting effect, so the pump gate doesn't
    // cover it; spending the upkeep's mana on it is still mana the main
    // phase's spells can't have (seed 50).
    const game = at("upkeep");
    game.debugSpawn("Scavenging Ooze", A, "battlefield", { summoningSick: false });
    game.debugSpawn("Forest", A, "battlefield");
    game.debugSpawn("Grizzly Bears", B, "graveyard");
    const ooze = game
      .legalActions(A)
      .filter((l) => l.kind === "activate-ability" && l.cardName === "Scavenging Ooze");
    expect(ooze).not.toHaveLength(0);
    expect(new EvalBotController(A, registry).act(viewOf(game)).type).toBe("pass-priority");
    expect(new HeuristicBotController(A, registry).act(viewOf(game)).type).toBe("pass-priority");
  });
});

/** v1, with its pump gate open to the test. */
class Gate extends HeuristicBotController {
  wasted(state: GameState, offer: Parameters<HeuristicBotController["wastedNow"]>[1]): boolean {
    return this.wastedNow(state, offer);
  }
}

/** Bob's upkeep, Alice holding priority with Slicer, Hired Muscle's own
 * "hand it over" trigger on the stack, Umezawa's Jitte on Slicer with four
 * charge counters. */
function slicerHandedOver(): { readonly game: Game; readonly slicer: ObjectId } {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxHandSize: 99, maxLandsPerTurn: 0 },
    controllers: { [A]: new AutomaticController(A), [B]: new AutomaticController(B) },
    decks: [
      { player: A, cards: Array(40).fill("Mountain") },
      { player: B, cards: Array(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  const slicer = game.debugSpawn("Slicer, Hired Muscle", A, "battlefield", { summoningSick: false });
  const jitte = game.debugSpawn("Umezawa's Jitte", A, "battlefield");
  game.state.objects[jitte].attachedTo = slicer;
  game.state.objects[jitte].counters = { charge: 4 };
  game.advanceUntil(
    (s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length > 0,
  );
  return { game, slicer };
}

const jittePump = (game: Game) =>
  game
    .legalActions(A)
    .find((l) => l.kind === "activate-ability" && l.cardName === "Umezawa's Jitte" && l.modes?.[0] === 0);

describe("a modal ability's until-end-of-turn mode (Umezawa's Jitte)", () => {
  // Kept game THRQJ-1 (2026-11-27): in the last opponent's upkeep, with
  // Slicer's own trigger on the stack, the bot spent all ten of the Jitte's
  // counters on +2/+2 for the Slicer it then handed over, goaded, to attack
  // itself. The modal offer's effect wasn't read, and the trigger counted as
  // something to answer.
  it("is read as the chosen mode, and left alone with only our own quiet trigger on the stack", () => {
    const { game } = slicerHandedOver();
    expect(game.state.zones.shared.stack).toHaveLength(1);
    const pump = jittePump(game);
    expect(pump).toBeDefined();
    expect(new Gate(A, registry).wasted(game.state, pump!)).toBe(true);
  });

  it("stays on offer with a spell on the stack that hurts the creature", () => {
    // Any spell counts as something to answer, ours included (a pump to
    // survive our own Blasphemous Act): here a Bolt at Slicer above the
    // trigger.
    const { game, slicer } = slicerHandedOver();
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    game.debugSpawn("Mountain", A, "battlefield");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "object", object: slicer }] });
    game.advanceUntil((s) => s.priority.holder === A);
    const pump = jittePump(game);
    expect(game.state.zones.shared.stack.some((id) => game.state.objects[id]?.cardName === "Lightning Bolt")).toBe(true);
    expect(pump).toBeDefined();
    expect(new Gate(A, registry).wasted(game.state, pump!)).toBe(false);
  });
});

describe("a pump of power and toughness alone", () => {
  // A decision diff, 2026-11-27: with our own attack searched in the
  // rollouts, Lathliss, Dragon Queen's "+1/+0 until end of turn" went off in
  // the first main phase for the attack it would show. Made after blocks it
  // does as much, and gives nothing away first.
  it("waits through the first main phase and the steps before blocks", () => {
    const gate = new Gate(A, registry);
    for (const step of ["precombat-main", "begin-combat"] as const) {
      const game = at(step);
      const pump = pumps(game)[0];
      expect(pump).toBeDefined();
      expect(gate.wasted(game.state, pump)).toBe(true);
    }
  });

  it("is still made in answer to a spell", () => {
    const game = at("precombat-main");
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    const lathliss = game.state.zones.shared.battlefield.find((id) => game.state.objects[id]?.cardName === "Lathliss, Dragon Queen");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "object", object: lathliss! }] });
    game.advanceUntil((s) => s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBeGreaterThan(0);
    expect(new Gate(A, registry).wasted(game.state, pumps(game)[0])).toBe(false);
  });
});
