/**
 * `attack-with`'s `attackingYourPlaneswalkers`: "whenever an opponent attacks
 * one or more planeswalkers you control" (Mila, Crafty Companion) — once a
 * declaration, only when a planeswalker you control is attacked (rule
 * 508.1b). Mila's back face, Lukka, Wayward Bonder, beside it.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Mila, Crafty Companion", () => {
  it("an opponent attacking one of your planeswalkers puts a loyalty counter on each, once", () => {
    const { game, b } = table();
    spawn(game, "Mila, Crafty Companion");
    const ob = spawn(game, "Ob Nixilis of the Black Oath");
    const other = spawn(game, "Chandra, Acolyte of Flame");
    const before = [counters(game, ob, "loyalty"), counters(game, other, "loyalty")];
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: ob },
      { attacker: elves, defender: ob },
    ];
    toStep(game, "declare-blockers", B);
    settle(game);
    expect(counters(game, ob, "loyalty")).toBe(before[0] + 1);
    expect(counters(game, other, "loyalty")).toBe(before[1] + 1);
  });

  it("an opponent attacking you, the player, doesn't", () => {
    const { game, b } = table();
    spawn(game, "Mila, Crafty Companion");
    const ob = spawn(game, "Ob Nixilis of the Black Oath");
    const before = counters(game, ob, "loyalty");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(counters(game, ob, "loyalty")).toBe(before);
  });

  it("a permanent of yours targeted by an opponent: you may draw", () => {
    const { game, a } = table();
    spawn(game, "Mila, Crafty Companion");
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    const before = hand(game, A).length;
    pickModes(a, 0);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Lukka, Wayward Bonder", () => {
  const lukka = (game: ReturnType<typeof table>["game"]) => {
    lands(game, "Mountain", 6);
    const card = toHand(game, "Mila, Crafty Companion");
    cast(game, card, { face: 1 });
    expect(game.state.objects[card].face).toBe(1);
    return card;
  };

  it("+1: discarding a creature card draws two, another card one", () => {
    const { game, a } = table();
    const card = lukka(game);
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [bears];
    const before = hand(game, A).length;
    activate(game, card, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 2);
  });

  it("+1: a noncreature card draws one", () => {
    const { game, a } = table();
    const card = lukka(game);
    const bolt = toHand(game, "Lightning Bolt");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [bolt];
    const before = hand(game, A).length;
    activate(game, card, 0);
    expect(hand(game, A).length).toBe(before);
    expect(counters(game, card, "loyalty")).toBe(6);
  });

  it("−2: returns a creature card with haste, exiled at your next upkeep", () => {
    const { game } = table();
    const card = lukka(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, card, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("exile");
  });

  it("−7: the emblem's creature deals damage equal to its power as it enters", () => {
    const { game, a } = table();
    const card = lukka(game);
    game.state.objects[card].counters.loyalty = 7;
    activate(game, card, 2);
    expect(graveyard(game, A)).toContain(card);
    pickTargets(a, B);
    const giant = toHand(game, "Hill Giant");
    lands(game, "Mountain", 4);
    cast(game, giant);
    expect(life(game, B)).toBe(17);
  });
});
