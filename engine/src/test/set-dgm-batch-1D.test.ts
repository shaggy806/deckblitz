/**
 * Dragon's Maze, group D: the cards whose behaviour is more than a stat line
 * or a copy of an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const ELEMENTAL = "Elemental Token (Vernal Sovereign)";

describe("Voice of Resurgence", () => {
  it("makes an Elemental when an opponent casts a spell during your turn, not during theirs", () => {
    const { game } = table();
    spawn(game, "Voice of Resurgence");
    lands(game, "Mountain", 2, B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(tokensNamed(game, ELEMENTAL, A)).toBe(1);
    const [token] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === ELEMENTAL);
    // Voice and the token: two creatures.
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });

    nextTurn(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(tokensNamed(game, ELEMENTAL, A)).toBe(1);
  });

  it("makes an Elemental when it dies", () => {
    const { game } = table();
    const voice = spawn(game, "Voice of Resurgence");
    destroy(game, voice);
    expect(tokensNamed(game, ELEMENTAL, A)).toBe(1);
  });
});

describe("Pyrewild Shaman", () => {
  it("returns from the graveyard to hand for {3} when your creatures deal combat damage to a player", () => {
    const { game, a } = table();
    const shaman = toGraveyard(game, "Pyrewild Shaman");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, shaman)).toBe("hand");
  });

  it("stays in the graveyard when you decline to pay", () => {
    const { game, a } = table();
    const shaman = toGraveyard(game, "Pyrewild Shaman");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    pickModes(a);
    attack(game, a, [bears]);
    expect(zone(game, shaman)).toBe("graveyard");
  });
});

describe("Scion of Vitu-Ghazi", () => {
  it("cast from hand: a Bird, then populate copies it", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Scion of Vitu-Ghazi"));
    expect(tokensNamed(game, "Bird Token", A)).toBe(2);
  });

  it("does nothing when it enters without being cast", () => {
    const { game } = table();
    enter(game, "Scion of Vitu-Ghazi");
    expect(tokensNamed(game, "Bird Token", A)).toBe(0);
  });
});

describe("Trostani's Summoner", () => {
  it("makes a Knight, a Centaur and a Rhino", () => {
    const { game } = table();
    enter(game, "Trostani's Summoner");
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
    expect(tokensNamed(game, "Centaur Token", A) + tokensNamed(game, "3/3 Centaur Token", A)).toBe(1);
    expect(tokensNamed(game, "Rhino Token", A)).toBe(1);
  });
});

describe("Maze Behemoth", () => {
  it("gives multicolored creatures you control trample, not monocolored ones", () => {
    const { game } = table();
    spawn(game, "Maze Behemoth");
    const voice = spawn(game, "Voice of Resurgence");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Voice of Resurgence", B);
    expect(keywords(game, voice).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Species Gorger", () => {
  it("returns a creature you control at your upkeep", () => {
    const { game } = table();
    const gorger = spawn(game, "Species Gorger");
    const before = hand(game).length;
    nextTurn(game);
    nextTurn(game);
    // Alice's next turn: the only creature is the Gorger itself.
    expect(zone(game, gorger)).toBe("hand");
    expect(hand(game).length).toBeGreaterThan(before);
  });
});
