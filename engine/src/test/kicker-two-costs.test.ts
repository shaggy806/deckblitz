import { describe, expect, it } from "vitest";

import { A, B, cast, counters, hand, keywords, lands, life, pickPermanents, pickTargets, pt, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

// Two kicker costs (rule 702.33b: "Kicker [cost 1] and/or [cost 2]" means
// "Kicker [cost 1], kicker [cost 2]"): `kicker.second`, offered as the first
// (`kickCount` 1), the second (2) or both (3); "if it was kicked with its [A]
// kicker" (702.33f) is `self-kicked`'s `with`, and "kicked twice" `"both"`.

describe("two kicker costs", () => {
  it("offers the first, the second and both, each priced", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const card = toHand(game, "Anavolver");
    const offers = game
      .legalActions(A)
      .filter((o) => o.kind === "cast-spell" && o.card === card)
      .map((o) => (o.kind === "cast-spell" ? [o.kicked === true, o.kickCount, o.kickerCost] : null));
    expect(offers).toEqual(
      expect.arrayContaining([
        [false, undefined, undefined],
        [true, 1, "{1}{U}"],
        [true, 2, "{B}"],
        [true, 3, "{1}{U}{B}"],
      ]),
    );
    expect(offers).toHaveLength(4);
  });

  it("drops a variant whose kicker can't be paid", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Swamp", 1);
    const card = toHand(game, "Anavolver");
    const kicks = game
      .legalActions(A)
      .filter((o) => o.kind === "cast-spell" && o.card === card && o.kicked === true)
      .map((o) => (o.kind === "cast-spell" ? o.kickCount : null));
    expect(kicks).toEqual([2]);
  });

  it("Anavolver kicked with {1}{U}: two counters and flying, no regeneration", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    const card = toHand(game, "Anavolver");
    cast(game, card, { kicked: true, kickCount: 1 });
    expect(zone(game, card)).toBe("battlefield");
    expect(counters(game, card)).toBe(2);
    expect(keywords(game, card).has("flying")).toBe(true);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === card)).toBe(false);
  });

  it("Anavolver kicked with both: three counters, flying and Pay 3 life: Regenerate", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const card = toHand(game, "Anavolver");
    cast(game, card, { kicked: true, kickCount: 3 });
    expect(pt(game, card)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, card).has("flying")).toBe(true);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === card)).toBe(true);
  });

  it("Illuminate kicked with {2}{R} only: X to the creature and its controller, no draw", () => {
    const { game, a } = table();
    lands(game, "Mountain", 8);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const before = hand(game).length;
    cast(game, toHand(game, "Illuminate"), { targets: [ref(bear)], x: 2, kicked: true, kickCount: 1 });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
  });

  it("Illuminate kicked with both: damage, damage to the controller, and X cards", () => {
    const { game, a } = table();
    lands(game, "Mountain", 8);
    lands(game, "Island", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const before = hand(game).length;
    cast(game, toHand(game, "Illuminate"), { targets: [ref(bear)], x: 2, kicked: true, kickCount: 3 });
    expect(life(game, B)).toBe(18);
    // The cast card left the hand; two were drawn.
    expect(hand(game).length).toBe(before + 2);
  });

  it("Archangel of Wrath kicked twice deals 2 damage twice; kicked once, once", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Archangel of Wrath"), { kicked: true, kickCount: 3 });
    expect(life(game, B)).toBe(16);

    const second = table();
    lands(second.game, "Plains", 4);
    lands(second.game, "Mountain", 1);
    pickTargets(second.a, B);
    cast(second.game, toHand(second.game, "Archangel of Wrath"), { kicked: true, kickCount: 2 });
    expect(life(second.game, B)).toBe(18);
  });

  it("Vodalian Mindsinger: two counters for each kicker paid", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const card = toHand(game, "Vodalian Mindsinger");
    cast(game, card, { kicked: true, kickCount: 3 });
    expect(counters(game, card)).toBe(4);
  });

  it("Stronghold Arena gains 3 life for each time it was kicked", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Stronghold Arena"), { kicked: true, kickCount: 3 });
    expect(life(game, A)).toBe(26);
  });

  it("Temporal Firestorm kicked once phases out one creature, then 5 to each", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    lands(game, "Plains", 2);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, mine);
    cast(game, toHand(game, "Temporal Firestorm"), { kicked: true, kickCount: 1 });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("phased-out");
    expect(seen.offered).toContain(mine);
  });

  it("a creature copy isn't kicked: Anavolver put onto the battlefield is a 3/3", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    const card = spawn(game, "Anavolver", A);
    expect(pt(game, card)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, card).has("flying")).toBe(false);
  });
  it("Wastescape Battlemage kicked with {1}{U} only: its cast trigger bounces, the {G} one doesn't fire", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    lands(game, "Island", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    cast(game, toHand(game, "Wastescape Battlemage"), { kicked: true, kickCount: 2 });
    expect(zone(game, bear)).toBe("hand");
  });
});
