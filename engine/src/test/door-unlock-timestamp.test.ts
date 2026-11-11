/**
 * A Room's door unlocked on the battlefield (rules 709.5e, f): its static
 * abilities apply by the time it was unlocked, not the Room's earlier
 * timestamp (rule 613.7a, `staticTimestamp`). Steaming Sauna's ruling: "if
 * Null Profusion entered first and then you unlocked Steaming Sauna, you would
 * have no maximum hand size", and two the other way round — effects on the
 * maximum hand size apply in timestamp order (rule 613.11).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { staticTimestamp } from "../characteristics.js";
import { rulesTextName } from "../state.js";
import { A, B, hand, lands, nextTurn, pickTargets, settle, spawn, table, toHand, zone } from "./harness.js";

const ROOM = "Roaring Furnace // Steaming Sauna";

/** Cast one door of the Room (face 1 the Furnace, 2 the Sauna). */
const castDoor = (game: Game, face: 1 | 2): ObjectId => {
  const room = toHand(game, ROOM);
  game.dispatch({ type: "cast-spell", player: A, card: room, face, targets: [] });
  settle(game);
  expect(zone(game, room)).toBe("battlefield");
  return room;
};

const unlock = (game: Game, room: ObjectId, door: "left" | "right"): void => {
  game.dispatch({ type: "unlock-door", player: A, permanent: room, door });
  settle(game);
};

/** Alice's hand after her cleanup step, from at least five cards. */
const handAfterCleanup = (game: Game): number => {
  while (hand(game).length < 5) toHand(game, "Wastes");
  nextTurn(game);
  return hand(game).length;
};

describe("Roaring Furnace // Steaming Sauna", () => {
  it("has no maximum hand size when the Sauna is unlocked after Null Profusion entered", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Mountain", 2);
    const room = castDoor(game, 1);
    spawn(game, "Null Profusion");
    // The Room is older than Null Profusion; its Sauna door isn't.
    unlock(game, room, "right");
    expect(game.state.objects[room].doors).toEqual({ left: true, right: true });
    expect(handAfterCleanup(game)).toBeGreaterThanOrEqual(5);
  });

  it("is held to two when Null Profusion enters after the Sauna was unlocked", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Mountain", 2);
    const room = castDoor(game, 1);
    unlock(game, room, "right");
    spawn(game, "Null Profusion");
    expect(handAfterCleanup(game)).toBe(2);
  });

  it("keeps the Room's timestamp for the door it entered with, whatever is unlocked later", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Mountain", 2);
    const room = castDoor(game, 2);
    spawn(game, "Null Profusion");
    // Unlocking the Furnace gives the Sauna's static nothing new.
    unlock(game, room, "left");
    const object = game.state.objects[room];
    const statics = game.registry.get(rulesTextName(object)).static;
    expect(statics.map((s) => staticTimestamp(game.registry, object, s))).toEqual([object.timestamp]);
    expect(handAfterCleanup(game)).toBe(2);
  });

  it("drops the unlock's timestamp with the Room's stay on the battlefield", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Mountain", 2);
    const room = castDoor(game, 1);
    unlock(game, room, "right");
    const object = game.state.objects[room];
    expect(object.doorUnlockedAt?.right).toBeGreaterThan(object.timestamp);
    expect(object.doorUnlockedAt?.left).toBeUndefined();
    game.debugMove(room, "hand");
    expect(game.state.objects[room].doorUnlockedAt).toBeUndefined();
  });

  it("deals damage equal to the cards in hand as the Furnace is unlocked, and draws at the end step", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    lands(game, "Mountain", 2);
    const colossus = spawn(game, "Darksteel Colossus", B);
    pickTargets(a, colossus);
    const room = toHand(game, ROOM);
    const held = hand(game).length - 1;
    game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
    settle(game);
    // The hand as the trigger resolves, the Room no longer in it.
    expect(hand(game).length).toBe(held);
    expect(game.state.objects[colossus].damageMarked).toBe(held);
    unlock(game, room, "right");
    game.advanceUntil((s) => s.turn.step === "cleanup" || s.turn.number > 1);
    expect(hand(game).length).toBe(held + 1);
  });
});
