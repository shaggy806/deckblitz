/**
 * "The number of unlocked doors among Rooms you control" (rule 709.5c): the
 * `"unlocked-doors"` aggregate, summed over Rooms — Misty Salon's X/X
 * Spirit, X read as the ability resolves. Beside it Smoky Lounge's "Spend
 * this mana only to cast Room spells and unlock doors" (rule 106.6, the
 * `"unlock-door"` purpose).
 */
import { describe, expect, it } from "vitest";

import { noteStateMutation } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, pt, settle, spawn, table, toHand, toStep } from "./harness.js";

const SPIRIT = "Spirit Token (Unwilling Vessel)";

const spirits = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].cardName === SPIRIT && game.state.objects[id].controller === A);

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** Tap every land of A's named `name`: what's left to pay with is the pool. */
const tapAll = (game: Game, name: string): void => {
  for (const id of game.battlefield) {
    const object = game.state.objects[id];
    if (object.cardName === name && object.controller === A) object.tapped = true;
  }
  noteStateMutation();
};

/** A's Smoky Lounge // Misty Salon cast for its Lounge, then on to A's next
 * first main phase, the Lounge's {R}{R} in the pool and the Mountains tapped. */
function loungeMana(): { game: Game; room: ObjectId } {
  const { game } = table();
  lands(game, "Mountain", 3);
  const room = toHand(game, "Smoky Lounge // Misty Salon");
  cast(game, room, { face: 1, targets: [] });
  expect(game.state.objects[room].doors).toEqual({ left: true, right: false });
  toStep(game, "precombat-main", A);
  // The Lounge's trigger resolves: {R}{R} in the pool.
  settle(game);
  expect(game.state.turn.step).toBe("precombat-main");
  tapAll(game, "Mountain");
  return { game, room };
}

describe("Misty Salon: an X/X Spirit, X the unlocked doors among Rooms you control", () => {
  it("cast alone, its own door is the one: a 1/1", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Smoky Lounge // Misty Salon"), { face: 2, targets: [] });
    const [spirit] = spirits(game);
    expect(pt(game, spirit)).toEqual({ power: 1, toughness: 1 });
  });

  it("counts another Room's two doors and its own, not a locked Room's: a 3/3", () => {
    const { game } = table();
    const annex = spawn(game, "Unholy Annex // Ritual Chamber");
    game.state.objects[annex].doors = { left: true, right: true };
    const locked = spawn(game, "Bottomless Pool // Locker Room");
    game.state.objects[locked].doors = { left: false, right: false };
    noteStateMutation();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Smoky Lounge // Misty Salon"), { face: 2, targets: [] });
    expect(pt(game, spirits(game)[0])).toEqual({ power: 3, toughness: 3 });
  });

  it("unlocked with Smoky Lounge's {R}{R}, both its doors count: a 2/2", () => {
    const { game, room } = loungeMana();
    // {3}{U}: the {R}{R}, an Island and a Wastes.
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(game.state.objects[room].doors).toEqual({ left: true, right: true });
    expect(pt(game, spirits(game)[0])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rampaging Soulrager: +3/+0 with two or more unlocked doors among Rooms you control", () => {
  it("one door isn't enough; a second, unlocked on the same Room, is", () => {
    const { game } = table();
    const soulrager = spawn(game, "Rampaging Soulrager");
    lands(game, "Mountain", 3);
    const room = toHand(game, "Smoky Lounge // Misty Salon");
    cast(game, room, { face: 1, targets: [] });
    expect(pt(game, soulrager)).toEqual({ power: 1, toughness: 4 });
    lands(game, "Island", 4);
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(pt(game, soulrager)).toEqual({ power: 4, toughness: 4 });
  });

  it("an opponent's Rooms don't count", () => {
    const { game } = table();
    const soulrager = spawn(game, "Rampaging Soulrager");
    const theirs = spawn(game, "Unholy Annex // Ritual Chamber", B);
    game.state.objects[theirs].doors = { left: true, right: true };
    noteStateMutation();
    expect(pt(game, soulrager)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Smoky Lounge's {R}{R}", () => {
  it("casts a Room spell, and no other spell", () => {
    const { game } = loungeMana();
    const bolt = toHand(game, "Lightning Bolt");
    expect(castable(game, bolt)).toBe(false);
    lands(game, "Swamp", 1);
    // Unholy Annex's {2}{B}: the {R}{R} and the Swamp.
    const annex = toHand(game, "Unholy Annex // Ritual Chamber");
    expect(castable(game, annex)).toBe(true);
    cast(game, annex, { face: 1, targets: [] });
    expect(game.state.objects[annex].zone).toBe("battlefield");
  });
});
