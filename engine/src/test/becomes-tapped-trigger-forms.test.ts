/**
 * The forms of "becomes tapped" (rule 701.26a) beside the plain one: once per
 * tapping at the same time ("one or more", Deeproot Pilgrimage), only the first
 * time this turn (Tale of Katara and Toph), and not by attacking (Verity Circle).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  lands,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
} from "./harness.js";

const MERFOLK = "Merfolk Token (Deeproot Waters)";
const merfolkTokens = (game: Game): number => tokensNamed(game, "Merfolk Token", A) + tokensNamed(game, MERFOLK, A);

describe("Whenever one or more ... become tapped", () => {
  it("Deeproot Pilgrimage: a whole attack is one tapping", () => {
    const { game, a } = table();
    spawn(game, "Deeproot Pilgrimage", A);
    const first = spawn(game, "Merfolk Looter", A);
    const second = spawn(game, "Merfolk Looter", A);
    attack(game, a, [first, second]);
    expect(merfolkTokens(game)).toBe(1);
  });

  it("two creatures tapped by one spell are one tapping, a spell apart two", () => {
    const { game } = table();
    spawn(game, "Deeproot Pilgrimage", A);
    const first = spawn(game, "Merfolk Looter", A);
    const second = spawn(game, "Merfolk Looter", A);
    const third = spawn(game, "Merfolk Looter", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(first), ref(second)] });
    expect(merfolkTokens(game)).toBe(1);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(third), null] });
    expect(merfolkTokens(game)).toBe(2);
  });

  it("a nontoken, and yours, is what it looks for", () => {
    const { game } = table();
    spawn(game, "Deeproot Pilgrimage", A);
    const token = spawn(game, "Merfolk Looter", A);
    game.state.objects[token].isToken = true;
    const theirs = spawn(game, "Merfolk Looter", B);
    const other = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(token), ref(other)] });
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(theirs), null] });
    expect(merfolkTokens(game)).toBe(0);
  });

  it("a tap for its own cost is a tapping of its own", () => {
    const { game } = table();
    spawn(game, "Deeproot Pilgrimage", A);
    const looter = spawn(game, "Merfolk Looter", A);
    activate(game, looter, 0);
    settle(game);
    expect(merfolkTokens(game)).toBe(1);
  });
});

describe("becomes tapped for the first time during each of your turns", () => {
  it("Tale of Katara and Toph: the first tap each of your turns, not the second", () => {
    const { game } = table();
    spawn(game, "Tale of Katara and Toph", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(1);
    game.state.objects[bears].tapped = false;
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(1);
  });

  it("a tap before it arrived this turn uses up the first time", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    spawn(game, "Tale of Katara and Toph", A);
    game.state.objects[bears].tapped = false;
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(0);
  });

  it("not on another player's turn, and each of your turns afresh", () => {
    const { game } = table();
    spawn(game, "Tale of Katara and Toph", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Lead Astray", B), { player: B, targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(0);
    nextTurn(game);
    game.state.objects[bears].tapped = false;
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(1);
  });
});

describe("if it isn't being declared as an attacker", () => {
  it("Verity Circle: an opponent's creature tapped by an effect, not by attacking", () => {
    const { game, a, b } = table();
    spawn(game, "Verity Circle", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const before = hand(game, B).length;
    pickModes(b, 0);
    attack(game, a, [bears]);
    expect(hand(game, B).length).toBe(before);
    game.state.objects[bears].tapped = false;
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lead Astray"), { targets: [ref(bears), null] });
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Verity Circle's own ability finds what doesn't fly", () => {
    const { game } = table();
    const circle = spawn(game, "Verity Circle", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 5);
    expect(() => activate(game, circle, 0, { targets: [ref(angel)] })).toThrow();
    activate(game, circle, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
