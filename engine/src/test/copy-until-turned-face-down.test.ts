/**
 * Vesuvan Shapeshifter: "As this creature enters or is turned face up, you
 * may choose another creature on the battlefield. If you do, until this
 * creature is turned face down, it becomes a copy of that creature, except it
 * has 'At the beginning of your upkeep, you may turn this creature face
 * down.'" — `CopyOnEnter.untilTurnedFaceDown` (the copy ends as it's turned
 * face down, `CopyEnds` `"turned-face-down"`) and `orTurnedFaceUp` (the same
 * choice, applied while it's turned face up — rule 708.11 — so what sees it
 * turned face up sees the copy; it doesn't enter, 708.8).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, cast, hand, keywords, lands, nextTurn, pt, settle, spawn, table, toHand, toStep } from "./harness.js";

const name = (game: Game, id: ObjectId) => nameOf(game.state.objects[id]);
const faceDown = (game: Game, id: ObjectId) => game.state.objects[id].faceDown !== undefined;
const turnUp = (game: Game, id: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent: id, morph: true } as Action);
  settle(game);
};

describe("Vesuvan Shapeshifter", () => {
  it("enters as a copy with the upkeep ability; turned face down, the copy ends, and turned up it chooses again", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    const shifter = toHand(game, "Vesuvan Shapeshifter");
    a.chooseCopyFn = () => angel;
    cast(game, shifter);
    expect(name(game, shifter)).toBe("Serra Angel");
    expect(keywords(game, shifter).has("flying")).toBe(true);
    // Its upkeep: "you may turn this creature face down" — yes.
    a.chooseModesFn = () => [0];
    toStep(game, "draw");
    expect(faceDown(game, shifter)).toBe(true);
    expect(pt(game, shifter)).toEqual({ power: 2, toughness: 2 });
    // Its morph is Vesuvan Shapeshifter's own {1}{U}: the copy has ended.
    expect(game.state.objects[shifter].copyOf ?? null).toBeNull();
    toStep(game, "precombat-main");
    const asked: (readonly ObjectId[])[] = [];
    a.chooseCopyFn = (_view, _source, options) => {
      asked.push(options);
      return bears;
    };
    turnUp(game, shifter);
    expect(asked).toEqual([[angel, bears]]);
    expect(faceDown(game, shifter)).toBe(false);
    expect(name(game, shifter)).toBe("Grizzly Bears");
    expect(pt(game, shifter)).toEqual({ power: 2, toughness: 2 });
  });

  it("cast face down, it's asked nothing as it enters; turned face up it becomes the copy as it turns (rule 708.11)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const seer = spawn(game, "Fathom Seer", B);
    spawn(game, "Secret Plans");
    const shifter = toHand(game, "Vesuvan Shapeshifter");
    const asked: (readonly ObjectId[])[] = [];
    a.chooseCopyFn = (_view, _source, options) => {
      asked.push(options);
      return seer;
    };
    cast(game, shifter, { via: "face-down", settle: true });
    expect(faceDown(game, shifter)).toBe(true);
    expect(asked).toEqual([]);
    const before = hand(game, A).length;
    turnUp(game, shifter);
    expect(asked).toHaveLength(1);
    expect(name(game, shifter)).toBe("Fathom Seer");
    // Turned face up as Fathom Seer: its own "when this is turned face up"
    // draws two, and Secret Plans one.
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("declining as it's turned face up, it's itself: a 0/0", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    spawn(game, "Grizzly Bears", B);
    const shifter = toHand(game, "Vesuvan Shapeshifter");
    cast(game, shifter, { via: "face-down", settle: true });
    a.chooseCopyFn = () => null;
    turnUp(game, shifter);
    expect(game.state.objects[shifter].zone).toBe("graveyard");
  });

  it("a copy that never turns face down stays one past the end of the turn", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const angel = spawn(game, "Serra Angel", B);
    const shifter = toHand(game, "Vesuvan Shapeshifter");
    a.chooseCopyFn = () => angel;
    cast(game, shifter);
    // Its upkeep: declined.
    const asked: number[] = [];
    a.chooseModesFn = () => {
      asked.push(1);
      return [];
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked).toHaveLength(1);
    expect(faceDown(game, shifter)).toBe(false);
    expect(name(game, shifter)).toBe("Serra Angel");
  });
});
