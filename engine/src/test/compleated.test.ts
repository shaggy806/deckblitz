/**
 * Compleated (rule 702.150a): a planeswalker whose caster paid life for its
 * Phyrexian mana symbols enters with two fewer loyalty counters for each.
 * Nissa, Ascended Animist ({3}{G}{G}{G/P}{G/P}, loyalty 7) and Ajani, Sleeper
 * Agent. Written from the rule and the cards' rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  activate,
  cast,
  counters,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("compleated", () => {
  it("all mana: Nissa enters with her printed 7", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const nissa = toHand(game, "Nissa, Ascended Animist");
    cast(game, nissa);
    expect(counters(game, nissa, "loyalty")).toBe(7);
    expect(life(game, A)).toBe(20);
  });

  it("one {G/P} paid with 2 life: two fewer", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const nissa = toHand(game, "Nissa, Ascended Animist");
    cast(game, nissa);
    expect(life(game, A)).toBe(18);
    expect(counters(game, nissa, "loyalty")).toBe(5);
  });

  it("both {G/P} paid with life: four fewer", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const nissa = toHand(game, "Nissa, Ascended Animist");
    cast(game, nissa);
    expect(life(game, A)).toBe(16);
    expect(counters(game, nissa, "loyalty")).toBe(3);
  });

  it("a planeswalker put onto the battlefield, not cast, enters with its full loyalty", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Ascended Animist");
    expect(counters(game, nissa, "loyalty")).toBe(7);
  });
});

describe("Nissa, Ascended Animist", () => {
  it("+1 makes an X/X Horror, X her loyalty as it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const nissa = toHand(game, "Nissa, Ascended Animist");
    cast(game, nissa);
    activate(game, nissa, 0);
    expect(tokensNamed(game, "Phyrexian Horror Token (Nissa, Ascended Animist)", A)).toBe(1);
    const horror = game.battlefield.find(
      (id) => game.state.objects[id].cardName === "Phyrexian Horror Token (Nissa, Ascended Animist)",
    );
    expect(pt(game, horror!)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Ajani, Sleeper Agent", () => {
  it("+1: a creature card on top must go to your hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    const ajani = toHand(game, "Ajani, Sleeper Agent");
    cast(game, ajani);
    expect(counters(game, ajani, "loyalty")).toBe(4);
    const before = hand(game).length;
    activate(game, ajani, 0);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});
