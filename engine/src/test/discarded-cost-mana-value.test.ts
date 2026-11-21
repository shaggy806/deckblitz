/**
 * "The total mana value of the discarded cards" — the cards a "discard X
 * cards" additional cost took (`{ paid: "discarded" }` under a `sum` of
 * `mana-value`), each in the zone the discard put it — on Nahiri's Wrath
 * (gaps key `amount:discarded-as-cost-total-mana-value`).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const clearHand = (game: Game): void => void game.state.zones.perPlayer[A].hand.splice(0);
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Nahiri's Wrath", () => {
  it("deals the discarded cards' total mana value to each target", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    clearHand(game);
    const wrath = toHand(game, "Nahiri's Wrath");
    toHand(game, "Hill Giant");
    toHand(game, "Serra Angel");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const jace = spawn(game, "Jace Beleren", B);
    cast(game, wrath, { x: 2, targets: [ref(dreadmaw), ref(jace)] });
    expect(hand(game)).toHaveLength(0);
    // 4 + 5 to each: the 6/6 and the planeswalker both go.
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, jace)).toBe("graveyard");
  });

  it("takes up to X targets, and counts {X} in a discarded card as 0", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    clearHand(game);
    const wrath = toHand(game, "Nahiri's Wrath");
    toHand(game, "Fireball");
    toHand(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, wrath, { x: 2, targets: [ref(dreadmaw)] });
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).toEqual(
      expect.arrayContaining(["Fireball", "Grizzly Bears", "Nahiri's Wrath"]),
    );
    // Fireball's {X}{R} is 1 off the stack, the Bears 2.
    expect(damage(game, dreadmaw)).toBe(3);
  });
});
