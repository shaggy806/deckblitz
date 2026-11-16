/**
 * `opposingCommander` / `opposingTokenEngines` and `bot/aim.ts`: what a
 * removal's aim at an opponent's commander and token makers is worth, where
 * one removal chooses among its targets. Not evaluation terms, and off by
 * default; `bot:judge --kind removal` is what says their worth.
 */

import { describe, expect, it } from "vitest";

import { aimPremium, removesATarget } from "../bot/aim.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { DEFAULT_WEIGHTS, evaluateState } from "../bot/evaluate.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();
const deck = (player: typeof A) => ({ player, cards: Array<string>(40).fill("Forest") });
const obj = (id: ObjectId): TargetRef => ({ kind: "object", object: id });

/** Bob with a 2/2 commander and a Craw Wurm, Alice to act. */
function table(): { game: Game; commander: ObjectId; wurm: ObjectId } {
  const game = Game.create({ seed: 3, registry, decks: [deck(A), deck(B)] });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  const commander = game.debugSpawn("Grizzly Bears", B, "battlefield", { summoningSick: false });
  game.state.objects[commander].isCommander = true;
  const wurm = game.debugSpawn("Craw Wurm", B, "battlefield", { summoningSick: false });
  return { game, commander, wurm };
}

describe("the premium on a removal's aim", () => {
  it("is off by default, and no term of the evaluation", () => {
    expect(DEFAULT_WEIGHTS.opposingCommander).toBe(0);
    expect(DEFAULT_WEIGHTS.opposingTokenEngines).toBe(0);
    const { game } = table();
    const premium = { ...DEFAULT_WEIGHTS, opposingCommander: 5, opposingTokenEngines: 4 };
    for (const seat of [A, B]) {
      expect(evaluateState(game.state, registry, seat, premium)).toBe(evaluateState(game.state, registry, seat, DEFAULT_WEIGHTS));
    }
  });

  it("reads a removal off the card", () => {
    expect(removesATarget(registry.get("Murder"))).toBe(true);
    expect(removesATarget(registry.get("Ravenous Chupacabra"))).toBe(true);
    expect(removesATarget(registry.get("Giant Growth"))).toBe(false);
    expect(removesATarget(registry.get("Grizzly Bears"))).toBe(false);
  });

  it("is the commander's for a removal aimed at an opponent's commander, and nothing else's", () => {
    const { game, commander, wurm } = table();
    const w = { ...DEFAULT_WEIGHTS, opposingCommander: 5 };
    const at = (source: string, id: ObjectId, me = A) => aimPremium(game.state, registry, w, me, source, [obj(id)]);
    expect(at("Murder", commander)).toBe(5);
    expect(at("Murder", wurm)).toBe(0);
    // Our own commander is no target for the premium, and a pump is no removal.
    expect(at("Murder", commander, B)).toBe(0);
    expect(at("Giant Growth", commander)).toBe(0);
    expect(aimPremium(game.state, registry, DEFAULT_WEIGHTS, A, "Murder", [obj(commander)])).toBe(0);
  });

  it("counts a token maker by the tokens it makes a round", () => {
    const { game } = table();
    const hero = game.debugSpawn("Hero of Bladehold", B, "battlefield", { summoningSick: false });
    const w = { ...DEFAULT_WEIGHTS, opposingTokenEngines: 2 };
    expect(aimPremium(game.state, registry, w, A, "Murder", [obj(hero)])).toBeGreaterThan(0);
  });

  it("turns a trigger's removal from the bigger creature to the commander", () => {
    const aimed = (weights: typeof DEFAULT_WEIGHTS): ObjectId | undefined => {
      const { game } = table();
      game.debugSpawn("Ravenous Chupacabra", A, "battlefield", { announceEntry: true });
      game.advanceUntil((s) => s.awaiting !== null || s.result.over);
      expect(game.state.awaiting?.kind).toBe("choose-targets");
      const action = new EvalBotController(A, registry, { weights }).act(game.controllerView(A));
      const target = action.type === "choose-targets" ? action.targets[0] : null;
      return target?.kind === "object" ? (game.state.objects[target.object]?.cardName as unknown as ObjectId) : undefined;
    };
    // The evaluation alone takes the Craw Wurm; a premium past the gap takes
    // the commander.
    expect(aimed(DEFAULT_WEIGHTS)).toBe("Craw Wurm");
    expect(aimed({ ...DEFAULT_WEIGHTS, opposingCommander: 20 })).toBe("Grizzly Bears");
  });
});
