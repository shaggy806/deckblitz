/**
 * "Add two mana of different colors" (Firemind Vessel, Interplanar Beacon) and
 * "two mana of any one color and two mana of any other color" (Open the
 * Omenpaths) — `add-mana`'s `different`. A pairing, never two of one colour:
 * an offer per pairing by hand, an option per pairing to the payer, a mode per
 * pairing on the stack (rule 608.2d).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { differentManaSplits } from "../mana.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, cast, lands, life, pickModes, pt, spawn, table, toHand, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
const offers = (game: Game, source: ObjectId, index = 0): Activate[] =>
  game
    .legalActions(A)
    .filter((a): a is Activate => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

/** It enters tapped, so on the board untapped. */
const vesselOn = (game: Game): ObjectId => {
  const vessel = spawn(game, "Firemind Vessel");
  game.state.objects[vessel].tapped = false;
  return vessel;
};

const tap = (game: Game, source: ObjectId, picks: readonly ManaType[], index = 0): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], manaColors: picks });
};

describe("the pairings", () => {
  it("ten pairs of colours, each listed once; two units of each in the four-mana form", () => {
    const pairs = differentManaSplits(["W", "U", "B", "R", "G"], 2, 1);
    expect(pairs).toHaveLength(10);
    expect(pairs.every(([x, y]) => x !== y)).toBe(true);
    expect(new Set(pairs.map((p) => p.join(""))).size).toBe(10);
    expect(differentManaSplits(["W", "U", "B"], 4, 2)).toEqual([
      ["W", "W", "U", "U"],
      ["W", "W", "B", "B"],
      ["U", "U", "B", "B"],
    ]);
  });
});

describe("Firemind Vessel", () => {
  it("enters tapped", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const vessel = toHand(game, "Firemind Vessel");
    cast(game, vessel);
    expect(game.state.objects[vessel].tapped).toBe(true);
  });

  it("by hand: an offer per pairing, and the pair it names", () => {
    const { game } = table();
    const vessel = vesselOn(game);
    expect(offers(game, vessel)).toHaveLength(10);
    tap(game, vessel, ["U", "R"]);
    expect(pool(game)).toBe("RU");
  });

  it("a client's word can't make two of one colour, or a colour it doesn't offer", () => {
    const { game } = table();
    const vessel = vesselOn(game);
    tap(game, vessel, ["G", "G"]);
    expect(pool(game)).toBe("UW");
  });

  it("no picks at all still makes a pair", () => {
    const { game } = table();
    const vessel = vesselOn(game);
    game.dispatch({ type: "activate-ability", player: A, source: vessel, abilityIndex: 0, targets: [] });
    expect(pool(game)).toBe("UW");
  });

  it("paying a cost: the payer picks the pair the spell needs", () => {
    const { game } = table();
    vesselOn(game);
    const strix = toHand(game, "Baleful Strix");
    cast(game, strix);
    expect(zone(game, strix)).toBe("battlefield");
  });

  it("paying a cost: it can't pay two pips of one colour", () => {
    const { game } = table();
    vesselOn(game);
    const counter = toHand(game, "Counterspell");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === counter)).toBe(false);
  });

  it("Mana Reflection doubles each: two of each of the pair", () => {
    const { game } = table();
    spawn(game, "Mana Reflection");
    const vessel = vesselOn(game);
    tap(game, vessel, ["B", "G"]);
    expect(pool(game)).toBe("BBGG");
  });
});

describe("Interplanar Beacon", () => {
  it("{1}, {T}: a pair, spendable only on a planeswalker spell, whose casting gains 1 life", () => {
    const { game } = table();
    const beacon = spawn(game, "Interplanar Beacon");
    lands(game, "Wastes", 4);
    const walker = toHand(game, "Teferi, Hero of Dominaria");
    cast(game, walker);
    expect(zone(game, walker)).toBe("battlefield");
    expect(game.state.objects[beacon].tapped).toBe(true);
    expect(life(game)).toBe(21);
  });

  it("the restriction holds: floated, the pair won't cast a creature", () => {
    const { game } = table();
    const beacon = spawn(game, "Interplanar Beacon");
    const [wastes] = lands(game, "Wastes", 1);
    game.dispatch({ type: "activate-ability", player: A, source: wastes, abilityIndex: 0, targets: [] });
    tap(game, beacon, ["U", "B"], 1);
    expect(pool(game)).toBe("BU");
    const strix = toHand(game, "Baleful Strix");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === strix)).toBe(false);
  });

  it("{T}: Add {C} is there beside it", () => {
    const { game } = table();
    const beacon = spawn(game, "Interplanar Beacon");
    game.dispatch({ type: "activate-ability", player: A, source: beacon, abilityIndex: 0, targets: [] });
    expect(pool(game)).toBe("C");
  });
});

describe("Open the Omenpaths", () => {
  it("as it resolves: a mode per pairing, two of each, for creature or enchantment spells", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [5];
    };
    cast(game, toHand(game, "Open the Omenpaths"), { modes: [0] });
    expect(offered).toHaveLength(10);
    expect(offered[5]).toBe("Add {U}{U}{R}{R}.");
    expect(pool(game)).toBe("RRUU");
    const myr = toHand(game, "Alpha Myr");
    const lava = toHand(game, "Divination");
    const castable = (id: ObjectId): boolean => game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === id);
    expect(castable(myr)).toBe(true);
    expect(castable(lava)).toBe(false);
    cast(game, myr);
    expect(zone(game, myr)).toBe("battlefield");
  });

  it("the other mode: creatures you control get +1/+0", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    cast(game, toHand(game, "Open the Omenpaths"), { modes: [1] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pool(game)).toBe("");
  });
});
