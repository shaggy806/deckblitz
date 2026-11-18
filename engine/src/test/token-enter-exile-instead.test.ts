/**
 * An `exileInstead` that reaches tokens (rules 614.6, 111.7) — Hallowed
 * Moonlight: "Until end of turn, if a creature would enter and it wasn't
 * cast, exile it instead." Its ruling: "if a creature token would be put onto
 * the battlefield, it's put into exile instead and then ceases to exist."
 * Never created (rule 701.7a): nothing sees it enter.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, counters, hand, lands, life, named, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const moonlight = (game: Game): void => {
  lands(game, "Plains", 2);
  cast(game, toHand(game, "Hallowed Moonlight"));
};

describe("creature tokens exiled instead of entering (Hallowed Moonlight)", () => {
  it("draws a card, and a creature token never enters, one or a stack's worth", () => {
    const { game } = table();
    const before = hand(game, A).length;
    moonlight(game);
    // Hallowed Moonlight left the hand, a card was drawn.
    expect(hand(game, A).length).toBe(before + 1);
    // Bob's Raise the Alarm, cast: the spell was, its tokens weren't. Then
    // twelve Warriors, a stack's worth (Secure the Wastes, X = 12).
    lands(game, "Plains", 15, B);
    const alarm = toHand(game, "Raise the Alarm", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, alarm, { player: B });
    const wastes = toHand(game, "Secure the Wastes", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, wastes, { player: B, x: 12 });
    expect(named(game, "Soldier Token")).toEqual([]);
    expect(named(game, "Warrior Token")).toEqual([]);
    // Ceased to exist (rule 111.7): not left in exile either.
    expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id]?.isToken === true)).toEqual([]);
  });

  it("a noncreature token enters as usual", () => {
    const { game } = table();
    moonlight(game);
    game.debugApplyEffect(B, { kind: "create-token", token: "Treasure Token", count: 1 });
    expect(named(game, "Treasure Token")).toHaveLength(1);
  });

  it("nothing sees an exiled token enter, and its 'then put counters on it' finds nothing", () => {
    const { game } = table();
    spawn(game, "Soul Warden");
    moonlight(game);
    const was = life(game, A);
    game.debugApplyEffect(B, {
      kind: "create-token",
      token: "Soldier Token",
      count: 1,
      thenCounters: { kind: "+1/+1", amount: 2 },
    });
    settle(game);
    expect(named(game, "Soldier Token")).toEqual([]);
    expect(life(game, A)).toBe(was);
  });

  it("a creature card put onto the battlefield is exiled; a creature spell cast enters", () => {
    const { game } = table();
    moonlight(game);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    const cast2 = toHand(game, "Grizzly Bears");
    cast(game, cast2);
    expect(zone(game, cast2)).toBe("battlefield");
    expect(counters(game, cast2)).toBe(0);
  });

  it("ends with the turn: tokens enter again", () => {
    const { game } = table();
    moonlight(game);
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 2 });
    const soldiers = named(game, "Soldier Token");
    expect(soldiers.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
  });
});
