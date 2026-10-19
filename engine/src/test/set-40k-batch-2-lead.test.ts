/**
 * The set walk, Warhammer 40,000 Commander batch 2 (2026-10-19): what the lead added while
 * integrating — Cybernetica Datasmith, which the `create-token` target-controller fix unblocked.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, hand, ref, spawn, table, toLibrary, tokensNamed } from "./harness.js";

describe("Cybernetica Datasmith", () => {
  it("one target player draws, another creates the 4/4 Robot that can't block", () => {
    const { game } = table({ players: 3 });
    const smith = spawn(game, "Cybernetica Datasmith");
    spawn(game, "Island");
    toLibrary(game, "Island", C);
    const carols = hand(game, C).length;
    activate(game, smith, 0, { targets: [ref(B), ref(C)] });
    expect(hand(game, C).length).toBe(carols + 1);
    expect(tokensNamed(game, "Robot Token (Cybernetica Datasmith)", B)).toBe(1);
    expect(tokensNamed(game, "Robot Token (Cybernetica Datasmith)", A)).toBe(0);
  });

  it("can't name the same player twice", () => {
    const { game } = table({ players: 3 });
    const smith = spawn(game, "Cybernetica Datasmith");
    spawn(game, "Island");
    expect(() => activate(game, smith, 0, { targets: [ref(B), ref(B)] })).toThrow();
  });
});
