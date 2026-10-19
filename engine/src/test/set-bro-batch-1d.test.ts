/**
 * The set walk, The Brothers' War batch 1, group d (2026-10-19): prototype
 * creatures, Powerstone makers, and the rest of the group the engine runs
 * faithfully. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): readonly string[] => [...game.characteristics(id).colors];
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const powerstones = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].cardName === "Powerstone Token");

/** Activate with a permanent sacrificed for the cost. */
function activateSacrificing(game: Game, source: ObjectId, sacrifice: ObjectId, index = 0): void {
  const action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(`activate refused: ${why}`);
  game.dispatch(action);
  settle(game);
}

describe("Blitz Automaton", () => {
  it("prototyped, it's a red 3/2 with haste; cast normally, a colorless 6/4", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const proto = toHand(game, "Blitz Automaton");
    cast(game, proto, { prototype: true });
    expect(pt(game, proto)).toEqual({ power: 3, toughness: 2 });
    expect(colorsOf(game, proto)).toEqual(["R"]);
    expect(keywords(game, proto).has("haste")).toBe(true);

    lands(game, "Wastes", 7);
    const full = toHand(game, "Blitz Automaton");
    cast(game, full);
    expect(pt(game, full)).toEqual({ power: 6, toughness: 4 });
    expect(colorsOf(game, full)).toEqual([]);
  });
});

describe("Goring Warplow", () => {
  it("prototyped, it's a black 1/1 that keeps deathtouch", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const card = toHand(game, "Goring Warplow");
    cast(game, card, { prototype: true });
    expect(pt(game, card)).toEqual({ power: 1, toughness: 1 });
    expect(colorsOf(game, card)).toEqual(["B"]);
    expect(keywords(game, card).has("deathtouch")).toBe(true);
  });
});

describe("Depth Charge Colossus", () => {
  it("doesn't untap in the untap step; {3} untaps it", () => {
    const { game } = table();
    const colossus = spawn(game, "Depth Charge Colossus", A, { tapped: true });
    toStep(game, "precombat-main");
    expect(tapped(game, colossus)).toBe(true);
    lands(game, "Wastes", 3);
    activate(game, colossus, 0);
    expect(tapped(game, colossus)).toBe(false);
  });

  it("prototyped, it's a blue 6/6", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Depth Charge Colossus");
    cast(game, card, { prototype: true });
    expect(pt(game, card)).toEqual({ power: 6, toughness: 6 });
    expect(colorsOf(game, card)).toEqual(["U"]);
  });
});

describe("Boulderbranch Golem", () => {
  it("gains life equal to its power: 3 prototyped, 6 cast normally", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Boulderbranch Golem"), { prototype: true });
    expect(life(game)).toBe(23);
    lands(game, "Wastes", 7);
    cast(game, toHand(game, "Boulderbranch Golem"));
    expect(life(game)).toBe(29);
  });

  it("uses its last-known power when it has left before the trigger resolves (the ruling)", () => {
    const { game } = table();
    const golem = enter(game, "Boulderbranch Golem", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(golem)]);
    settle(game);
    expect(zone(game, golem)).toBe("graveyard");
    expect(life(game)).toBe(26);
  });
});

describe("Spotter Thopter", () => {
  it("scries X where X is its power: 2 prototyped", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    let seen = -1;
    a.chooseScryFn = (_view, cards) => {
      seen = cards.length;
      return [];
    };
    const card = toHand(game, "Spotter Thopter");
    cast(game, card, { prototype: true });
    expect(seen).toBe(2);
    expect(keywords(game, card).has("flying")).toBe(true);
  });

  it("scries 4 cast normally", () => {
    const { game, a } = table();
    lands(game, "Wastes", 8);
    let seen = -1;
    a.chooseScryFn = (_view, cards) => {
      seen = cards.length;
      return [];
    };
    cast(game, toHand(game, "Spotter Thopter"));
    expect(seen).toBe(4);
  });
});

describe("Woodcaller Automaton", () => {
  it("cast prototyped, untaps a land and makes it a 3/3 Treefolk land creature with haste", () => {
    const { game, a } = table();
    const forests = lands(game, "Forest", 4);
    pickTargets(a, forests[0]);
    const card = toHand(game, "Woodcaller Automaton");
    cast(game, card, { prototype: true });
    const land = forests[0];
    expect(tapped(game, land)).toBe(false);
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, land)).toEqual(expect.arrayContaining(["Forest", "Treefolk"]));
    expect(keywords(game, land).has("haste")).toBe(true);
    // No duration: still a creature next turn.
    nextTurn(game);
    expect(types(game, land)).toContain("creature");
  });

  it("does nothing if it wasn't cast", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest", A, { tapped: true });
    pickTargets(a, forest);
    enter(game, "Woodcaller Automaton");
    expect(tapped(game, forest)).toBe(true);
    expect(types(game, forest)).not.toContain("creature");
  });
});

describe("Gixian Skullflayer", () => {
  it("gets a counter at upkeep with three creature cards in your graveyard", () => {
    const { game } = table();
    const flayer = spawn(game, "Gixian Skullflayer");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, flayer)).toBe(1);
  });

  it("doesn't with only two (and noncreature cards don't count)", () => {
    const { game } = table();
    const flayer = spawn(game, "Gixian Skullflayer");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, flayer)).toBe(0);
  });
});

describe("Argivian Avenger", () => {
  it("{1}: gets -1/-1 and gains the keyword chosen as it resolves", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Argivian Avenger");
    lands(game, "Wastes", 2);
    pickModes(a, 2);
    activate(game, avenger, 0);
    expect(pt(game, avenger)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, avenger).has("deathtouch")).toBe(true);
    pickModes(a, 0);
    activate(game, avenger, 0);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, avenger).has("flying")).toBe(true);
  });
});

describe("Yotian Tactician", () => {
  it("pumps only your other Soldiers", () => {
    const { game } = table();
    const tactician = spawn(game, "Yotian Tactician");
    const soldier = spawn(game, "Yotian Frontliner");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Yotian Frontliner", B);
    expect(pt(game, tactician)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Power Plant Worker", () => {
  const worker = (name: string) =>
    defineCard({ name, manaCost: "{3}", types: ["artifact", "creature"], subtypes: ["Assembly-Worker"], power: 2, toughness: 2 });

  it("gets +2/+2 without both Workers, once each turn", () => {
    const { game } = table();
    const plant = spawn(game, "Power Plant Worker");
    lands(game, "Wastes", 6);
    activate(game, plant, 0);
    expect(pt(game, plant)).toEqual({ power: 6, toughness: 6 });
    expect(counters(game, plant)).toBe(0);
    expect(() => activate(game, plant, 0)).toThrow(/refused/);
  });

  it("puts two +1/+1 counters on it instead with a Mine Worker and a Tower Worker", () => {
    const { game } = table();
    for (const name of ["Mine Worker", "Tower Worker"]) {
      if (!game.registry.has(name)) game.registry.register(worker(name));
    }
    const plant = spawn(game, "Power Plant Worker");
    spawn(game, "Mine Worker");
    lands(game, "Wastes", 3);
    // Only one of them: still the pump.
    activate(game, plant, 0);
    expect(counters(game, plant)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    spawn(game, "Tower Worker");
    activate(game, plant, 0);
    expect(counters(game, plant)).toBe(2);
    expect(pt(game, plant)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Fallaji Vanguard", () => {
  it("triggers on itself and on another creature you control entering", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Fallaji Vanguard");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    enter(game, "Ornithopter");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 2 });
    enter(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Penregon Strongbull", () => {
  it("sacrifices an artifact: +1/+1 and 1 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    const bull = spawn(game, "Penregon Strongbull");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Wastes", 1);
    activateSacrificing(game, bull, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(pt(game, bull)).toEqual({ power: 3, toughness: 4 });
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 19, 19]);
  });
});

describe("Carrion Locust", () => {
  it("exiles a creature card from an opponent's graveyard and that player loses 1 life", () => {
    const { game, a } = table({ players: 3 });
    const bears = toGraveyard(game, "Grizzly Bears", C);
    pickTargets(a, bears);
    enter(game, "Carrion Locust");
    expect(zone(game, bears)).toBe("exile");
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 20, 19]);
  });

  it("a noncreature card costs nobody life", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    enter(game, "Carrion Locust");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });
});

describe("Coastal Bulwark", () => {
  it("gets +2/+0 with an Island, and surveils 1 for {2}, {T}", () => {
    const { game, a } = table();
    const wall = spawn(game, "Coastal Bulwark");
    expect(pt(game, wall)).toEqual({ power: 1, toughness: 3 });
    spawn(game, "Island");
    expect(pt(game, wall)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Wastes", 2);
    let mode: string | null = null;
    a.chooseScryFn = (_v, cards, m) => {
      mode = m;
      return cards;
    };
    const before = graveyard(game).length;
    activate(game, wall, 0);
    expect(mode).toBe("surveil");
    expect(graveyard(game).length).toBe(before + 1);
    expect(tapped(game, wall)).toBe(true);
  });
});

describe("Lat-Nam Adept", () => {
  it("gets a counter on your second draw of the turn, not the third", () => {
    const { game } = table();
    const adept = spawn(game, "Lat-Nam Adept");
    // Alice has drawn once this turn already (no first-draw skip).
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(counters(game, adept)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(counters(game, adept)).toBe(1);
  });
});

describe("Shoot Down", () => {
  it("exiles a creature with flying, not one without", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    const spell = toHand(game, "Shoot Down");
    expect(() => cast(game, spell, { targets: [ref(bears)] })).toThrow(/refused/);
    cast(game, spell, { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("exile");
  });
});

describe("Yotian Frontliner", () => {
  it("pumps another creature you control when it attacks", () => {
    const { game, a } = table();
    const frontliner = spawn(game, "Yotian Frontliner");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [frontliner]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, frontliner)).toEqual({ power: 1, toughness: 1 });
  });

  it("unearths for {W} with haste", () => {
    const { game } = table();
    const card = toGraveyard(game, "Yotian Frontliner");
    lands(game, "Plains", 1);
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("haste")).toBe(true);
  });
});

describe("Splitting the Powerstone", () => {
  it("makes two tapped Powerstones, and draws only if the sacrificed artifact was legendary", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const ring = spawn(game, "Sol Ring");
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Splitting the Powerstone"), { sacrifice: ring });
    expect(zone(game, ring)).toBe("graveyard");
    expect(powerstones(game)).toHaveLength(2);
    expect(powerstones(game).every((id) => tapped(game, id))).toBe(true);
    expect(hand(game).length).toBe(handBefore);

    const marvel = spawn(game, "Aetherworks Marvel");
    cast(game, toHand(game, "Splitting the Powerstone"), { sacrifice: marvel });
    expect(tokensNamed(game, "Powerstone Token")).toBe(4);
    expect(hand(game).length).toBe(handBefore + 1);
  });
});

describe("Junkyard Genius", () => {
  it("makes a tapped Powerstone, and pumps the other creatures you control", () => {
    const { game } = table();
    const genius = enter(game, "Junkyard Genius");
    expect(powerstones(game)).toHaveLength(1);
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    activateSacrificing(game, genius, ring);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, genius)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, genius).has("menace")).toBe(false);
  });

  it("can't sacrifice itself", () => {
    const { game } = table();
    const genius = spawn(game, "Junkyard Genius");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    expect(() => activateSacrificing(game, genius, genius)).toThrow(/refused/);
  });
});

describe("Steel Exemplar", () => {
  it("enters with two counters cast with colorless mana or one color", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const plain = toHand(game, "Steel Exemplar");
    cast(game, plain);
    expect(counters(game, plain)).toBe(2);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 4);
    const mono = toHand(game, "Steel Exemplar");
    cast(game, mono);
    expect(counters(game, mono)).toBe(2);
  });

  it("enters with none when two or more colors were spent", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    const card = toHand(game, "Steel Exemplar");
    cast(game, card);
    expect(counters(game, card)).toBe(0);
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
  });

  it("enters with them when it wasn't cast", () => {
    const { game } = table();
    const card = enter(game, "Steel Exemplar");
    expect(counters(game, card)).toBe(2);
  });
});

describe("Mightstone's Animation", () => {
  it("draws a card and makes the enchanted artifact a 4/4 creature that keeps its types", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    lands(game, "Island", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Mightstone's Animation"), { targets: [ref(ring)] });
    expect(hand(game).length).toBe(before + 1);
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Goblin Blast-Runner", () => {
  it("is a 3/2 with menace once you've sacrificed a permanent this turn", () => {
    const { game } = table();
    const runner = spawn(game, "Goblin Blast-Runner");
    expect(pt(game, runner)).toEqual({ power: 1, toughness: 2 });
    const ring = spawn(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(ring)]);
    settle(game);
    expect(pt(game, runner)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, runner).has("menace")).toBe(true);
    nextTurn(game);
    expect(pt(game, runner)).toEqual({ power: 1, toughness: 2 });
  });

  it("counts a sacrifice from before it arrived (the ruling)", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(ring)]);
    settle(game);
    const runner = spawn(game, "Goblin Blast-Runner");
    expect(pt(game, runner)).toEqual({ power: 3, toughness: 2 });
  });

  it("an opponent's sacrifice doesn't count", () => {
    const { game } = table();
    const runner = spawn(game, "Goblin Blast-Runner");
    const ring = spawn(game, "Sol Ring", B);
    game.debugApplyEffect(B, { kind: "sacrifice-target", target: 0 }, [ref(ring)]);
    settle(game);
    expect(pt(game, runner)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Gix's Caress", () => {
  it("you choose a nonland card to discard, and make a tapped Powerstone", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Forest", B);
    lands(game, "Swamp", 3);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Gix's Caress"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(powerstones(game)).toHaveLength(1);
    expect(tapped(game, powerstones(game)[0])).toBe(true);
  });
});

describe("Raze to the Ground", () => {
  it("destroys an artifact and draws if its mana value was 1 or less", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const ring = spawn(game, "Sol Ring", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Raze to the Ground"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Raze to the Ground"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Arms Race", () => {
  it("puts an artifact from hand onto the battlefield with haste, sacrificed at the next end step", () => {
    const { game, a } = table();
    const race = spawn(game, "Arms Race");
    lands(game, "Mountain", 4);
    const thopter = toHand(game, "Ornithopter");
    pickFromZone(a, thopter);
    activate(game, race, 0);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(keywords(game, thopter).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Alloy Animist", () => {
  it("makes a noncreature artifact you control a 4/4 artifact creature until end of turn", () => {
    const { game } = table();
    const animist = spawn(game, "Alloy Animist");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Forest", 3);
    activate(game, animist, 0, { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(types(game, ring)).not.toContain("creature");
  });
});

describe("Mask of the Jadecrafter", () => {
  it("{X}, {T}, sacrifice: an X/X Golem; unearth brings it back", () => {
    const { game } = table();
    const mask = spawn(game, "Mask of the Jadecrafter");
    lands(game, "Wastes", 3);
    activate(game, mask, 0, { x: 3 });
    expect(zone(game, mask)).toBe("graveyard");
    const golem = game.battlefield.find((id) => game.state.objects[id].cardName === "X/X Golem Token");
    expect(golem).toBeDefined();
    expect(pt(game, golem as ObjectId)).toEqual({ power: 3, toughness: 3 });
    expect(colorsOf(game, golem as ObjectId)).toEqual([]);
    lands(game, "Forest", 3);
    activate(game, mask, 1);
    expect(zone(game, mask)).toBe("battlefield");
  });
});

describe("Arbalest Engineers", () => {
  it("mode one: 1 damage to any target", () => {
    const { game, a } = table();
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Arbalest Engineers");
    expect(life(game, B)).toBe(19);
  });

  it("mode two: a +1/+1 counter, trample and haste", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bears);
    enter(game, "Arbalest Engineers");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("mode three: a tapped Powerstone", () => {
    const { game, a } = table();
    pickModes(a, 2);
    enter(game, "Arbalest Engineers");
    expect(powerstones(game)).toHaveLength(1);
    expect(tapped(game, powerstones(game)[0])).toBe(true);
  });
});
