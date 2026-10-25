/**
 * Born of the Gods (BNG) — group A: heroic, inspired, Aura-granted abilities
 * and the Fated spells.
 */
import { describe, expect, it } from "vitest";

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
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Raised by Wolves", () => {
  it("makes two Wolves and pumps the enchanted creature per Wolf", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Raised by Wolves"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Wolf Token", A)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Satyr Firedancer", () => {
  it("an instant's damage to an opponent is dealt again to a creature that player controls", () => {
    const { game, a } = table();
    spawn(game, "Satyr Firedancer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Siren of the Silent Song", () => {
  it("inspired: on untapping, each opponent discards a card and mills a card", () => {
    const { game } = table();
    const siren = spawn(game, "Siren of the Silent Song", A, { tapped: true });
    const handBefore = hand(game, B).length;
    const graveBefore = graveyard(game, B).length;
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(siren)]);
    settle(game);
    expect(hand(game, B).length).toBe(handBefore - 1);
    expect(graveyard(game, B).length).toBe(graveBefore + 2);
  });
});

describe("Akroan Conscriptor", () => {
  it("heroic steals another creature, untaps it and gives it haste", () => {
    const { game, a } = table();
    const conscriptor = spawn(game, "Akroan Conscriptor");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(conscriptor)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Hero of Leina Tower", () => {
  it("heroic: paying X puts X +1/+1 counters on it", () => {
    const { game } = table();
    const hero = spawn(game, "Hero of Leina Tower");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hero)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(counters(game, hero)).toBe(2);
    expect(pt(game, hero)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Fated Infatuation", () => {
  it("copies a creature you control", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Fated Infatuation"), { targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears", A).length).toBe(2);
  });
});

describe("Evanescent Intellect", () => {
  it("the enchanted creature can mill a player for three", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Evanescent Intellect"), { targets: [ref(bears)] });
    const before = graveyard(game, B).length;
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 3);
  });
});
