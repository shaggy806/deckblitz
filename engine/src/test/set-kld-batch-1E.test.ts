/**
 * Commander 2016 and Kaladesh, group E: the clause of each card most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

const energy = (game: Game): number => game.state.players[A].energy;
const setCounters = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

describe("Prismatic Geoscope", () => {
  it("adds one mana per basic land type among your lands, not per land", () => {
    const { game } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    lands(game, "Forest", 2);
    lands(game, "Wastes", 2);
    const scope = spawn(game, "Prismatic Geoscope");
    expect(game.state.objects[scope].tapped).toBe(true);
    game.state.objects[scope].tapped = false;
    activate(game, scope);
    const pool = game.state.players[A].manaPool;
    expect(pool.length).toBe(3);
    expect(pool.every((u) => u.type !== "C")).toBe(true);
  });
});

describe("Demon of Dark Schemes", () => {
  it("shrinks the other creatures, gets {E} for each that dies, and reanimates for four", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const demon = enter(game, "Demon of Dark Schemes");
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, demon)).toEqual({ power: 5, toughness: 5 });
    expect(energy(game)).toBe(1);
    game.state.players[A].energy = 4;
    lands(game, "Swamp", 3);
    pickTargets(a, bears);
    activate(game, demon, 0, { targets: [ref(bears)] });
    expect(energy(game)).toBe(0);
    const back = named(game, "Grizzly Bears", A);
    expect(back.length).toBe(1);
    expect(game.state.objects[back[0]].tapped).toBe(true);
  });
});

describe("Architect of the Untamed", () => {
  it("landfall gives {E}; eight of them make a 6/6 colorless Beast artifact", () => {
    const { game } = table();
    const architect = spawn(game, "Architect of the Untamed");
    enter(game, "Forest");
    expect(energy(game)).toBe(1);
    game.state.players[A].energy = 8;
    activate(game, architect);
    expect(energy(game)).toBe(0);
    const [beast] = named(game, "6/6 Beast Artifact Token", A);
    expect(pt(game, beast)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, beast)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, beast)).toContain("Beast");
    expect(computeCharacteristics(game.state, game.registry, beast).colors.size).toBe(0);
  });
});

describe("Electrostatic Pummeler", () => {
  it("enters with three {E} and spends them to double its power", () => {
    const { game } = table();
    const pummeler = enter(game, "Electrostatic Pummeler");
    expect(energy(game)).toBe(3);
    activate(game, pummeler);
    expect(energy(game)).toBe(0);
    expect(pt(game, pummeler)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Servant of the Conduit", () => {
  it("pays {E} for one mana of any color", () => {
    const { game } = table();
    const servant = enter(game, "Servant of the Conduit");
    expect(energy(game)).toBe(2);
    activate(game, servant);
    expect(energy(game)).toBe(1);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("Wispweaver Angel", () => {
  it("may blink another creature you control, which comes back fresh", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, bears, { "+1/+1": 2 });
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Wispweaver Angel");
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(0);
  });
});

describe("Oviya Pashiri, Sage Lifecrafter", () => {
  it("makes an X/X Construct, X the creatures you control before it's made", () => {
    const { game } = table();
    const oviya = spawn(game, "Oviya Pashiri, Sage Lifecrafter");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    activate(game, oviya, 1);
    const [construct] = named(game, "Construct Token (Metallurgic Summonings)", A);
    expect(pt(game, construct)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Aetherborn Marauder", () => {
  it("moves +1/+1 counters from other permanents you control, never offering itself", () => {
    const { game, a } = table();
    const p = spawn(game, "Grizzly Bears");
    const q = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    setCounters(game, p, { "+1/+1": 2 });
    setCounters(game, q, { "+1/+1": 1 });
    setCounters(game, theirs, { "+1/+1": 3 });
    const offered: (readonly ObjectId[])[] = [];
    const queue = [p, q];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push(eligible);
      const next = queue.shift();
      return next === undefined ? [] : [next];
    };
    // Take as many as offered each time.
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.length - 1];
    const marauder = enter(game, "Aetherborn Marauder");
    expect(offered[0]).toEqual(expect.arrayContaining([p, q]));
    expect(offered[0]).not.toContain(marauder);
    expect(offered[0]).not.toContain(theirs);
    expect(counters(game, marauder)).toBe(3);
    expect(counters(game, p)).toBe(0);
    expect(counters(game, q)).toBe(0);
  });
});

describe("Toolcraft Exemplar", () => {
  it("+2/+1 with an artifact, first strike too with three", () => {
    const { game } = table();
    const exemplar = spawn(game, "Toolcraft Exemplar");
    spawn(game, "Sol Ring");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, exemplar)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, exemplar).has("first-strike")).toBe(false);

    const { game: g2 } = table();
    const other = spawn(g2, "Toolcraft Exemplar");
    spawn(g2, "Sol Ring");
    spawn(g2, "Sol Ring");
    spawn(g2, "Sol Ring");
    toStep(g2, "begin-combat");
    settle(g2);
    expect(pt(g2, other)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(g2, other).has("first-strike")).toBe(true);
  });

  it("doesn't trigger with no artifact", () => {
    const { game } = table();
    const exemplar = spawn(game, "Toolcraft Exemplar");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, exemplar)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Harsh Scrutiny", () => {
  it("you choose only a creature card to discard, then scry 1", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const forest = toHand(game, "Forest", B);
    lands(game, "Swamp", 1);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Harsh Scrutiny"), { targets: [ref(B)] });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(forest);
    expect(graveyard(game, B)).toContain(bears);
    expect(hand(game, B)).toContain(forest);
  });
});

describe("Live Fast", () => {
  it("draws two, loses 2 life and gets {E}{E}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Live Fast"));
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
    expect(energy(game)).toBe(2);
  });
});

describe("Fretwork Colony", () => {
  it("grows and costs 1 life each upkeep", () => {
    const { game } = table();
    const colony = spawn(game, "Fretwork Colony");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, colony)).toBe(1);
    expect(life(game)).toBe(19);
  });
});

describe("Hightide Hermit", () => {
  it("pays {E}{E} to attack despite defender", () => {
    const { game, a } = table();
    const hermit = enter(game, "Hightide Hermit");
    expect(energy(game)).toBe(4);
    activate(game, hermit);
    expect(energy(game)).toBe(2);
    attack(game, a, [hermit]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Riparian Tiger", () => {
  it("may pay {E}{E} as it attacks for +2/+2", () => {
    const { game, a } = table();
    const tiger = enter(game, "Riparian Tiger");
    expect(energy(game)).toBe(2);
    pickModes(a, 0);
    attack(game, a, [tiger]);
    expect(energy(game)).toBe(0);
    expect(life(game, B)).toBe(14);
  });
});

describe("Embraal Bruiser", () => {
  it("has menace only while you control an artifact", () => {
    const { game } = table();
    const bruiser = spawn(game, "Embraal Bruiser");
    expect(keywords(game, bruiser).has("menace")).toBe(false);
    spawn(game, "Sol Ring");
    expect(keywords(game, bruiser).has("menace")).toBe(true);
  });

  it("enters tapped", () => {
    const { game } = table();
    const bruiser = enter(game, "Embraal Bruiser");
    expect(game.state.objects[bruiser].tapped).toBe(true);
  });
});
