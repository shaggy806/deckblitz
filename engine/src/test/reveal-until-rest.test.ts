/**
 * `reveal-until` and `reveal-until-count` with where the found and the rest go
 * as parameters: the rest to the bottom in the order chosen (rule 401.4) or to
 * the hand, a count found to the hand or out of exile, and `then` reading the
 * resolution's own target beside the card found.
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { computeCharacteristics } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { slotPolarities } from "../target-polarity.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Stack the top of `player`'s library: first name on top. */
const stack = (game: Game, names: readonly string[], player: PlayerId = A): ObjectId[] =>
  [...names].reverse().map((name) => toLibrary(game, name, player)).reverse();

describe("the rest in the order chosen", () => {
  it("Erratic Explosion: damage equal to the card found to its own target, all of them on the bottom as chosen", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const [forest, island, bears] = stack(game, ["Forest", "Island", "Grizzly Bears"]);
    const explosion = toHand(game, "Erratic Explosion");
    const order = pickFromZone(a, bears, forest, island);
    cast(game, explosion, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(order.offered).toEqual(expect.arrayContaining([forest, island, bears]));
    expect(library(game).slice(-3)).toEqual([bears, forest, island]);
    expect(zone(game, explosion)).toBe("graveyard");
  });

  it("the same, nothing found: all of the library revealed, no damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const explosion = toHand(game, "Erratic Explosion");
    // The deck is 40 Wastes. Identical cards: nobody is asked (rule 401.4 has no choice).
    pickFromZone(a);
    const size = library(game).length;
    cast(game, explosion, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(library(game)).toHaveLength(size);
  });

  it("Explosive Revelation: the card found to the hand, the rest on the bottom", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears0 = spawn(game, "Grizzly Bears", B);
    const [forest, island, bolt] = stack(game, ["Forest", "Island", "Lightning Bolt"]);
    const revelation = toHand(game, "Explosive Revelation");
    pickFromZone(a, island, forest);
    cast(game, revelation, { targets: [ref(bears0)] });
    expect(game.state.objects[bears0].damageMarked).toBe(1);
    expect(hand(game)).toContain(bolt);
    expect(library(game).slice(-2)).toEqual([island, forest]);
  });

  it("Erratic Mutation: +X/-X on its own target, X the card's mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const target = spawn(game, "Hill Giant");
    const [forest, bears] = stack(game, ["Forest", "Grizzly Bears"]);
    const mutation = toHand(game, "Erratic Mutation");
    pickFromZone(a, forest, bears);
    cast(game, mutation, { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 5, toughness: 1 });
    expect(library(game).slice(-2)).toEqual([forest, bears]);
  });

  it("Goblin Machinist: +X/+0 on itself, X the card's mana value, a `then` that keeps the source", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const machinist = spawn(game, "Goblin Machinist");
    const [forest, bears] = stack(game, ["Forest", "Grizzly Bears"]);
    pickFromZone(a, bears, forest);
    game.dispatch({ type: "activate-ability", player: A, source: machinist, abilityIndex: 0, targets: [] });
    settle(game);
    expect(pt(game, machinist)).toEqual({ power: 2, toughness: 5 });
    expect(library(game).slice(-2)).toEqual([bears, forest]);
  });
});

describe("the rest to the hand", () => {
  it("Treasure Hunt: every card revealed, the nonland card among them", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const [forest, island, bears, under] = stack(game, ["Forest", "Island", "Grizzly Bears", "Hill Giant"]);
    const hunt = toHand(game, "Treasure Hunt");
    cast(game, hunt);
    for (const id of [forest, island, bears]) expect(hand(game)).toContain(id);
    expect(library(game)[0]).toBe(under);
  });
});

describe("the rest exiled", () => {
  it("Sacred Guide's: the card found to the hand, every other card revealed exiled", () => {
    const { game } = table();
    const source = spawn(game, "Wastes");
    const [forest, bears, under] = stack(game, ["Forest", "Grizzly Bears", "Hill Giant"]);
    game.debugApplyEffect(
      A,
      { kind: "reveal-until", filter: { type: "creature" }, put: "hand", rest: "exile" },
      [],
      { source },
    );
    settle(game);
    expect(hand(game)).toContain(bears);
    expect(zone(game, forest)).toBe("exile");
    expect(library(game)[0]).toBe(under);
  });
});

describe("a count of cards found", () => {
  it("Fathom Trawl: three nonland cards to the hand, the lands revealed on the bottom as chosen", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const [bolt, forest, bears, island, giant, under] = stack(game, [
      "Lightning Bolt",
      "Forest",
      "Grizzly Bears",
      "Island",
      "Hill Giant",
      "Sol Ring",
    ]);
    const trawl = toHand(game, "Fathom Trawl");
    pickFromZone(a, island, forest);
    cast(game, trawl);
    for (const id of [bolt, bears, giant]) expect(hand(game)).toContain(id);
    expect(library(game)[0]).toBe(under);
    expect(library(game).slice(-2)).toEqual([island, forest]);
  });

  it("Auspicious Starrix, mutating for the first time: X is 1", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const egg = spawn(game, "Grizzly Bears");
    const [bolt, ring, under] = stack(game, ["Lightning Bolt", "Sol Ring", "Hill Giant"]);
    cast(game, toHand(game, "Auspicious Starrix"), { overload: true, targets: [ref(egg)] });
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, ring)).toBe("battlefield");
    expect(library(game)[0]).toBe(under);
  });

  it("the same at a count of 2, the permanent cards together, whatever is between them exiled", () => {
    const { game } = table();
    const source = spawn(game, "Auspicious Starrix");
    const [bolt, bears, ring, under] = stack(game, ["Lightning Bolt", "Grizzly Bears", "Sol Ring", "Hill Giant"]);
    const effect: EffectSpec = {
      kind: "reveal-until-count",
      filter: { notTypes: ["instant", "sorcery"] },
      count: 2,
      exile: true,
      rest: "stay",
    };
    game.debugApplyEffect(A, effect, [], { source });
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
    expect(library(game)[0]).toBe(under);
  });

  it("whose, tapped, and all of them with the rest: another's library, entering tapped, or to a graveyard in one go", () => {
    const { game } = table();
    const source = spawn(game, "Wastes");
    const [forest, bears, island] = stack(game, ["Forest", "Grizzly Bears", "Island"], B);
    game.debugApplyEffect(
      A,
      { kind: "reveal-until-count", whose: 0, filter: { type: "land" }, count: 2, put: "with-rest", rest: "graveyard" },
      [ref(B)],
      { source },
    );
    settle(game);
    for (const id of [forest, bears, island]) expect(graveyard(game, B)).toContain(id);

    const [land, other] = stack(game, ["Forest", "Island"]);
    game.debugApplyEffect(
      A,
      { kind: "reveal-until-count", filter: { type: "land" }, count: 2, tapped: true, rest: "stay" },
      [],
      { source },
    );
    settle(game);
    expect(game.state.objects[land].tapped).toBe(true);
    expect(game.state.objects[other].tapped).toBe(true);
    expect(computeCharacteristics(game.state, game.registry, land).types).toContain("land");
  });

  it("no card to find: a count of 0 reveals nothing", () => {
    const { game } = table();
    const source = spawn(game, "Wastes");
    const before = [...library(game)];
    game.debugApplyEffect(
      A,
      { kind: "reveal-until-count", filter: {}, count: 0, exile: true, rest: "stay" },
      [],
      { source },
    );
    settle(game);
    expect(library(game)).toEqual(before);
  });
});

describe("whose library, and what a bot reads", () => {
  it("Proteus Staff: that creature's controller reveals and orders their own", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const staff = spawn(game, "Proteus Staff");
    const bears = spawn(game, "Grizzly Bears", B);
    const [forest, island, giant] = stack(game, ["Forest", "Island", "Hill Giant"], B);
    const order = pickFromZone(b, island, forest);
    activate(game, staff, 0, { targets: [ref(bears)] });
    expect(order.offered).toEqual(expect.arrayContaining([forest, island]));
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(B);
    // The creature itself went first, so it's above those.
    expect(library(game, B).slice(-3)).toEqual([bears, island, forest]);
  });

  it("Proteus Staff only as a sorcery", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const staff = spawn(game, "Proteus Staff");
    spawn(game, "Grizzly Bears", B);
    const offered = () => game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === staff);
    expect(offered()).toBe(true);
    toStep(game, "begin-combat");
    expect(offered()).toBe(false);
  });

  it("the slot a `then` keeps: Erratic Explosion harms its target, the found card no slot of its own", () => {
    const explosion = createDefaultRegistry().get("Erratic Explosion");
    expect(slotPolarities(explosion.effect, 1)).toEqual(["harm"]);
    const mutation = createDefaultRegistry().get("Erratic Mutation");
    expect(slotPolarities(mutation.effect, 1)).toHaveLength(1);
  });
});
