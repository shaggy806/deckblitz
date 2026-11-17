/**
 * "While voting, you get an additional vote" (Brago's Representative — rule
 * 701.38d): its controller's votes all happen when they'd otherwise vote,
 * one more for each instance, none of them optional. Written from the card's
 * Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, pickModes, spawn, table, toHand } from "./harness.js";

/** Two of each basic land for alice: enough for any spell here. */
function mana(game: Game): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, 2);
}

const voters = (game: Game): readonly PlayerId[] => {
  const done = game.state.eventLog.find((e) => e.type === "votes-finished");
  return done?.type === "votes-finished" ? done.votes.map((v) => v.voter) : [];
};

const extraTurn = (game: Game): boolean =>
  game.state.eventLog.some((e) => e.type === "extra-turn-queued" && e.player === A);

describe("Brago's Representative", () => {
  it("alice votes twice, neither optional: time wins two to one", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", A);
    const mins: number[] = [];
    a.chooseModesFn = (_view, minModes) => {
      mins.push(minModes);
      return [0];
    };
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(mins).toEqual([1, 1]);
    expect(voters(game)).toEqual([A, A, B]);
    // Without the additional vote it's a tie, and a tie draws three.
    expect(extraTurn(game)).toBe(true);
  });

  it("the votes can be for different choices", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", A);
    let asked = 0;
    a.chooseModesFn = () => [asked++ === 0 ? 0 : 1];
    pickModes(b, 1);
    mana(game);
    const plea = toHand(game, "Plea for Power");
    const before = hand(game).length;
    cast(game, plea);
    // One time, two knowledge: three cards.
    expect(extraTurn(game)).toBe(false);
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("two Representatives are cumulative: three votes", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", A);
    spawn(game, "Brago's Representative", A);
    pickModes(a, 1);
    pickModes(b, 0);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(voters(game)).toEqual([A, A, A, B]);
  });

  it("an opponent's Representative is that opponent's vote, not alice's", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", B);
    pickModes(a, 0);
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(voters(game)).toEqual([A, B, B]);
    expect(extraTurn(game)).toBe(false);
  });

  it("beside Ballot Broker: the vote it gets, then the one it may decline", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", A);
    spawn(game, "Ballot Broker", A);
    const mins: number[] = [];
    a.chooseModesFn = (_view, minModes) => {
      mins.push(minModes);
      return minModes === 0 ? [] : [0];
    };
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(mins).toEqual([1, 1, 0]);
    expect(voters(game)).toEqual([A, A, B]);
  });

  it("with Illusion of Choice out, bob isn't asked whether: alice picks both of his votes", () => {
    const { game, a, b } = table();
    mana(game);
    spawn(game, "Brago's Representative", B);
    cast(game, toHand(game, "Illusion of Choice"));
    pickModes(a, 0);
    b.chooseModesFn = () => {
      throw new Error("bob was asked a question alice answers");
    };
    const asBob = new ScriptedController(B);
    const forBob: number[] = [];
    asBob.chooseModesFn = (_view, minModes) => {
      forBob.push(minModes);
      return [0];
    };
    a.standInFn = () => asBob;
    cast(game, toHand(game, "Plea for Power"));
    expect(forBob).toEqual([1, 1]);
    expect(voters(game)).toEqual([A, B, B]);
  });
});
