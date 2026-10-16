/**
 * Recheck batch 88, part c (2026-10-16): Desert Warfare, unblocked by the
 * delayed trigger that keeps the creating ability's trigger object (rule
 * 400.7) and by tokens that gain a keyword as they're made, on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, keywords, lands, nextTurn, ref, settle, spawn, table, toHand, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

const DESERT = "Desert of the True";

/** Alice's next end step, with everything there resolved. */
const toYourEndStep = (game: Game): void => {
  nextTurn(game);
  toStep(game, "end");
  settle(game);
};

describe("Desert Warfare", () => {
  it("puts a Desert milled from your library onto the battlefield at your next end step", () => {
    const { game } = table();
    spawn(game, "Desert Warfare");
    const desert = toLibrary(game, DESERT);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, desert)).toBe("graveyard");
    toYourEndStep(game);
    expect(zone(game, desert)).toBe("battlefield");
    expect(game.state.objects[desert].controller).toBe(A);
  });

  it("doesn't once the Desert has left the graveyard (the first ruling)", () => {
    const { game } = table();
    spawn(game, "Desert Warfare");
    const desert = toLibrary(game, DESERT);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(desert)]);
    toYourEndStep(game);
    expect(zone(game, desert)).toBe("exile");
  });

  it("returns a sacrificed Desert, and a Desert cycled from your hand", () => {
    const { game } = table();
    spawn(game, "Desert Warfare");
    const sacrificed = spawn(game, DESERT);
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(sacrificed)]);
    settle(game);
    expect(zone(game, sacrificed)).toBe("graveyard");
    lands(game, "Plains", 2);
    const cycled = toHand(game, DESERT);
    game.dispatch({ type: "cycle", player: A, card: cycled });
    settle(game);
    expect(zone(game, cycled)).toBe("graveyard");
    toYourEndStep(game);
    expect(zone(game, sacrificed)).toBe("battlefield");
    expect(zone(game, cycled)).toBe("battlefield");
  });

  it("ignores a land that isn't a Desert", () => {
    const { game } = table();
    spawn(game, "Desert Warfare");
    const plains = toLibrary(game, "Plains");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    toYourEndStep(game);
    expect(zone(game, plains)).toBe("graveyard");
  });

  it("makes a hasty Sand Warrior per Desert at combat, with five or more", () => {
    const { game } = table();
    spawn(game, "Desert Warfare");
    for (let i = 0; i < 4; i += 1) spawn(game, DESERT);
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Sand Warrior Token", A)).toBe(0);
    spawn(game, DESERT);
    nextTurn(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Sand Warrior Token", A)).toBe(5);
    const warrior = game.battlefield.find((id: ObjectId) => game.state.objects[id].cardName === "Sand Warrior Token");
    expect(keywords(game, warrior!).has("haste")).toBe(true);
  });
});
