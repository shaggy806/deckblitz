/**
 * "Protection from each of its colors" (`protection.ownColors`, rule 702.16a
 * — Earnest Fellowship): each affected creature has protection from the
 * colours it is now, read after layer 5 (rule 613.1f), so a colourless
 * creature has none (rule 105.2c) and one that changes colour changes with it.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Earnest Fellowship", () => {
  it("a red creature can't be targeted by a red spell, but can by a blue one", () => {
    const { game } = table();
    spawn(game, "Earnest Fellowship", B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const piker = spawn(game, "Goblin Piker");
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(piker)] })).toThrow();
    cast(game, toHand(game, "Unsummon"), { targets: [ref(piker)] });
    expect(zone(game, piker)).toBe("hand");
  });

  it("a colourless creature has no protection", () => {
    const { game } = table();
    spawn(game, "Earnest Fellowship");
    lands(game, "Mountain", 1);
    const memnite = spawn(game, "Memnite");
    cast(game, toHand(game, "Shock"), { targets: [ref(memnite)] });
    expect(zone(game, memnite)).toBe("graveyard");
  });

  it("damage from a source of its colour is prevented, other damage isn't", () => {
    const { game } = table();
    spawn(game, "Earnest Fellowship");
    lands(game, "Mountain", 3);
    const piker = spawn(game, "Goblin Piker", B);
    const bears = spawn(game, "Grizzly Bears", B);
    // Pyroclasm doesn't target: 2 to each creature, prevented on the red one.
    cast(game, toHand(game, "Pyroclasm", A));
    expect(zone(game, piker)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an Aura of the creature's colour falls off", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    const lions = spawn(game, "Savannah Lions", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(lions)] });
    expect(zone(game, pacifism)).toBe("battlefield");
    spawn(game, "Earnest Fellowship");
    // Any spell resolving gives the state-based check its turn (rule 704.5m).
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
  });

  it("a white Aura can't target a white creature", () => {
    const { game } = table();
    spawn(game, "Earnest Fellowship");
    lands(game, "Plains", 2);
    const lions = spawn(game, "Savannah Lions", B);
    expect(() => cast(game, toHand(game, "Pacifism"), { targets: [ref(lions)] })).toThrow();
  });
});
