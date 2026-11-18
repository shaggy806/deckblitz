/**
 * "Each player gains control of a nonland permanent of your choice
 * controlled by the player to their right" (Inniaz, the Gale Force): a
 * `vote` with `choose`, `who: "you"` and `about: "each-player"` — one
 * question per player, of their nonland permanents — then `rotate-control`
 * over `{ thisWay: "chosen" }`, every chosen permanent to the player to its
 * controller's left, at once.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, attack, controller, lands, spawn, table } from "./harness.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";

/** The seat answers each choose-permanents with the first of `wanted` it
 * offers, recording what each question offered. */
function chooseAmong(seat: ScriptedController, wanted: readonly ObjectId[]): (readonly ObjectId[])[] {
  const offers: (readonly ObjectId[])[] = [];
  seat.choosePermanentsFn = (_view, eligible) => {
    offers.push(eligible);
    const pick = wanted.find((id) => eligible.includes(id));
    return pick === undefined ? [] : [pick];
  };
  return offers;
}

describe("Inniaz, the Gale Force: each player takes the permanent you chose from the player to their right", () => {
  it("rotates one chosen nonland permanent per player, leftward round the table", () => {
    const { game, a } = table({ players: 3 });
    const inniaz = spawn(game, "Inniaz, the Gale Force");
    const drakes = [spawn(game, "Wind Drake"), spawn(game, "Wind Drake")];
    const aliceGiant = spawn(game, "Hill Giant", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobOther = spawn(game, "Hill Giant", B);
    const carolBears = spawn(game, "Grizzly Bears", C);
    const [carolLand] = lands(game, "Forest", 1, C);
    const offers = chooseAmong(a, [aliceGiant, bobBears, carolBears]);
    attack(game, a, [inniaz, ...drakes]);
    // One question per player, starting with you; no land offered.
    expect(offers).toHaveLength(3);
    for (const offer of offers) expect(offer).not.toContain(carolLand);
    // Alice's right is Carol, Bob's is Alice, Carol's is Bob.
    expect(controller(game, carolBears)).toBe(A);
    expect(controller(game, aliceGiant)).toBe(B);
    expect(controller(game, bobBears)).toBe(C);
    expect(controller(game, bobOther)).toBe(B);
    expect(controller(game, carolLand)).toBe(C);
  });

  it("exchanges the two chosen permanents in a two-player game", () => {
    const { game, a } = table();
    const inniaz = spawn(game, "Inniaz, the Gale Force");
    const drakes = [spawn(game, "Wind Drake"), spawn(game, "Wind Drake")];
    const aliceGiant = spawn(game, "Hill Giant", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    chooseAmong(a, [aliceGiant, bobBears]);
    attack(game, a, [inniaz, ...drakes]);
    expect(controller(game, aliceGiant)).toBe(B);
    expect(controller(game, bobBears)).toBe(A);
  });

  it("gives the player to the left of one with no nonland permanent nothing", () => {
    const { game, a } = table({ players: 3 });
    const inniaz = spawn(game, "Inniaz, the Gale Force");
    const drakes = [spawn(game, "Wind Drake"), spawn(game, "Wind Drake")];
    const aliceGiant = spawn(game, "Hill Giant", A);
    const carolBears = spawn(game, "Grizzly Bears", C);
    const offers = chooseAmong(a, [aliceGiant, carolBears]);
    attack(game, a, [inniaz, ...drakes]);
    // Bob has nothing to choose: not asked about.
    expect(offers).toHaveLength(2);
    expect(controller(game, carolBears)).toBe(A);
    expect(controller(game, aliceGiant)).toBe(B);
  });

  it("doesn't trigger with only two fliers attacking", () => {
    const { game, a } = table();
    const inniaz = spawn(game, "Inniaz, the Gale Force");
    const drake = spawn(game, "Wind Drake");
    const aliceGiant = spawn(game, "Hill Giant", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const offers = chooseAmong(a, [aliceGiant, bobBears]);
    attack(game, a, [inniaz, drake]);
    expect(offers).toHaveLength(0);
    expect(controller(game, bobBears)).toBe(B);
  });
});
