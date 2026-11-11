/**
 * "Whenever this creature becomes the target of a spell or ability for the
 * first time each turn, counter that spell or ability" — the `ward` effect
 * with `cost: null` (ward's counter with nothing to pay, rule 701.6a) on a
 * `becomes-target` trigger with `firstTimeEachTurn`: printed (Shimmering
 * Glasskite) and granted to each creature you control (Kira, Great
 * Glass-Spinner), each creature counting its own targetings, anyone's, from
 * before it had the ability too.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, nextTurn, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Shimmering Glasskite", () => {
  it("counters the first spell to target it each turn, nobody asked, and not the second", () => {
    const { game } = table();
    const kite = spawn(game, "Shimmering Glasskite");
    nextTurn(game); // bob's
    lands(game, "Mountain", 2, B);
    const first = toHand(game, "Lightning Bolt", B);
    cast(game, first, { player: B, targets: [ref(kite)] });
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, kite)).toBe("battlefield");
    expect(game.state.objects[kite].damageMarked).toBe(0);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(kite)] });
    expect(zone(game, kite)).toBe("graveyard");
  });

  it("counts again the next turn, and counters its controller's own spell", () => {
    const { game } = table();
    const kite = spawn(game, "Shimmering Glasskite");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(kite)] });
    expect(pt(game, kite)).toEqual({ power: 2, toughness: 3 });
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(kite)] });
    expect(pt(game, kite)).toEqual({ power: 5, toughness: 6 });
    nextTurn(game); // bob's: the first this turn
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(kite)] });
    expect(zone(game, kite)).toBe("battlefield");
    expect(game.state.objects[kite].damageMarked).toBe(0);
  });

  it("counters an ability that targets it", () => {
    const { game } = table();
    const kite = spawn(game, "Shimmering Glasskite");
    nextTurn(game); // bob's
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    activate(game, pyromancer, 0, { player: B, targets: [ref(kite)] });
    expect(game.state.objects[kite].damageMarked).toBe(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("a spell aimed elsewhere isn't touched", () => {
    const { game } = table();
    spawn(game, "Shimmering Glasskite");
    nextTurn(game); // bob's
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
  });
});

describe("Kira, Great Glass-Spinner", () => {
  it("gives each creature you control the ability, each counting its own first targeting", () => {
    const { game } = table();
    const kira = spawn(game, "Kira, Great Glass-Spinner");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game); // bob's
    lands(game, "Mountain", 4, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    // Kira's own first: countered too.
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(kira)] });
    expect(zone(game, kira)).toBe("battlefield");
    // The Bears' second this turn resolves.
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // An opponent's creature has no such ability.
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("does nothing for a creature already targeted this turn before Kira arrived", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    spawn(game, "Kira, Great Glass-Spinner");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });

  it("stops granting once Kira is gone", () => {
    const { game } = table();
    const kira = spawn(game, "Kira, Great Glass-Spinner");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 3, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(kira)] });
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(kira)] });
    expect(zone(game, kira)).toBe("graveyard");
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});
