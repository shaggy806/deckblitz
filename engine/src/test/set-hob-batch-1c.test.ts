/**
 * The Hobbit (HOB), batch 72, part c (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Warg Tactics", () => {
  it("puts a +1/+1 counter on your creature and gives it trample and hexproof until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Warg Tactics"), { modes: [1], targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    toStep(game, "end");
    settle(game);
    toStep(game, "precombat-main", B);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });

  it("destroys only a creature with flying", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const tactics = toHand(game, "Warg Tactics");
    expect(() => cast(game, tactics, { modes: [0], targets: [ref(bears)] })).toThrow();
    const bird = spawn(game, "Old Thrush", B);
    cast(game, tactics, { modes: [0], targets: [ref(bird)] });
    expect(zone(game, bird)).toBe("graveyard");
  });
});

describe("Down in the Valley", () => {
  it("finds a basic land, then gains landfall Elves, then pumps only Elves", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    const saga = spawn(game, "Down in the Valley");
    settle(game);
    expect(zone(game, forest)).toBe("hand");

    // Before chapter II, a land entering makes nothing.
    enter(game, "Forest");
    expect(tokensNamed(game, "Elf Token", A)).toBe(0);

    toStep(game, "precombat-main"); // alice's next turn: chapter II
    settle(game);
    expect(counters(game, saga, "lore")).toBe(2);
    enter(game, "Forest");
    expect(tokensNamed(game, "Elf Token", A)).toBe(1);

    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // chapter III
    settle(game);
    const elf = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Elf Token")!;
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, elf).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    // The granted landfall ability stays on the Saga.
    enter(game, "Forest");
    expect(tokensNamed(game, "Elf Token", A)).toBe(2);
  });
});

describe("Old Thrush", () => {
  it("gains 2 life and may put a basic land on top of the library", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, forest);
    enter(game, "Old Thrush");
    expect(life(game, A)).toBe(22);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(forest);
  });
});

describe("Stir Up Trouble", () => {
  it("is cast by sacrificing an artifact or creature, or by paying {4} more", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const trouble = toHand(game, "Stir Up Trouble");
    // One Swamp and nothing to sacrifice: neither branch is affordable.
    expect(castOffers(game, trouble)).toHaveLength(0);
    const fodder = spawn(game, "Grizzly Bears");
    expect(castOffers(game, trouble).length).toBeGreaterThan(0);
    lands(game, "Swamp", 4);
    const options = castOffers(game, trouble).map((o) => (o as { costOption?: number }).costOption);
    expect(new Set(options).size).toBe(2);
    cast(game, trouble, { targets: [ref(bears)], costOption: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, fodder)).toBe("battlefield");
  });
});

describe("Silvan Reveler", () => {
  it("puts a discarded land card onto the battlefield tapped", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    a.chooseDiscardsFn = () => [forest];
    enter(game, "Silvan Reveler");
    expect(zone(game, forest)).toBe("battlefield");
    expect(tapped(game, forest)).toBe(true);
  });

  it("leaves a discarded nonland card in the graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    enter(game, "Silvan Reveler");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("returns from the graveyard to hand on landfall if you pay {1}{G}{U}", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 2);
    const reveler = toGraveyard(game, "Silvan Reveler");
    pickModes(a, 0);
    enter(game, "Forest");
    expect(zone(game, reveler)).toBe("hand");
    expect(graveyard(game)).not.toContain(reveler);
  });
});

describe("The Chief Warg", () => {
  it("draws and loses 1 life when you attack only while you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    const warg = spawn(game, "The Chief Warg");
    const before = hand(game).length;
    attack(game, a, [warg]);
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(20);

    spawn(game, "Craw Wurm");
    toStep(game, "precombat-main");
    const start = hand(game).length;
    attack(game, a, [warg]);
    expect(hand(game).length).toBe(start + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Boughside Wanderers", () => {
  it("offers only permanent cards from the top four", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    enter(game, "Boughside Wanderers");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(bolt)).toBeGreaterThan(library.length - 4);
  });
});

describe("Stone-Giant of High Pass", () => {
  it("makes a 3/1 defender artifact token named Stone Boulder on entering and on attacking", () => {
    const { game, a } = table();
    const giant = enter(game, "Stone-Giant of High Pass");
    expect(tokensNamed(game, "Stone Boulder Token", A)).toBe(1);
    const boulder = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Stone Boulder Token")!;
    expect(nameOf(game.state.objects[boulder])).toBe("Stone Boulder");
    expect(pt(game, boulder)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, boulder).has("defender")).toBe(true);
    attack(game, a, [giant]);
    expect(tokensNamed(game, "Stone Boulder Token", A)).toBe(2);
  });

  it("sacrifices an artifact to deal 4 damage", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = enter(game, "Stone-Giant of High Pass");
    const boulder = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Stone Boulder Token")!;
    game.dispatch({ type: "activate-ability", player: A, source: giant, abilityIndex: 0, targets: [ref(B)], sacrifice: boulder });
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Stone Boulder Token", A)).toBe(0);
  });
});

describe("Gollum, Silent Slinker // Meager Meal", () => {
  it("Meager Meal can leave the creature slot empty and still give target player 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Gollum, Silent Slinker");
    cast(game, card, { face: 1, targets: [null, ref(B)] });
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
  });

  it("Meager Meal puts a +1/+1 counter on the chosen creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gollum, Silent Slinker"), { face: 1, targets: [ref(bears), ref(A)] });
    expect(counters(game, bears)).toBe(1);
    expect(life(game, A)).toBe(22);
  });
});

describe("Lake-town Mariners // Gone Fishing", () => {
  it("Gone Fishing needs exactly two targets, and blinks them", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const land = spawn(game, "Forest", A, { tapped: true });
    const card = toHand(game, "Lake-town Mariners");
    expect(() => cast(game, card, { face: 1, targets: [ref(bears)] })).toThrow();
    cast(game, card, { face: 1, targets: [ref(bears), ref(land)] });
    expect(zone(game, card)).toBe("exile");
    const forests = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Forest");
    const bearsNow = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Grizzly Bears",
    );
    expect(bearsNow).toHaveLength(1);
    // The land came back as a new, untapped object.
    expect(forests.filter((id) => !tapped(game, id))).toHaveLength(1);
  });
});
