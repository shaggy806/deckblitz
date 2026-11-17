/**
 * Priority Boarding: "Whenever you roll a die, you may reveal the top card of
 * your library. Do this only once each turn. Whenever you reveal a card with
 * mana value less than the result this way, you may exile it. If you do, you
 * may play it this turn." One trigger a die (`rolls-die`, its value that
 * die's result); the reveal a `may` done once each turn (rule 603.2h); the
 * exile a reflexive triggered ability (rule 603.12) about the revealed card.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";

import { A, cast, lands, nextTurn, pickModes, settle, spawn, table, toLibrary, zone } from "./harness.js";

/** Alice rolls `count` d1s as one roll, each die's result 1 + `modifier`. */
function roll(game: Game, modifier: number, count = 1): void {
  const effect: EffectSpec = { kind: "roll-dice", sides: 1, count, modifier };
  game.debugApplyEffect(A, effect);
  settle(game);
}

describe("Priority Boarding", () => {
  it("exiles a revealed card with mana value less than the result, and it may be played this turn", () => {
    const { game, a } = table();
    spawn(game, "Priority Boarding");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    roll(game, 2);
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("offers no exile for a card whose mana value isn't less than the result, and doesn't trigger again that turn", () => {
    const { game, a } = table();
    spawn(game, "Priority Boarding");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    roll(game, 1);
    expect(zone(game, bears)).toBe("library");
    // It revealed this turn: a 6 now finds it not triggering.
    roll(game, 5);
    expect(zone(game, bears)).toBe("library");
  });

  it("declining the reveal leaves it free to trigger again that turn", () => {
    const { game, a } = table();
    spawn(game, "Priority Boarding");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a);
    roll(game, 5);
    expect(zone(game, bears)).toBe("library");
    pickModes(a, 0);
    roll(game, 5);
    expect(zone(game, bears)).toBe("exile");
  });

  it("exiles only the card it revealed: one drawn in response is gone, and the new top card stays (rule 400.7)", () => {
    const { game, a } = table();
    spawn(game, "Priority Boarding");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "roll-dice", sides: 1, count: 1, modifier: 2 });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id]?.reflexiveTrigger !== undefined));
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    const exiledBefore = Object.values(game.state.objects).filter((o) => o.zone === "exile").length;
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(Object.values(game.state.objects).filter((o) => o.zone === "exile").length).toBe(exiledBefore);
  });

  it("reveals once for a roll of several dice, and again next turn", () => {
    const { game, a } = table();
    spawn(game, "Priority Boarding");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    roll(game, 2, 2);
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("library");
    nextTurn(game);
    nextTurn(game);
    // Alice drew the second Bears in her draw step: put a third on top.
    const third = toLibrary(game, "Grizzly Bears");
    roll(game, 2);
    expect(zone(game, third)).toBe("exile");
  });
});
