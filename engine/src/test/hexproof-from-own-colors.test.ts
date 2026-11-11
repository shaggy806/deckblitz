/**
 * "Hexproof from each of its colors" (`hexproofFrom.ownColors`, rules 702.11d
 * and 702.11g — Tam, Mindful First-Year): each affected creature has hexproof
 * from the colours it is now, read after layer 5, so Tam's own "becomes all
 * colors" widens it and a colourless creature has none (rule 105.2c).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, activate, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

/** Alice's Tam out, on her turn; Bob holding priority with a land of each kind. */
const setUp = () => {
  const t = table();
  const tam = spawn(t.game, "Tam, Mindful First-Year");
  lands(t.game, "Island", 2, B);
  lands(t.game, "Mountain", 2, B);
  return { ...t, tam };
};
const toBob = (game: Game): void => {
  game.dispatch({ type: "pass-priority", player: A });
};

describe("Tam, Mindful First-Year", () => {
  it("a red creature has hexproof from red, and not from blue", () => {
    const { game } = setUp();
    const piker = spawn(game, "Goblin Piker");
    toBob(game);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(piker)] })).toThrow();
    cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(piker)] });
    expect(zone(game, piker)).toBe("hand");
  });

  it("stops an ability from a source of its color", () => {
    const { game } = setUp();
    const piker = spawn(game, "Goblin Piker");
    const bears = spawn(game, "Grizzly Bears");
    const pinger = spawn(game, "Prodigal Pyromancer", B);
    toBob(game);
    expect(() => activate(game, pinger, 0, { player: B, targets: [ref(piker)] })).toThrow();
    activate(game, pinger, 0, { player: B, targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });

  it("doesn't cover Tam herself, a colorless creature, or an opponent's creature", () => {
    const { game, tam } = setUp();
    const thopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Goblin Piker", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    toBob(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
    // Tam is green and blue.
    toBob(game);
    cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(tam)] });
    expect(zone(game, tam)).toBe("hand");
  });

  it("its controller's own spell of that color can target it", () => {
    const { game } = setUp();
    const piker = spawn(game, "Goblin Piker");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(piker)] });
    expect(zone(game, piker)).toBe("graveyard");
  });

  it("made all colors, a creature has hexproof from each color until end of turn", () => {
    const { game, tam } = setUp();
    const piker = spawn(game, "Goblin Piker");
    const thopter = spawn(game, "Ornithopter");
    activate(game, tam, 0, { targets: [ref(thopter)] });
    toBob(game);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(thopter)] })).toThrow();
    expect(() => cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(thopter)] })).toThrow();
    // The Piker is still only red.
    cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(piker)] });
    expect(zone(game, piker)).toBe("hand");
  });
});
