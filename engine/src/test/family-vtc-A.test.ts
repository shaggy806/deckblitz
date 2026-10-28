/**
 * Variable-target-count family, group A: cards whose "up to X target …"
 * groups are bounded by an amount (times kicked, opponents, counters, a
 * trigger's value, a reflexive ability's value, a cast X) or capped by a
 * total mana value.
 */

import { describe, expect, it } from "vitest";

import type { TargetSpec } from "../target.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const groupMax = (specs: readonly TargetSpec[]): unknown => {
  const spec = specs[specs.length - 1];
  return typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
};

describe("Crackle with Power", () => {
  it("deals five times X to each of up to X targets", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const crackle = toHand(game, "Crackle with Power");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, crackle, { x: 2, targets: [ref(B), ref(giant)] });
    expect(life(game, B)).toBe(10);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Marshal's Anthem", () => {
  it("returns up to as many creature cards as it was kicked", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const anthem = toHand(game, "Marshal's Anthem");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Savannah Lions");
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return [ref(bears)];
    };
    cast(game, anthem, { kicked: true, kickCount: 1 });
    expect(max).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Rot Hulk", () => {
  it("returns up to one Zombie card per opponent", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 7);
    const hulk = toHand(game, "Rot Hulk");
    const zombies = [toGraveyard(game, "Gravedigger"), toGraveyard(game, "Gravedigger"), toGraveyard(game, "Gravedigger")];
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return zombies.slice(0, 2).map(ref);
    };
    cast(game, hulk);
    expect(max).toBe(2);
    expect(zombies.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "graveyard"]);
  });
});

describe("Froghemoth", () => {
  it("exiles up to the damage dealt, counting creature and noncreature cards", () => {
    const { game, a } = table();
    const frog = spawn(game, "Froghemoth");
    const cards = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B), toGraveyard(game, "Lightning Bolt", B)];
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return cards.map(ref);
    };
    const before = life(game, A);
    attack(game, a, [frog]);
    expect(max).toBe(4);
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(counters(game, frog)).toBe(2);
    expect(life(game, A)).toBe(before + 1);
  });
});

describe("Klauth's Will", () => {
  it("Smash Relics destroys up to X artifacts and/or enchantments", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const will = toHand(game, "Klauth's Will");
    const rings = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    expect(game.canDispatch({ type: "cast-spell", player: A, card: will, xValue: 2, modes: [1], targets: rings.map(ref) })).toMatch(/at most 2/);
    cast(game, will, { x: 2, modes: [1], targets: rings.slice(0, 2).map(ref) });
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield"]);
  });
});

describe("Elrond, Master of Healing", () => {
  it("puts a counter on up to as many creatures as cards looked at while scrying", () => {
    const { game, a } = table();
    spawn(game, "Elrond, Master of Healing");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return bears.slice(0, 2).map(ref);
    };
    game.debugApplyEffect(A, { kind: "scry", amount: 2 }, []);
    settle(game);
    expect(max).toBe(2);
    expect(bears.map((id) => counters(game, id))).toEqual([1, 1, 0]);
  });
});

describe("Batroc the Leaper", () => {
  it("enters with a counter per kick and deals his power to each of up to that many targets", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const batroc = toHand(game, "Batroc the Leaper");
    const giant = spawn(game, "Hill Giant", B);
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return [ref(B), ref(giant)];
    };
    cast(game, batroc, { kicked: true, kickCount: 2 });
    expect(max).toBe(2);
    expect(pt(game, batroc)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Prismabasher", () => {
  it("bounds its group by the colors among your permanents and pumps by them", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const basher = toHand(game, "Prismabasher");
    const lions = spawn(game, "Savannah Lions");
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return [ref(lions)];
    };
    cast(game, basher);
    // White Lions and green Prismabasher: two colors.
    expect(max).toBe(2);
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Campsite Cuisine", () => {
  it("sacrifices X Foods, then pumps up to X attacking creatures", () => {
    const { game, a } = table();
    spawn(game, "Campsite Cuisine");
    const foods = [spawn(game, "Food Token"), spawn(game, "Food Token")];
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickPermanents(a, foods[0]);
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return [ref(bears[0])];
    };
    attack(game, a, bears);
    expect(max).toBe(1);
    expect(zone(game, foods[0])).not.toBe("battlefield");
    expect(zone(game, foods[1])).toBe("battlefield");
    expect(pt(game, bears[0])).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears[0]).has("indestructible")).toBe(true);
    expect(pt(game, bears[1])).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(13);
  });
});

describe("Nyssa of Traken", () => {
  it("taps up to as many creatures as artifacts sacrificed, and draws that many anyway", () => {
    const { game, a } = table();
    const nyssa = spawn(game, "Nyssa of Traken");
    const rings = [spawn(game, "Sol Ring"), spawn(game, "Sol Ring"), spawn(game, "Sol Ring")];
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    pickPermanents(a, rings[0], rings[1]);
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return [ref(theirs[0])];
    };
    const before = hand(game).length;
    attack(game, a, [nyssa]);
    expect(max).toBe(2);
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield"]);
    expect(game.state.objects[theirs[0]].tapped).toBe(true);
    expect(game.state.objects[theirs[1]].tapped).toBe(false);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Call of the Death-Dweller", () => {
  it("puts each counter on one of the returned creatures, the caster's choice", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const call = toHand(game, "Call of the Death-Dweller");
    const lions = toGraveyard(game, "Savannah Lions");
    const bears = toGraveyard(game, "Grizzly Bears");
    const picks: ObjectId[] = [lions, bears];
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_v, eligible) => {
      offers.push(eligible);
      return [picks.shift()!];
    };
    cast(game, call, { targets: [ref(lions), ref(bears)] });
    expect([zone(game, lions), zone(game, bears)]).toEqual(["battlefield", "battlefield"]);
    expect([...offers[0]].sort()).toEqual([lions, bears].sort());
    expect(counters(game, lions, "deathtouch")).toBe(1);
    expect(counters(game, bears, "menace")).toBe(1);
    expect(keywords(game, lions).has("deathtouch")).toBe(true);
  });
});

describe("Quarantine Field", () => {
  it("exiles up to one permanent per isolation counter until it leaves", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const field = toHand(game, "Quarantine Field");
    const theirs = [spawn(game, "Sol Ring", B), spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    let max: unknown;
    a.chooseTargetsFn = (_v, _n, specs) => {
      max = groupMax(specs);
      return theirs.slice(0, 2).map(ref);
    };
    cast(game, field, { x: 2 });
    expect(counters(game, field, "isolation")).toBe(2);
    expect(max).toBe(2);
    expect(theirs.map((id) => zone(game, id))).toEqual(["exile", "exile", "battlefield"]);
    destroy(game, field);
    settle(game);
    expect(game.state.objects[field].zone).toBe("graveyard");
    expect(named(game, "Sol Ring", B).length).toBe(1);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("Recantation", () => {
  it("counts its verse counters before it's sacrificed", () => {
    const { game } = table();
    spawn(game, "Island");
    const recantation = spawn(game, "Recantation");
    game.state.objects[recantation].counters.verse = 2;
    const theirs = [spawn(game, "Sol Ring", B), spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: recantation, abilityIndex: 0, targets: theirs.map(ref) }),
    ).toMatch(/at most 2/);
    activate(game, recantation, 0, { targets: theirs.slice(0, 2).map(ref) });
    expect(theirs.map((id) => zone(game, id))).toEqual(["hand", "hand", "battlefield"]);
    expect(zone(game, recantation)).toBe("graveyard");
  });
});

describe("Profane Command", () => {
  it("returns a creature card of mana value X or less and gives up to X creatures fear", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const command = toHand(game, "Profane Command");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const mine = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: command, xValue: 2, modes: [1, 3], targets: [ref(giant), ref(mine[0])] }),
    ).not.toBeNull();
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: command,
        xValue: 2,
        modes: [1, 3],
        targets: [ref(bears), ...mine.map(ref)],
      }),
    ).toMatch(/at most 2/);
    cast(game, command, { x: 2, modes: [1, 3], targets: [ref(bears), ref(mine[0]), ref(mine[1])] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, mine[0]).has("fear")).toBe(true);
    expect(keywords(game, mine[1]).has("fear")).toBe(true);
    expect(keywords(game, mine[2]).has("fear")).toBe(false);
  });
});
