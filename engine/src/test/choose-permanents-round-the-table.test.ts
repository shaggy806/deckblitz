/**
 * "Starting with you and proceeding in the chosen direction, each player
 * chooses a creature controlled by the next player in that direction. Each
 * player gains control of the creature they chose" (Order of Succession): a
 * `vote` with `choose`, `startingWith: "you"` and `proceeding` (the order round
 * the table, not the turn order), each player's choices read from their own
 * side (`own`, `controlledBy: "player-to-your-left"` / `-right`), then
 * `rotate-control` that way over `{ thisWay: "chosen" }`.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, controller, lands, pickModes, spawn, table, toHand } from "./harness.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/** Each seat answers its choose-permanents with the first of `wanted` it's
 * offered, recording who was asked, in order, and what they were offered. */
function chooseAmong(
  seats: readonly ScriptedController[],
  wanted: readonly ObjectId[],
): { readonly player: PlayerId; readonly offered: readonly ObjectId[] }[] {
  const asked: { player: PlayerId; offered: readonly ObjectId[] }[] = [];
  for (const seat of seats) {
    seat.choosePermanentsFn = (_view, eligible) => {
      asked.push({ player: seat.playerId, offered: eligible });
      const pick = wanted.find((id) => eligible.includes(id));
      return pick === undefined ? [] : [pick];
    };
  }
  return asked;
}

/** Alice casts Order of Succession, choosing `mode` (0 left, 1 right). */
function succession(game: Parameters<typeof cast>[0], a: ScriptedController, mode: number): void {
  lands(game, "Island", 4);
  pickModes(a, mode);
  cast(game, toHand(game, "Order of Succession"));
}

describe("Order of Succession: each player takes a creature of the next player in the chosen direction", () => {
  it("left: starting with you, round the table in turn order, each takes from the player to their left", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const giants = [A, B, C, D].map((p) => spawn(game, "Hill Giant", p));
    const asked = chooseAmong([a, b, c, d], giants);
    succession(game, a, 0);
    expect(asked.map((q) => q.player)).toEqual([A, B, C, D]);
    // Each was offered only the next player's creatures.
    expect(asked[0].offered).toEqual([giants[1]]);
    expect(asked[3].offered).toEqual([giants[0]]);
    // Alice took Bob's, Bob Carol's, Carol Dave's, Dave Alice's.
    expect(controller(game, giants[1])).toBe(A);
    expect(controller(game, giants[2])).toBe(B);
    expect(controller(game, giants[3])).toBe(C);
    expect(controller(game, giants[0])).toBe(D);
  });

  it("right: starting with you, the other way round, each takes from the player to their right", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const giants = [A, B, C, D].map((p) => spawn(game, "Hill Giant", p));
    const asked = chooseAmong([a, b, c, d], giants);
    succession(game, a, 1);
    expect(asked.map((q) => q.player)).toEqual([A, D, C, B]);
    expect(asked[0].offered).toEqual([giants[3]]);
    expect(controller(game, giants[3])).toBe(A);
    expect(controller(game, giants[0])).toBe(B);
    expect(controller(game, giants[1])).toBe(C);
    expect(controller(game, giants[2])).toBe(D);
  });

  it("gives nothing to a player whose next player controls no creature", () => {
    const { game, a, b, c } = table({ players: 3 });
    const aliceGiant = spawn(game, "Hill Giant", A);
    const carolBears = spawn(game, "Grizzly Bears", C);
    const asked = chooseAmong([a, b, c], [aliceGiant, carolBears]);
    succession(game, a, 0);
    // Alice's left is Bob, who has no creature: Alice isn't asked.
    expect(asked.map((q) => q.player)).toEqual([B, C]);
    expect(controller(game, carolBears)).toBe(B);
    expect(controller(game, aliceGiant)).toBe(C);
  });

  it("moves only the chosen creature, not the next player's others", () => {
    const { game, a, b } = table();
    const aliceGiant = spawn(game, "Hill Giant", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobGiant = spawn(game, "Hill Giant", B);
    const asked = chooseAmong([a, b], [bobGiant, aliceGiant]);
    succession(game, a, 0);
    expect(asked.map((q) => q.player)).toEqual([A, B]);
    expect(asked[0].offered).toEqual([bobBears, bobGiant]);
    expect(controller(game, bobGiant)).toBe(A);
    expect(controller(game, bobBears)).toBe(B);
    expect(controller(game, aliceGiant)).toBe(B);
  });

  it("swaps one creature each way in a two-player game", () => {
    const { game, a, b } = table();
    const aliceGiant = spawn(game, "Hill Giant", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    chooseAmong([a, b], [aliceGiant, bobBears]);
    succession(game, a, 1);
    expect(controller(game, bobBears)).toBe(A);
    expect(controller(game, aliceGiant)).toBe(B);
  });
});

describe("Grenzo's Rebuttal: starting with you, each player chooses an artifact, a creature and a land of the player to their left", () => {
  it("destroys what each player chose among the permanents of the player to their left, the Ogre included", () => {
    const { game, a, b, c } = table({ players: 3 });
    const mountains = lands(game, "Mountain", 6);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobGiant = spawn(game, "Hill Giant", B);
    const [bobForest] = lands(game, "Forest", 1, B);
    const carolGiant = spawn(game, "Hill Giant", C);
    const asked: PlayerId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      asked.push(A);
      // Only Bob's: Alice's left.
      expect([...eligible].sort()).toEqual([bobBears, bobGiant, bobForest].sort());
      return [bobBears, bobForest];
    };
    b.choosePermanentsFn = () => {
      asked.push(B);
      return [];
    };
    c.choosePermanentsFn = (_view, eligible) => {
      asked.push(C);
      const ogre = eligible.find((id) => game.state.objects[id].cardName === "4/4 Red Ogre Token");
      const land = eligible.find((id) => mountains.includes(id));
      return [ogre, land].filter((id): id is ObjectId => id !== undefined);
    };
    cast(game, toHand(game, "Grenzo's Rebuttal"));
    // Bob's only choice, Carol's Giant, isn't asked about.
    expect(asked).toEqual([A, C]);
    expect(game.state.objects[bobBears].zone).toBe("graveyard");
    expect(game.state.objects[bobForest].zone).toBe("graveyard");
    expect(game.state.objects[bobGiant].zone).toBe("battlefield");
    expect(game.state.objects[carolGiant].zone).toBe("graveyard");
    expect(mountains.filter((id) => game.state.objects[id].zone === "graveyard")).toHaveLength(1);
    expect(
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "4/4 Red Ogre Token"),
    ).toHaveLength(0);
  });
});
