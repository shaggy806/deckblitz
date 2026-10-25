/**
 * Engine rules gaps closed 2026-10-25 (`docs/engine-gaps.md`), each with the
 * card that shows it. Written from the Comprehensive Rules and the cards'
 * rulings, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, nextTurn, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

describe("a granted ability's dynamic target filter reads the creature that has it", () => {
  it("Firja's Retribution: an Angel destroys only a creature with less power than its own", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    const saga = toHand(game, "Firja's Retribution");
    cast(game, saga);
    expect(tokensNamed(game, "Angel Warrior Token (Flying, Vigilance)")).toBe(1);
    const angel = spawn(game, "Serra Angel");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    // Serra Angel is 4/4: Craw Wurm's 6 power isn't less than this
    // creature's power, though the Saga has none at all.
    expect(() => activate(game, angel, 0, { targets: [ref(wurm)] })).toThrow();
    activate(game, angel, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    void A;
  });
});
