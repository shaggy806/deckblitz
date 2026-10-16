/**
 * Set walk batch 92, part h (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const nameOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const libraryTop = (game: Game): ObjectId => game.state.zones.perPlayer[A].library[0];
/** Top of alice's library, first to last. */
function stackLibrary(game: Game, ...names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}
const activations = (game: Game, source: ObjectId): number[] =>
  game
    .legalActions(A)
    .flatMap((l) => (l.kind === "activate-ability" && l.source === source ? [l.abilityIndex] : []));

describe("Caparocti Sunborn", () => {
  it("attacking, it may tap two untapped artifacts and/or creatures to discover 3", () => {
    const { game, a } = table();
    const [, bears] = stackLibrary(game, "Hill Giant", "Grizzly Bears");
    const caparocti = spawn(game, "Caparocti Sunborn");
    const thopter = spawn(game, "Ornithopter");
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 0);
    pickPermanents(a, thopter, ring);
    attack(game, a, [caparocti]);
    expect(isTapped(game, thopter)).toBe(true);
    expect(isTapped(game, ring)).toBe(true);
    expect(zone(game, bears)).toBe("hand");
  });

  it("with fewer than two to tap, there's no discover", () => {
    const { game, a } = table();
    const [giant] = stackLibrary(game, "Hill Giant");
    const caparocti = spawn(game, "Caparocti Sunborn");
    spawn(game, "Ornithopter");
    pickModes(a, 0);
    attack(game, a, [caparocti]);
    expect(libraryTop(game)).toBe(giant);
  });
});

describe("Hurl into History", () => {
  it("counters an artifact or creature spell and discovers its mana value", () => {
    const { game } = table();
    const [giant, elves] = stackLibrary(game, "Hill Giant", "Llanowar Elves");
    lands(game, "Forest", 2);
    lands(game, "Island", 5);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Hurl into History"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // X = 2: Hill Giant (4) goes to the bottom, Llanowar Elves is found.
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, giant)).toBe("library");
  });

  it("can't target a noncreature, nonartifact spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 5);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(() => cast(game, toHand(game, "Hurl into History"), { targets: [ref(bolt)] })).toThrow();
  });
});

describe("Swashbuckler's Whip", () => {
  it("gives the equipped creature reach and its two abilities", () => {
    const { game, a } = table();
    const [dreadmaw] = stackLibrary(game, "Colossal Dreadmaw", "Grizzly Bears");
    lands(game, "Wastes", 11);
    const whip = spawn(game, "Swashbuckler's Whip");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Craw Wurm", B);
    expect(activations(game, giant)).toEqual([]);
    activate(game, whip, 0, { targets: [ref(giant)] });
    expect(keywords(game, giant).has("reach")).toBe(true);
    const granted = activations(game, giant);
    expect(granted).toHaveLength(2);
    pickTargets(a, theirs);
    activate(game, giant, granted[0], { targets: [ref(theirs)] });
    expect(isTapped(game, theirs)).toBe(true);
    expect(isTapped(game, giant)).toBe(true);
    // Untapped again, "{8}, {T}: Discover 10."
    game.state.objects[giant].tapped = false;
    activate(game, giant, granted[1]);
    // Colossal Dreadmaw (6) is the first nonland card with mana value 10 or less.
    expect(zone(game, dreadmaw)).toBe("hand");
  });
});

describe("Zoetic Glyph", () => {
  it("makes the enchanted artifact a 5/4 Golem creature; to the graveyard from the battlefield, it discovers 3", () => {
    const { game } = table();
    const [bears] = stackLibrary(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const ring = spawn(game, "Sol Ring");
    const glyph = toHand(game, "Zoetic Glyph");
    cast(game, glyph, { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Golem");
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 4 });
    expect(zone(game, bears)).toBe("library");
    destroy(game, glyph);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Contest of Claws", () => {
  it("one-sided damage from your creature; the excess is X for discover", () => {
    const { game } = table();
    const [giant] = stackLibrary(game, "Hill Giant");
    lands(game, "Forest", 2);
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Contest of Claws"), { targets: [ref(wurm), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    // 6 damage to a 2/2: 4 excess, so Hill Giant (4) is found.
    expect(zone(game, giant)).toBe("hand");
  });

  it("no excess, no discover", () => {
    const { game } = table();
    const [elves] = stackLibrary(game, "Llanowar Elves");
    lands(game, "Forest", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Contest of Claws"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(libraryTop(game)).toBe(elves);
  });

  it("the second target is another creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const wurm = spawn(game, "Craw Wurm");
    expect(() => cast(game, toHand(game, "Contest of Claws"), { targets: [ref(wurm), ref(wurm)] })).toThrow();
  });
});

describe("Monstrous Vortex", () => {
  it("a creature spell with power 5 or greater discovers its mana value", () => {
    const { game } = table();
    spawn(game, "Monstrous Vortex");
    lands(game, "Forest", 6);
    const [dreadmaw] = stackLibrary(game, "Colossal Dreadmaw");
    cast(game, toHand(game, "Craw Wurm"));
    expect(zone(game, dreadmaw)).toBe("hand");
  });

  it("a smaller creature spell doesn't trigger it", () => {
    const { game } = table();
    spawn(game, "Monstrous Vortex");
    lands(game, "Forest", 2);
    const [elves] = stackLibrary(game, "Llanowar Elves");
    cast(game, toHand(game, "Grizzly Bears"));
    expect(libraryTop(game)).toBe(elves);
  });
});

describe("Pantlaza, Sun-Favored", () => {
  it("its own entry may discover its toughness — then not again this turn", () => {
    const { game, a } = table();
    const [giant, bears] = stackLibrary(game, "Hill Giant", "Grizzly Bears");
    pickModes(a, 0);
    enter(game, "Pantlaza, Sun-Favored");
    expect(zone(game, giant)).toBe("hand");
    expect(libraryTop(game)).toBe(bears);
    enter(game, "Colossal Dreadmaw");
    expect(libraryTop(game)).toBe(bears);
  });

  it("declined, another Dinosaur's entry still offers it, X that creature's toughness", () => {
    const { game, a } = table();
    spawn(game, "Pantlaza, Sun-Favored");
    const [wurm] = stackLibrary(game, "Craw Wurm");
    pickModes(a);
    enter(game, "Colossal Dreadmaw");
    expect(libraryTop(game)).toBe(wurm);
    pickModes(a, 0);
    enter(game, "Colossal Dreadmaw");
    expect(zone(game, wurm)).toBe("hand");
  });

  it("a non-Dinosaur doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Pantlaza, Sun-Favored");
    const [bears] = stackLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    enter(game, "Craw Wurm");
    expect(libraryTop(game)).toBe(bears);
  });

  it("X is the toughness the creature last had, if it left before the ability resolved", () => {
    const { game, a } = table();
    spawn(game, "Pantlaza, Sun-Favored");
    const [wurm] = stackLibrary(game, "Craw Wurm");
    pickModes(a, 0);
    const dreadmaw = enter(game, "Colossal Dreadmaw", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dreadmaw)]);
    settle(game);
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("hand");
  });
});

describe("Trumpeting Carnosaur", () => {
  it("enters and discovers 5", () => {
    const { game } = table();
    const [, giant] = stackLibrary(game, "Colossal Dreadmaw", "Hill Giant");
    enter(game, "Trumpeting Carnosaur");
    expect(zone(game, giant)).toBe("hand");
  });

  it("from the hand, discarded for {2}{R}: 3 damage to a creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const carnosaur = toHand(game, "Trumpeting Carnosaur");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, carnosaur, 0, { targets: [ref(giant)] });
    expect(zone(game, carnosaur)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Idol of the Deep King // Sovereign's Macuahuitl", () => {
  it("enters dealing 2 damage; crafted, it attaches to a creature you control for +2/+0", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    pickTargets(a, B);
    const idol = toHand(game, "Idol of the Deep King");
    cast(game, idol);
    expect(life(game, B)).toBe(18);
    const bears = spawn(game, "Grizzly Bears");
    const material = toGraveyard(game, "Ornithopter");
    pickFromZone(a, material);
    pickTargets(a, bears);
    activate(game, idol, 0);
    expect(nameOf(game, idol)).toBe("Sovereign's Macuahuitl");
    expect(zone(game, material)).toBe("exile");
    expect(game.state.objects[idol].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Inverted Iceberg // Iceberg Titan", () => {
  it("enters: mill a card, then draw a card", () => {
    const { game } = table();
    const [top, next] = stackLibrary(game, "Hill Giant", "Grizzly Bears");
    enter(game, "Inverted Iceberg");
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, next)).toBe("hand");
  });

  it("crafted into a 6/6 that may tap or untap an artifact or creature as it attacks", () => {
    const { game, a } = table();
    const iceberg = spawn(game, "Inverted Iceberg");
    const material = spawn(game, "Sol Ring");
    lands(game, "Island", 6);
    pickFromZone(a, material);
    activate(game, iceberg, 0);
    expect(nameOf(game, iceberg)).toBe("Iceberg Titan");
    expect(zone(game, material)).toBe("exile");
    expect(pt(game, iceberg)).toEqual({ power: 6, toughness: 6 });
    // Back on the battlefield as a new permanent: it waits a turn to attack.
    game.state.objects[iceberg].summoningSick = false;
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    pickModes(a, 0);
    attack(game, a, [iceberg]);
    expect(isTapped(game, theirs)).toBe(true);
  });
});

describe("Lodestone Needle // Guidestone Compass", () => {
  it("enters tapping up to one artifact or creature with two stun counters", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    enter(game, "Lodestone Needle");
    expect(isTapped(game, ring)).toBe(true);
    expect(counters(game, ring, "stun")).toBe(2);
  });

  it("crafted, {1}, {T}: target creature you control explores, as a sorcery", () => {
    const { game, a } = table();
    const needle = spawn(game, "Lodestone Needle");
    const material = toGraveyard(game, "Ornithopter");
    lands(game, "Island", 4);
    pickFromZone(a, material);
    activate(game, needle, 0);
    expect(nameOf(game, needle)).toBe("Guidestone Compass");
    const bears = spawn(game, "Grizzly Bears");
    const [giant] = stackLibrary(game, "Hill Giant");
    activate(game, needle, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, giant)).not.toBe("hand");
  });
});

describe("Spring-Loaded Sawblades // Bladewheel Chariot", () => {
  it("enters dealing 5 damage to a tapped creature an opponent controls", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    enter(game, "Spring-Loaded Sawblades");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("crafted, tapping two other untapped artifacts makes it a creature; crew 1 too", () => {
    const { game, a } = table();
    const blades = spawn(game, "Spring-Loaded Sawblades");
    const material = toGraveyard(game, "Ornithopter");
    lands(game, "Plains", 4);
    pickFromZone(a, material);
    activate(game, blades, 0);
    expect(nameOf(game, blades)).toBe("Bladewheel Chariot");
    expect(types(game, blades)).not.toContain("creature");
    const ring = spawn(game, "Sol Ring");
    expect(activations(game, blades)).not.toContain(0);
    const stone = spawn(game, "Mind Stone");
    expect(activations(game, blades)).toContain(0);
    activate(game, blades, 0);
    expect(isTapped(game, ring)).toBe(true);
    expect(isTapped(game, stone)).toBe(true);
    expect(isTapped(game, blades)).toBe(false);
    expect(types(game, blades)).toContain("creature");
    expect(pt(game, blades)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Waterlogged Hulk // Watertight Gondola", () => {
  it("{T}: mill a card; crafted with an Island, a land you control or a card in your graveyard", () => {
    const { game, a } = table();
    const hulk = spawn(game, "Waterlogged Hulk");
    const [top] = stackLibrary(game, "Hill Giant");
    activate(game, hulk, 0);
    expect(zone(game, top)).toBe("graveyard");
    game.state.objects[hulk].tapped = false;
    // Mana enough, but no Island anywhere.
    lands(game, "Wastes", 3);
    spawn(game, "Mox Sapphire");
    expect(activations(game, hulk)).not.toContain(1);
    const island = toGraveyard(game, "Island");
    expect(activations(game, hulk)).toContain(1);
    pickFromZone(a, island);
    activate(game, hulk, 1);
    expect(nameOf(game, hulk)).toBe("Watertight Gondola");
    expect(zone(game, island)).toBe("exile");
    expect(keywords(game, hulk).has("vigilance")).toBe(true);
    expect(pt(game, hulk)).toEqual({ power: 4, toughness: 4 });
  });

  it("descend 8: the Gondola can't be blocked with eight or more permanent cards in your graveyard", () => {
    const { game } = table();
    const gondola = spawn(game, "Waterlogged Hulk");
    lands(game, "Wastes", 3);
    spawn(game, "Mox Sapphire");
    toGraveyard(game, "Island");
    activate(game, gondola, 1);
    expect(nameOf(game, gondola)).toBe("Watertight Gondola");
    expect(graveyard(game)).toHaveLength(0);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    expect(keywords(game, gondola).has("unblockable")).toBe(false);
    toGraveyard(game, "Sol Ring");
    expect(keywords(game, gondola).has("unblockable")).toBe(true);
  });
});
