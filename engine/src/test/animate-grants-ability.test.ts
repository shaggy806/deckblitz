/**
 * "Becomes a creature with [an ability]": `become` beside a grant of the whole
 * ability in one sequence — `grant-triggered` (Raging Ravine, Veiled Apparition,
 * Dancing Sword's ward), `grant-static` (Restless Spire's conditional first
 * strike, Veiled Serpent's can't-attack, Monument to Perfection's toxic) and
 * `grant-protection` (Opal Guardian). The grant goes with the animation, by the
 * same duration, and is still there after a loss of all abilities that came
 * before it (rule 613.7).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { defendersForAttacker } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

/** It's Bob's main phase, and he casts a Grizzly Bears. */
const bobCastsBears = (game: Game): void => {
  nextTurn(game);
  lands(game, "Forest", 2, B);
  cast(game, toHand(game, "Grizzly Bears", B), { player: B });
};

/** A land that enters tapped, on the battlefield long enough to have untapped. */
const readyLand = (game: Game, name: string): ObjectId => {
  const land = spawn(game, name, A);
  game.state.objects[land].tapped = false;
  return land;
};

describe("a land that becomes a creature with a triggered ability", () => {
  it("Raging Ravine: a 3/3 red and green land that grows as it attacks", () => {
    const { game, a } = table();
    const ravine = readyLand(game, "Raging Ravine");
    lands(game, "Mountain", 2, A);
    lands(game, "Forest", 2, A);
    activate(game, ravine, 1);
    expect(pt(game, ravine)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, ravine)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect([...computeCharacteristics(game.state, game.registry, ravine).colors].sort()).toEqual(["G", "R"]);
    attack(game, a, [ravine]);
    expect(game.state.players[B].life).toBe(16);
    expect(counters(game, ravine)).toBe(1);
    expect(pt(game, ravine)).toEqual({ power: 4, toughness: 4 });
  });

  it("…activated twice it has the ability twice", () => {
    const { game, a } = table();
    const ravine = readyLand(game, "Raging Ravine");
    lands(game, "Mountain", 4, A);
    lands(game, "Forest", 4, A);
    activate(game, ravine, 1);
    activate(game, ravine, 1);
    attack(game, a, [ravine]);
    expect(counters(game, ravine)).toBe(2);
  });

  it("…and at end of turn the ability goes with the creature, the counter staying", () => {
    const { game, a } = table();
    const ravine = readyLand(game, "Raging Ravine");
    lands(game, "Mountain", 2, A);
    lands(game, "Forest", 2, A);
    activate(game, ravine, 1);
    attack(game, a, [ravine]);
    nextTurn(game);
    expect(types(game, ravine)).not.toContain("creature");
    expect(counters(game, ravine)).toBe(1);
    expect(game.state.objects[ravine].modifiers.some((m) => m.grantsTriggered !== undefined)).toBe(false);
  });
});

describe("a land that becomes a creature with a conditional static", () => {
  it("Restless Spire has first strike during your turn, and not during another's", () => {
    const { game } = table();
    const spire = spawn(game, "Restless Spire", A);
    lands(game, "Island", 1, A);
    lands(game, "Mountain", 1, A);
    activate(game, spire, 1);
    expect(pt(game, spire)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, spire).has("first-strike")).toBe(true);

    nextTurn(game);
    expect(types(game, spire)).not.toContain("creature");
    lands(game, "Island", 1, A);
    lands(game, "Mountain", 1, A);
    game.dispatch({ type: "pass-priority", player: B });
    activate(game, spire, 1, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(types(game, spire)).toContain("creature");
    expect(keywords(game, spire).has("first-strike")).toBe(false);
  });
});

describe("the opal and veiled enchantments, whose ability comes with the change", () => {
  it("Veiled Serpent becomes a 4/4 that can't attack a player with no Island", () => {
    const { game } = table({ players: 3 });
    const serpent = spawn(game, "Veiled Serpent", A);
    bobCastsBears(game);
    expect(pt(game, serpent)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, serpent)).toEqual(["creature"]);
    expect(subtypes(game, serpent)).toEqual(["Serpent"]);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([]);
    lands(game, "Island", 1, B);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([B]);
  });

  it("…and a loss of all abilities afterwards takes the restriction with it (rule 613.7)", () => {
    const { game } = table();
    const serpent = spawn(game, "Veiled Serpent", A);
    bobCastsBears(game);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([]);
    game.debugApplyEffect(A, { kind: "become", loseAbilities: true, target: 0, duration: "permanent" }, [ref(serpent)]);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([B]);
  });

  it("Veiled Apparition's upkeep: unpaid, it's sacrificed", () => {
    const { game, a } = table();
    const apparition = spawn(game, "Veiled Apparition", A);
    bobCastsBears(game);
    expect(pt(game, apparition)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, apparition).has("flying")).toBe(true);
    expect(types(game, apparition)).toEqual(["creature"]);
    pickModes(a); // don't pay
    toStep(game, "draw", A);
    expect(zone(game, apparition)).toBe("graveyard");
  });

  it("…paid, it stays, and the mana's gone", () => {
    const { game, a } = table();
    const apparition = spawn(game, "Veiled Apparition", A);
    const islands = lands(game, "Island", 2, A);
    bobCastsBears(game);
    pickModes(a, 0); // pay
    toStep(game, "draw", A);
    expect(zone(game, apparition)).toBe("battlefield");
    expect(islands.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Opal Guardian: a 3/4 flier with protection from red, only on a creature spell", () => {
    const { game } = table();
    const guardian = spawn(game, "Opal Guardian", A);
    nextTurn(game);
    lands(game, "Forest", 2, B);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(spawn(game, "Grizzly Bears", B))] });
    expect(types(game, guardian)).toEqual(["enchantment"]);

    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(types(game, guardian)).toEqual(["creature"]);
    expect(subtypes(game, guardian)).toEqual(["Gargoyle"]);
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, guardian).has("flying")).toBe(true);

    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, bolt, { player: B, targets: [ref(guardian)] })).toThrow();
  });
});

describe("Monument to Perfection", () => {
  const NINE = [
    "Plains",
    "Island",
    "Swamp",
    "Mountain",
    "Forest",
    "Snow-Covered Plains",
    "Snow-Covered Island",
    "Cloudpost",
    "Glimmerpost",
  ];

  it("searches for a basic, Sphere or Locus land, and nothing else", () => {
    const { game, a } = table();
    const monument = spawn(game, "Monument to Perfection", A);
    lands(game, "Wastes", 3, A);
    const post = toLibrary(game, "Cloudpost", A);
    const tower = toLibrary(game, "Command Tower", A);
    const picked = pickFromZone(a, post);
    activate(game, monument, 0);
    expect(picked.offered).toContain(post);
    expect(picked.offered).not.toContain(tower);
    expect(zone(game, post)).toBe("hand");
  });

  it("can't become anything with only eight different names among those lands", () => {
    const { game } = table();
    const monument = spawn(game, "Monument to Perfection", A);
    for (const name of NINE.slice(0, 8)) spawn(game, name, A);
    // A second of one name, and a land of the wrong kind, count for nothing.
    spawn(game, "Plains", A);
    spawn(game, "Command Tower", A);
    expect(() => activate(game, monument, 1)).toThrow();
  });

  it("becomes a 9/9 indestructible with toxic 9 and no other ability, and gives nine poison", () => {
    const { game, a } = table();
    const monument = spawn(game, "Monument to Perfection", A);
    for (const name of NINE) spawn(game, name, A);
    activate(game, monument, 1);
    expect(pt(game, monument)).toEqual({ power: 9, toughness: 9 });
    expect(types(game, monument)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, monument)).toEqual(expect.arrayContaining(["Phyrexian", "Construct"]));
    expect(keywords(game, monument).has("indestructible")).toBe(true);
    expect(computeCharacteristics(game.state, game.registry, monument).toxic).toBe(9);
    // Its own abilities are gone: no search now.
    expect(() => activate(game, monument, 0)).toThrow();

    attack(game, a, [monument]);
    expect(game.state.players[B].counters.poison).toBe(9);
    expect(game.state.players[B].life).toBe(11);
  });
});

describe("Dancing Sword", () => {
  const swordOn = (game: Game): { sword: ReturnType<typeof spawn>; bears: ReturnType<typeof spawn> } => {
    const sword = spawn(game, "Dancing Sword", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 1, A);
    activate(game, sword, 0, { targets: [ref(bears)] });
    return { sword, bears };
  };

  it("gives +2/+1, and may stay an Equipment when the creature dies", () => {
    const { game, a } = table();
    const { sword, bears } = swordOn(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    pickModes(a);
    destroy(game, bears);
    expect(types(game, sword)).toEqual(["artifact"]);
    expect(subtypes(game, sword)).toEqual(["Equipment"]);
  });

  it("…or become a 2/1 Construct with flying that isn't an Equipment and can't equip", () => {
    const { game, a } = table();
    const { sword, bears } = swordOn(game);
    pickModes(a, 0);
    destroy(game, bears);
    expect(pt(game, sword)).toEqual({ power: 2, toughness: 1 });
    expect(types(game, sword)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, sword)).toEqual(["Construct"]);
    expect(keywords(game, sword).has("flying")).toBe(true);

    const other = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 1, A);
    activate(game, sword, 0, { targets: [ref(other)] });
    expect(game.state.objects[sword].attachedTo ?? null).toBe(null);
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
  });

  it("…with ward {1}: an opponent's spell at it is countered unless they pay", () => {
    const { game, a } = table();
    const { sword, bears } = swordOn(game);
    pickModes(a, 0);
    destroy(game, bears);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(sword)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, sword)).toBe("battlefield");
  });
});
