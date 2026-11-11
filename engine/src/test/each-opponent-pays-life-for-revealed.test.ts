/**
 * Protection Racket: "repeat the following process for each opponent in turn
 * order. Reveal the top card of your library. That player may pay life equal
 * to that card's mana value. If they do, exile that card. Otherwise, put it
 * into your hand." — a `for-each-player` of a `reveal-top` whose `then` is an
 * `each-player-may` asked of that one opponent, its life option the revealed
 * card's mana value. Rule 119.4: life greater than 0 can be paid only with
 * that much; 119.4b: 0 life can always be paid.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, life, spawn, table, toLibrary, toStep, zone } from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** `seat` answers with `answer`, and what it was offered is kept. */
function answers(seat: ScriptedController, tag: string, log: string[], pay: boolean): void {
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    log.push(`${tag}:${texts.join("|")}`);
    return pay ? [0] : [];
  };
}

describe("Protection Racket", () => {
  it("asks each opponent in turn order about a card of their own", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Protection Racket");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const log: string[] = [];
    answers(b, "b", log, true);
    answers(c, "c", log, false);
    toStep(game, "precombat-main");
    // Bob first, about the Giant (4); then Carol, about the Bears (2).
    expect(log).toEqual(["b:Pay 4 life", "c:Pay 2 life"]);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, B)).toBe(16);
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.objects[bears].owner).toBe(A);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("a land costs 0 life to exile", () => {
    const { game, b } = table();
    spawn(game, "Protection Racket");
    const land = toLibrary(game, "Wastes");
    const log: string[] = [];
    answers(b, "b", log, true);
    toStep(game, "precombat-main");
    expect(log).toEqual(["b:Pay 0 life"]);
    expect(zone(game, land)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("an opponent without that much life can't pay, and the card is yours", () => {
    const { game, b } = table();
    spawn(game, "Protection Racket");
    const giant = toLibrary(game, "Hill Giant");
    game.state.players[B].life = 3;
    const log: string[] = [];
    answers(b, "b", log, true);
    toStep(game, "precombat-main");
    expect(log).toEqual([]);
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, B)).toBe(3);
  });
});
