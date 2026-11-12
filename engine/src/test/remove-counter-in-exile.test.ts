/**
 * `remove-counters`' `inExile` — counters taken off cards in exile, whoever
 * owns them (rule 122.1: a card in exile keeps its counters) — Mari, the
 * Killing Quill: an opponent's creature that dies is exiled with a hit
 * counter; a Rogue that deals combat damage to that player may remove one
 * from a card they own in exile, and if it does, draws and makes two
 * Treasures.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, destroy, hand, keywords, settle, spawn, table, tokensNamed, toExile, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function hitWith(game: Game, attacker: ObjectId): void {
  toStep(game, "declare-attackers");
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker, defender: B }] });
  game.advanceUntil((s) => s.turn.step === "postcombat-main");
  settle(game);
}

describe("Mari, the Killing Quill", () => {
  it("exiles an opponent's dying creature with a hit counter; a Rogue's hit spends it for a card and two Treasures", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Mari, the Killing Quill");
    const rogue = spawn(game, "Bane Alley Blackguard");
    expect(keywords(game, rogue).has("deathtouch")).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, bears, "hit")).toBe(1);
    const before = hand(game).length;
    hitWith(game, rogue);
    expect(counters(game, bears, "hit")).toBe(0);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("only a card that player owns: none of theirs with a hit counter, nothing", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Mari, the Killing Quill");
    const rogue = spawn(game, "Bane Alley Blackguard");
    // Alice's own card in exile, with a hit counter: not Bob's.
    const mine = toExile(game, "Hill Giant", A);
    game.state.objects[mine].counters.hit = 1;
    const before = hand(game).length;
    hitWith(game, rogue);
    expect(counters(game, mine, "hit")).toBe(1);
    expect(hand(game).length).toBe(before);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});
