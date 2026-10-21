/**
 * Guilds of Ravnica (GRN; B125), group E. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const planeswalker = (game: Game, name: string, player: PlayerId, n: number): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].counters.loyalty = n;
  return id;
};

describe("Connive // Concoct", () => {
  it("Connive gains control of a creature with power 2 or less for good", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Connive // Concoct"), { face: 1, targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bears)).toBe(A);
  });

  it("Concoct can return a creature card it just surveilled into the graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    a.chooseScryFn = (_view, cards) => cards;
    pickFromZone(a, bears);
    cast(game, toHand(game, "Connive // Concoct"), { face: 2 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Glaive of the Guildpact", () => {
  it("gives +1/+0 for each Gate you control, with vigilance and menace", () => {
    const { game } = table();
    const glaive = spawn(game, "Glaive of the Guildpact");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, glaive, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(true);
    spawn(game, "Azorius Guildgate");
    spawn(game, "Azorius Guildgate");
    spawn(game, "Azorius Guildgate", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Join Shields", () => {
  it("untaps your creatures and gives them hexproof and indestructible", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Join Shields"));
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
  });
});

describe("Vraska, Regal Gorgon", () => {
  it("−10 puts a +1/+1 counter on each creature you control for each creature card in your graveyard", () => {
    const { game } = table();
    const vraska = planeswalker(game, "Vraska, Regal Gorgon", A, 10);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm");
    toGraveyard(game, "Island");
    toGraveyard(game, "Grizzly Bears", B);
    loyalty(game, vraska, -10);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, elves)).toBe(3);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Vraska's Stoneglare", () => {
  it("gains life equal to the destroyed creature's toughness and can find Vraska in the graveyard", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const vraska = toGraveyard(game, "Vraska, Regal Gorgon");
    lands(game, "Swamp", 5);
    lands(game, "Forest", 1);
    pickModes(a, 0);
    pickFromZone(a, vraska);
    const before = life(game);
    cast(game, toHand(game, "Vraska's Stoneglare"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game)).toBe(before + 4);
    expect(zone(game, vraska)).toBe("hand");
  });
});

describe("Omnispell Adept", () => {
  it("casts an instant or sorcery from hand for free, never a creature", () => {
    const { game, a } = table();
    const adept = spawn(game, "Omnispell Adept");
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Island", 3);
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.casts.map((c) => c.card);
      const way = offer.casts.find((c) => c.card === divination);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: divination, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const before = hand(game).length;
    activate(game, adept, 0);
    expect(offered).toContain(divination);
    expect(offered).not.toContain(bears);
    expect(zone(game, divination)).toBe("graveyard");
    // Divination left the hand, two cards came in.
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Erstwhile Trooper", () => {
  it("discards only a creature card, once each turn, for +2/+2 and trample", () => {
    const { game, a } = table();
    const trooper = spawn(game, "Erstwhile Trooper");
    // Only lands in hand: the cost can't be paid.
    expect(() => activate(game, trooper, 0)).toThrow();
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Craw Wurm");
    a.chooseDiscardsFn = (cards, n) =>
      cards
        .filter((c) => c.id === bears)
        .map((c) => c.id)
        .slice(0, n);
    activate(game, trooper, 0);
    expect(graveyard(game)).toContain(bears);
    expect(pt(game, trooper)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, trooper).has("trample")).toBe(true);
    expect(() => activate(game, trooper, 0)).toThrow();
  });
});
