/**
 * B249 group C — cards freed by the static loss of all abilities, block limits
 * and "becomes a [type]" effects: Auras that make a creature something else
 * (Frogify, Amphibian Downpour, Minimus Containment, Retro-Mutation, Flood the
 * Engine), creatures whose abilities replace their creature types (Kellan,
 * Frodo, Donald Blake, Mild-Mannered Librarian, Ageless Sentinels, Proteus
 * Machine, Mistform Mask), Hidden Stag's two-way type change, and conditional
 * block limits (Entourage of Trest, Foriysian Totem).
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  tokensNamed,
  toHand,
  toStep,
  types,
} from "./harness.js";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();

const activatable = (game: Game, id: ObjectId): string[] => [
  ...new Set(
    game
      .legalActions(A)
      .flatMap((action) =>
        action.kind === "activate-ability" && action.source === id ? [action.text.replace(/ \(add \{.\}\)$/, "")] : [],
      ),
  ),
];

const answerType = (game: Game, creatureType: string): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
  game.dispatch({ type: "choose-creature-type", player: A, creatureType });
  settle(game);
};

const playLand = (game: Game, player: typeof A, name: string): void => {
  const land = toHand(game, name, player);
  game.dispatch({ type: "play-land", player, card: land });
  settle(game);
};

describe("Auras that make a creature something else", () => {
  it("Frogify: a blue 1/1 Frog creature with no abilities, no longer an artifact", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Frogify"), { targets: [ref(angel)] });
    cast(game, toHand(game, "Frogify"), { targets: [ref(thopter)] });
    expect([...keywords(game, angel)]).toEqual([]);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, angel)).toEqual(["Frog"]);
    expect(colorsOf(game, angel)).toEqual(["U"]);
    expect(types(game, thopter)).toEqual(["creature"]);
    expect([...keywords(game, thopter)]).toEqual([]);
  });

  it("Reprobation: a 0/1 Coward keeping its colour", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Reprobation"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 1 });
    expect(subtypes(game, angel)).toEqual(["Coward"]);
    expect(colorsOf(game, angel)).toEqual(["W"]);
    expect([...keywords(game, angel)]).toEqual([]);
  });

  it("Amphibian Downpour: a storm copy becomes a token Aura on a new target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const cubs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Opt"));
    pickTargets(a, cubs);
    cast(game, toHand(game, "Amphibian Downpour"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Amphibian Downpour", A)).toBe(1);
    for (const id of [bears, cubs]) {
      expect(subtypes(game, id)).toEqual(["Frog"]);
      expect(pt(game, id)).toEqual({ power: 1, toughness: 1 });
    }
  });

  it("Minimus Containment: a creature becomes a Treasure artifact keeping its colour", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", A);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Minimus Containment"), { targets: [ref(elves)] });
    expect(types(game, elves)).toEqual(["artifact"]);
    expect(subtypes(game, elves)).toEqual(["Treasure"]);
    expect(colorsOf(game, elves)).toEqual(["G"]);
    expect(activatable(game, elves)).toEqual(["{T}, Sacrifice this artifact: Add one mana of any color."]);
  });

  it("Retro-Mutation: a 0/1 Turtle with no abilities, still a creature", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Retro-Mutation"), { targets: [ref(angel)] });
    expect(types(game, angel)).toEqual(["creature"]);
    expect(subtypes(game, angel)).toEqual(["Turtle"]);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 1 });
    expect([...keywords(game, angel)]).toEqual([]);
  });

  it("Flood the Engine: taps the creature, which then stays tapped", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Flood the Engine"), { targets: [ref(angel)] });
    expect(game.state.objects[angel].tapped).toBe(true);
    expect([...keywords(game, angel)]).toEqual([]);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("Mistform Mask: the enchanted creature becomes the chosen type", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 3);
    const mask = toHand(game, "Mistform Mask");
    cast(game, mask, { targets: [ref(bears)] });
    activate(game, mask, 0, { settle: false });
    answerType(game, "Goblin");
    expect(subtypes(game, bears)).toEqual(["Goblin"]);
  });
});

describe("abilities that replace creature types", () => {
  it("Kellan: the Detective ability needs a Scout, the Rogue one a Detective", () => {
    const { game } = table();
    const kellan = spawn(game, "Kellan, Planar Trailblazer", A);
    lands(game, "Mountain", 8);
    activate(game, kellan, 1);
    expect(pt(game, kellan)).toEqual({ power: 2, toughness: 1 });
    expect(subtypes(game, kellan)).toEqual(["Human", "Faerie", "Scout"]);
    activate(game, kellan, 0);
    expect(subtypes(game, kellan)).toEqual(["Human", "Faerie", "Detective"]);
    expect(pt(game, kellan)).toEqual({ power: 2, toughness: 1 });
    activate(game, kellan, 1);
    expect(subtypes(game, kellan)).toEqual(["Human", "Faerie", "Rogue"]);
    expect(pt(game, kellan)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, kellan)).toContain("double-strike");
  });

  it("Frodo: Citizen to Scout to a Rogue whose hits tempt the Ring", () => {
    const { game, a } = table();
    const frodo = spawn(game, "Frodo, Sauron's Bane", A);
    lands(game, "Swamp", 8);
    activate(game, frodo, 1);
    expect(subtypes(game, frodo)).toEqual(["Halfling", "Citizen"]);
    activate(game, frodo, 0);
    expect(subtypes(game, frodo)).toEqual(["Halfling", "Scout"]);
    expect(pt(game, frodo)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, frodo)).toContain("lifelink");
    activate(game, frodo, 1);
    expect(subtypes(game, frodo)).toEqual(["Halfling", "Rogue"]);
    a.declareAttackersFn = () => [{ attacker: frodo, defender: B }];
    toStep(game, "postcombat-main", A);
    expect(game.state.players[A].ringTemptations).toBe(1);
    expect(game.state.result.over).toBe(false);
  });

  it("Donald Blake: two +1/+1 counters, flying, and a God Warrior Hero", () => {
    const { game } = table();
    const donald = spawn(game, "Donald Blake, Guise of Thor", A);
    lands(game, "Plains", 6);
    activate(game, donald, 0);
    expect(counters(game, donald)).toBe(2);
    expect(keywords(game, donald)).toContain("flying");
    expect(subtypes(game, donald)).toEqual(["God", "Warrior", "Hero"]);
  });

  it("Mild-Mannered Librarian: a Werewolf for good, once only", () => {
    const { game } = table();
    const librarian = spawn(game, "Mild-Mannered Librarian", A);
    lands(game, "Forest", 8);
    const before = hand(game).length;
    activate(game, librarian, 0);
    expect(subtypes(game, librarian)).toEqual(["Werewolf"]);
    expect(pt(game, librarian)).toEqual({ power: 3, toughness: 3 });
    expect(hand(game).length).toBe(before + 1);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: librarian, abilityIndex: 0, targets: [] } as Action),
    ).not.toBeNull();
  });

  it("Proteus Machine: turned face up, it's the chosen type and still an artifact", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const machine = toHand(game, "Proteus Machine");
    cast(game, machine, { via: "face-down" });
    game.dispatch({ type: "turn-face-up", player: A, permanent: machine, morph: true } as Action);
    answerType(game, "Goblin");
    expect(subtypes(game, machine)).toEqual(["Goblin"]);
    expect(types(game, machine)).toEqual(["artifact", "creature"]);
    toStep(game, "precombat-main", B);
    expect(subtypes(game, machine)).toEqual(["Goblin"]);
  });

  it("Ageless Sentinels: blocking makes it a Bird Giant without defender", () => {
    const { game, a } = table();
    const sentinels = spawn(game, "Ageless Sentinels", B);
    const bears = spawn(game, "Grizzly Bears", A);
    blockOffer(game, a, [bears]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: sentinels, attacker: bears }] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(subtypes(game, sentinels)).toEqual(["Bird", "Giant"]);
    expect(keywords(game, sentinels).has("defender")).toBe(false);
    expect(keywords(game, sentinels).has("flying")).toBe(true);
  });
});

describe("Hidden Stag", () => {
  it("is a 3/2 Elk Beast after an opponent's land, and an enchantment again after yours", () => {
    const { game } = table();
    const stag = spawn(game, "Hidden Stag", A);
    toStep(game, "precombat-main", B);
    playLand(game, B, "Forest");
    expect(types(game, stag)).toEqual(["creature"]);
    expect(subtypes(game, stag)).toEqual(["Elk", "Beast"]);
    expect(pt(game, stag)).toEqual({ power: 3, toughness: 2 });
    toStep(game, "precombat-main", A);
    playLand(game, A, "Forest");
    expect(types(game, stag)).toEqual(["enchantment"]);
    expect(subtypes(game, stag)).toEqual([]);
    toStep(game, "precombat-main", B);
    playLand(game, B, "Forest");
    expect(types(game, stag)).toEqual(["creature"]);
  });
});

describe("conditional block limits", () => {
  it("Entourage of Trest blocks two only while its controller is the monarch", () => {
    const { game, a } = table();
    const entourage = enter(game, "Entourage of Trest", B);
    expect(game.state.monarch).toBe(B);
    const bears = spawn(game, "Grizzly Bears", A);
    const cubs = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [bears, cubs]);
    expect(offer.eligible.find((e) => e.blocker === entourage)?.maxBlocks).toBe(2);
  });

  it("Entourage of Trest blocks one with no monarch", () => {
    const { game, a } = table();
    const entourage = spawn(game, "Entourage of Trest", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const cubs = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [bears, cubs]);
    expect(offer.eligible.find((e) => e.blocker === entourage)?.maxBlocks ?? 1).toBe(1);
  });

  it("Foriysian Totem blocks two once animated", () => {
    const { game, b } = table();
    const totem = spawn(game, "Foriysian Totem", A);
    toStep(game, "upkeep", B);
    game.advanceUntil((s) => s.priority.holder === A);
    lands(game, "Mountain", 5);
    activate(game, totem, 1);
    expect(types(game, totem)).toEqual(["artifact", "creature"]);
    const bears = spawn(game, "Grizzly Bears", B);
    const cubs = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, b, [bears, cubs], A);
    expect(offer.eligible.find((e) => e.blocker === totem)?.maxBlocks).toBe(2);
  });
});
