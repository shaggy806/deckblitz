/**
 * Modern Horizons 2 / Commander 2021, batch 1 group d — the cards whose
 * behaviour is more than a stat line or an exact copy of a tested pattern.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

describe("Sproutback Trudge", () => {
  it("is cast from the graveyard at your end step after you gained life, costing {X} less", () => {
    const { game, a } = table();
    const trudge = toGraveyard(game, "Sproutback Trudge");
    spawn(game, "Plains");
    lands(game, "Forest", 4); // {7}{G}{G} less 5: {2}{G}{G}, all it can pay
    cast(game, toHand(game, "Chaplain's Blessing"));
    expect(life(game)).toBe(25);
    let offered = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offered += 1;
      const way = offer.casts.find((c) => c.card === trudge);
      return way === undefined ? null : { type: "cast-spell", player: A, card: trudge, targets: [], via: way.via };
    };
    toStep(game, "end");
    settle(game);
    expect(offered).toBe(1);
    expect(zone(game, trudge)).toBe("battlefield");
  });

  it("doesn't trigger when you gained no life this turn", () => {
    const { game, a } = table();
    const trudge = toGraveyard(game, "Sproutback Trudge");
    lands(game, "Forest", 9);
    let offered = 0;
    a.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    toStep(game, "end");
    settle(game);
    expect(offered).toBe(0);
    expect(zone(game, trudge)).toBe("graveyard");
  });
});

describe("Piru, the Volatile", () => {
  it("deals 7 to each nonlegendary creature as it dies, and its lifelink gains the life", () => {
    const { game } = table();
    const piru = spawn(game, "Piru, the Volatile");
    const bears = spawn(game, "Grizzly Bears", B);
    const tivash = spawn(game, "Tivash, Gloom Summoner", B);
    destroy(game, piru);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, tivash)).toBe("battlefield");
    expect(life(game)).toBe(27);
  });
});

describe("Steel Dromedary", () => {
  it("enters tapped with two counters, stays tapped while it has one, and moves them at combat", () => {
    const { game, a } = table();
    const camel = enter(game, "Steel Dromedary");
    expect(game.state.objects[camel].tapped).toBe(true);
    expect(counters(game, camel)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, camel)).toBe(1);
    expect(counters(game, bears)).toBe(1);

    toStep(game, "upkeep");
    expect(game.state.objects[camel].tapped).toBe(true); // still has a counter
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, camel)).toBe(0);
    expect(counters(game, bears)).toBe(2);

    toStep(game, "upkeep");
    expect(game.state.objects[camel].tapped).toBe(false);
  });
});

describe("Tivash, Gloom Summoner", () => {
  it("pays X life, X the life gained this turn, for an X/X flying Demon", () => {
    const { game, a } = table();
    spawn(game, "Tivash, Gloom Summoner");
    spawn(game, "Plains");
    cast(game, toHand(game, "Chaplain's Blessing"));
    expect(life(game)).toBe(25);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(20);
    const [demon] = named(game, "X/X Demon Token (Flying)", A);
    expect(pt(game, demon)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, demon).has("flying")).toBe(true);
  });
});

describe("Glinting Creeper", () => {
  it("enters with two +1/+1 counters for each colour spent", () => {
    const { game } = table();
    spawn(game, "Island");
    spawn(game, "Swamp");
    lands(game, "Forest", 3);
    const creeper = toHand(game, "Glinting Creeper");
    cast(game, creeper);
    expect(zone(game, creeper)).toBe("battlefield");
    expect(counters(game, creeper)).toBe(6);
  });
});

describe("Unholy Heat", () => {
  it("deals 2, or 6 with delirium", () => {
    const { game } = table();
    const tivash = spawn(game, "Tivash, Gloom Summoner", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Unholy Heat"), { targets: [ref(tivash)] });
    expect(zone(game, tivash)).toBe("battlefield");
    expect(game.state.objects[tivash].damageMarked).toBe(2);

    // Land, creature, instant (the first Heat), artifact: four types.
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    const other = spawn(game, "Tivash, Gloom Summoner", B);
    cast(game, toHand(game, "Unholy Heat"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Mystic Redaction", () => {
  it("mills each opponent two for each card you discard", () => {
    const { game } = table();
    spawn(game, "Mystic Redaction");
    spawn(game, "Mountain");
    const before = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Faithless Looting"));
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 4);
    expect(graveyard(game, B).length).toBe(4);
  });
});

describe("Specimen Collector", () => {
  it("makes a Squirrel and a Crab, and copies a token you control as it dies", () => {
    const { game, a } = table();
    const collector = enter(game, "Specimen Collector");
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(1);
    const [crab] = named(game, "Crab Token", A);
    expect(pt(game, crab)).toEqual({ power: 0, toughness: 3 });
    pickTargets(a, crab);
    destroy(game, collector);
    expect(tokensNamed(game, "Crab Token", A)).toBe(2);
  });
});

describe("Caprichrome", () => {
  it("devours only the artifacts chosen", () => {
    const { game, a } = table();
    const first = spawn(game, "Ornithopter");
    const second = spawn(game, "Ornithopter");
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const seen = pickPermanents(a, first);
    const goat = toHand(game, "Caprichrome");
    cast(game, goat);
    expect(seen.offered).toHaveLength(2); // the artifacts, not the Bears
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("battlefield");
    expect(counters(game, goat)).toBe(1);
  });
});
