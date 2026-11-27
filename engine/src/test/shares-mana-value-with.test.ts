/**
 * `CardFilter.sharesManaValueWith` (rule 202.3): the same mana value as one
 * of a reference's objects, matching nothing when the reference names none —
 * Thought Prison's "whenever a player casts a spell that shares a color or
 * mana value with the exiled card", an `anyOf` beside `sharesColorWith`, both
 * over the card its imprint exiled (rule 607.2a).
 */
import { describe, expect, it } from "vitest";

import { A, cast, enter, lands, life, pickFromZone, pickModes, pickTargets, table, toHand, zone } from "./harness.js";
import { B } from "./harness.js";

describe("Thought Prison", () => {
  function imprintBolt() {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickModes(a, 0);
    pickFromZone(a, bolt);
    enter(game, "Thought Prison");
    return { game, a, bolt };
  }

  it("exiles a nonland card from the target player's revealed hand", () => {
    const { game, bolt } = imprintBolt();
    expect(zone(game, bolt)).toBe("exile");
  });

  it("deals 2 damage to a player casting a spell of the same mana value", () => {
    const { game } = imprintBolt();
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(life(game, A)).toBe(18);
  });

  it("deals 2 damage for a spell of the same color, and only 2 for both", () => {
    const { game } = imprintBolt();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Hill Giant"));
    expect(life(game, A)).toBe(18);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, A)).toBe(16);
  });

  it("ignores a spell sharing neither", () => {
    const { game } = imprintBolt();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(20);
  });

  it("with nothing exiled, nothing shares a mana value — not even a 0", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Thought Prison"); // The "may" declined.
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, A)).toBe(20);
    void a;
  });
});
