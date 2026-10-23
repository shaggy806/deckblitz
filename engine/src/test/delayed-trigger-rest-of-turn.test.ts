/**
 * "Until end of turn, whenever …" and "until your next turn, whenever …" —
 * a delayed triggered ability with a duration (rule 603.7c): the
 * `delayed-trigger` effect's `at: { whenever }`. Glimpse of Nature fires each
 * time and lapses with the turn; Vraska the Unseen's +1 watches Vraska
 * herself until her controller's next turn; Origin of Thor's chapter II
 * chooses a target of its own each time; Massacre Girl's fires once per
 * token of a stack that dies at once.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  enter,
  hand,
  lands,
  loyalty,
  nextTurn,
  pickTargets,
  pt,
  counters,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("until end of turn, whenever … (Glimpse of Nature)", () => {
  it("fires for each creature spell cast this turn, and not on a later turn", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Glimpse of Nature"));
    const before = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    cast(game, toHand(game, "Llanowar Elves"));
    // Two cast, each drew one: hand +2 (the cast cards were added and left).
    expect(hand(game).length).toBe(before + 2);
    // A noncreature spell doesn't fire it.
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    expect(hand(game).length).toBe(before + 2);
    nextTurn(game); // bob's turn
    nextTurn(game); // alice's again: the duration is over
    const later = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(hand(game).length).toBe(later);
  });
});

describe("until your next turn, whenever … (Vraska the Unseen's +1)", () => {
  it("destroys a creature that deals combat damage to that Vraska, until her controller's next turn", () => {
    const { game, a } = table();
    nextTurn(game); // bob's turn 2
    const vraska = spawn(game, "Vraska the Unseen", B);
    loyalty(game, vraska, 1, { player: B });
    nextTurn(game); // alice's turn 3: still watching
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears], vraska);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[vraska].counters.loyalty).toBe(6 - 2);
    nextTurn(game); // bob's turn 4: it lapses as it begins
    nextTurn(game); // alice's turn 5
    const elves = spawn(game, "Grizzly Bears", A);
    attack(game, a, [elves], vraska);
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("doesn't fire for damage to another planeswalker", () => {
    const { game, a } = table();
    nextTurn(game);
    const vraska = spawn(game, "Vraska the Unseen", B);
    const jace = spawn(game, "Jace Beleren", B);
    loyalty(game, vraska, 1, { player: B });
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears], jace);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("a delayed ability with its own targets (Origin of Thor's II)", () => {
  it("chooses a target each time it triggers", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const saga = spawn(game, "Origin of Thor");
    game.state.objects[saga].counters.lore = 1;
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    nextTurn(game); // bob's
    toStep(game, "precombat-main"); // alice's: chapter II
    settle(game);
    pickTargets(a, bears);
    cast(game, toHand(game, "Llanowar Elves"));
    pickTargets(a, giant);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("a delayed ability over a token stack (Massacre Girl)", () => {
  it("triggers once for each token of a stack that dies at once", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(tokensNamed(game, "Soldier Token")).toBe(2);
    const wurm = spawn(game, "Craw Wurm", B);
    enter(game, "Massacre Girl");
    // 6/4: -1/-1 from the enters ability, then -1/-1 for each of the two
    // Soldiers that died of it.
    expect(tokensNamed(game, "Soldier Token")).toBe(0);
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});
