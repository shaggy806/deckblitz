/**
 * Batch 141, group A — EDHREC ranks 7181–7451 and rechecks of cards whose
 * blockers were built (improvise). One test per clause most likely to be
 * wrong: Icebreaker Kraken's affinity, held untap and bounce cost, Dragon
 * Throne of Tarkir's granted ability, Creeping Renaissance's permanent-type
 * choice, Magus of the Vineyard's "that player adds", Novijen's "each
 * creature that entered this turn", Saheeli's Artistry's artifact copy,
 * Saheeli's Directive with improvise, Embodiment of Insight's landfall,
 * Airborne Aid's count, Hero of Iroas's heroic and Druids' Repository.
 */
import { describe, expect, it } from "vitest";

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
  named,
  nextTurn,
  pickFromZone,
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
  toLibrary,
  types,
  zone,
} from "./harness.js";

describe("Icebreaker Kraken", () => {
  it("costs {1} less per snow land and holds the opponent's artifacts and creatures tapped", () => {
    const { game, a } = table();
    const snow = lands(game, "Snow-Covered Island", 10);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const thopter = spawn(game, "Ornithopter", B, { tapped: true });
    const land = spawn(game, "Wastes", B, { tapped: true });
    pickTargets(a, B);
    const kraken = toHand(game, "Icebreaker Kraken");
    cast(game, kraken);
    expect(zone(game, kraken)).toBe("battlefield");
    // {10}{U}{U} less 10: two snow lands paid the {U}{U}.
    expect(snow.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);

    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[thopter].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(false);
  });

  it("returns three snow lands to return itself to its owner's hand", () => {
    const { game, a } = table();
    const snow = lands(game, "Snow-Covered Island", 4);
    const kraken = spawn(game, "Icebreaker Kraken");
    pickPermanents(a, snow[0], snow[1], snow[2]);
    activate(game, kraken, 0);
    expect(zone(game, kraken)).toBe("hand");
    expect(snow.map((id) => zone(game, id))).toEqual(["hand", "hand", "hand", "battlefield"]);
  });
});

describe("Dragon Throne of Tarkir", () => {
  it("gives the equipped creature defender and a pump of the others by its power", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const throne = spawn(game, "Dragon Throne of Tarkir");
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, throne, 0, { targets: [ref(wurm)] });
    expect(keywords(game, wurm).has("defender")).toBe(true);
    activate(game, wurm, 0);
    expect(game.state.objects[wurm].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 4 });
    expect(keywords(game, wurm).has("trample")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Creeping Renaissance", () => {
  it("returns every card of the chosen permanent type, and only those", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const thopter = toGraveyard(game, "Ornithopter");
    const ring = toGraveyard(game, "Sol Ring");
    const forest = toGraveyard(game, "Forest");
    pickModes(a, 2); // Creature
    cast(game, toHand(game, "Creeping Renaissance"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, thopter)).toBe("hand");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Magus of the Vineyard", () => {
  it("adds {G}{G} for the player whose first main phase it is", () => {
    const { game } = table();
    spawn(game, "Magus of the Vineyard");
    nextTurn(game);
    settle(game);
    expect(game.state.players[B].manaPool.map((u) => u.type)).toEqual(["G", "G"]);
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });
});

describe("Novijen, Heart of Progress", () => {
  it("puts a counter on each creature that entered this turn, whoever controls it", () => {
    const { game } = table();
    const old = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    const novijen = spawn(game, "Novijen, Heart of Progress");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const fresh = enter(game, "Grizzly Bears", B);
    const mine = enter(game, "Llanowar Elves", A);
    activate(game, novijen, 1);
    expect(counters(game, fresh)).toBe(1);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, old)).toBe(0);
  });
});

describe("Saheeli's Artistry", () => {
  it("copies a creature as an artifact in addition to its other types", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Saheeli's Artistry"), { modes: [1], targets: [ref(bears)] });
    const copy = named(game, "Grizzly Bears", A);
    expect(copy).toHaveLength(1);
    expect(types(game, copy[0])).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });

  it("with both modes, may copy one artifact creature twice", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const thopter = spawn(game, "Ornithopter", B);
    cast(game, toHand(game, "Saheeli's Artistry"), { modes: [0, 1], targets: [ref(thopter), ref(thopter)] });
    expect(named(game, "Ornithopter", A)).toHaveLength(2);
  });
});

describe("Saheeli's Directive", () => {
  it("puts the chosen artifacts with mana value X or less onto the battlefield, the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const relics = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    const bears = toLibrary(game, "Grizzly Bears");
    const thopter = toLibrary(game, "Ornithopter");
    const ring = toLibrary(game, "Sol Ring");
    pickFromZone(a, ring, thopter);
    cast(game, toHand(game, "Saheeli's Directive"), { x: 3, convoke: relics.map((creature) => ({ creature })) });
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(relics.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Embodiment of Insight", () => {
  it("may animate a land on landfall, and land creatures have vigilance", () => {
    const { game, a } = table();
    spawn(game, "Embodiment of Insight");
    const target = spawn(game, "Forest");
    pickTargets(a, target);
    pickModes(a, 0);
    enter(game, "Forest");
    expect(pt(game, target)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, target).has("haste")).toBe(true);
    expect(keywords(game, target).has("vigilance")).toBe(true);
  });
});

describe("Airborne Aid", () => {
  it("draws one for each Bird on the battlefield, any player's", () => {
    const { game } = table();
    lands(game, "Island", 4);
    spawn(game, "Storm Crow");
    spawn(game, "Birds of Paradise", B);
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Airborne Aid"));
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Hero of Iroas", () => {
  it("gets a +1/+1 counter when you cast a spell that targets it", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const hero = spawn(game, "Hero of Iroas");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(1);
    expect(graveyard(game).length).toBeGreaterThan(0);
  });
});

describe("Druids' Repository", () => {
  it("gets a charge counter per attacking creature and spends them for mana", () => {
    const { game, a } = table();
    const repo = spawn(game, "Druids' Repository");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, bears);
    expect(counters(game, repo, "charge")).toBe(2);
    activate(game, repo, 0, { settle: false });
    expect(counters(game, repo, "charge")).toBe(1);
    expect(game.state.players[A].manaPool).toHaveLength(1);
  });
});
