/**
 * The `modal` effect's `exactlyIf`: "choose one. If [condition], choose both
 * instead" (Prophetic Titan's delirium) — exactly that many modes while the
 * condition holds as the modes are chosen (rule 700.2b), and not checked again
 * as the ability resolves (the card's ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, graveyard, hand, life, pickModes, pickTargets, ref, settle, table, toGraveyard, toLibrary } from "./harness.js";

function titanEnters(game: Game): { min: number; max: number } {
  game.debugSpawn("Prophetic Titan", A, "battlefield", { announceEntry: true, summoningSick: false });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || (s.zones.shared.stack.length === 0 && s.awaiting === null));
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error("no mode choice");
  return { min: awaiting.minModes, max: awaiting.maxModes };
}

describe("Prophetic Titan", () => {
  it("without delirium: choose one", () => {
    const { game, a } = table();
    for (let i = 0; i < 4; i++) toLibrary(game, "Wastes");
    toGraveyard(game, "Grizzly Bears");
    expect(titanEnters(game)).toEqual({ min: 1, max: 1 });
    pickModes(a, 0);
    pickTargets(a, B);
    settle(game);
    expect(life(game, B)).toBe(16);
  });

  it("with four card types in your graveyard: both modes, and emptying the graveyard in response changes nothing", () => {
    const { game, a } = table();
    const cards = ["Grizzly Bears", "Lightning Bolt", "Divination", "Forest"].map((name) => toGraveyard(game, name));
    toLibrary(game, "Hill Giant");
    for (let i = 0; i < 3; i++) toLibrary(game, "Wastes");
    expect(titanEnters(game)).toEqual({ min: 2, max: 2 });
    pickModes(a, 0, 1);
    pickTargets(a, B);
    // Delirium is gone by the time it resolves; both modes still happen.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.awaiting?.kind !== "choose-modes" && s.awaiting?.kind !== "choose-targets");
    for (const id of cards) game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(id)]);
    expect(graveyard(game).length).toBe(0);
    const before = hand(game).length;
    settle(game);
    expect(graveyard(game).length).toBe(0);
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before + 1);
  });
});
