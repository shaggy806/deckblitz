/**
 * "Whenever you and/or at least one permanent you control becomes the target
 * of a spell or ability an opponent controls" (Leyline of Combustion): a
 * `batched` becomes-target watcher triggers once per spell or ability,
 * however many of you and your permanents it targets (the card's ruling;
 * rule 603.2c) — where Thunderbreak Regent's "a Dragon you control" triggers
 * once per Dragon.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Leyline of Combustion", () => {
  it("triggers once for a spell that targets you and a permanent you control", () => {
    const { game } = table();
    spawn(game, "Leyline of Combustion");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Arc Trail", B), { player: B, targets: [ref(bears), ref(A)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });

  it("triggers once for a spell that targets two of your permanents", () => {
    const { game } = table();
    spawn(game, "Leyline of Combustion");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Arc Trail", B), { player: B, targets: [ref(bears), ref(other)] });
    expect(life(game, B)).toBe(18);
  });

  it("triggers for an ability that targets you, and again for each later spell", () => {
    const { game } = table();
    spawn(game, "Leyline of Combustion");
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    nextTurn(game); // bob's
    activate(game, pyromancer, 0, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, B)).toBe(16);
  });

  it("doesn't trigger for your own spell, or for an opponent's that targets only their own things", () => {
    const { game } = table();
    spawn(game, "Leyline of Combustion");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Arc Trail"), { targets: [ref(bears), ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Arc Trail", B), { player: B, targets: [ref(theirs), ref(B)] });
    expect(life(game, B)).toBe(19);
  });

  it("an unbatched watcher still triggers once per permanent: Thunderbreak Regent, two Dragons", () => {
    const { game } = table();
    const regent = spawn(game, "Thunderbreak Regent");
    const second = spawn(game, "Thunderbreak Regent");
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    // Each Regent sees both Dragons targeted: four triggers of 3.
    cast(game, toHand(game, "Arc Trail", B), { player: B, targets: [ref(regent), ref(second)] });
    expect(life(game, B)).toBe(8);
  });
});
