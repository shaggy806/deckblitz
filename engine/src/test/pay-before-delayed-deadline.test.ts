/**
 * "… at the beginning of their next upkeep unless they pay {2} before that
 * step" (Sabertooth Cobra, Glass Asp, Nafs Asp): the `delayed-trigger`
 * effect's `unlessPaid`. The damaged player may pay any time they have
 * priority while the delayed ability waits — a special action, so it doesn't
 * use the stack and they keep priority (rule 116.2c, 116.3) — and paid, it
 * never triggers. Each such ability is paid for on its own (Nafs Asp's
 * ruling); once its step has begun, it's too late (Glass Asp's).
 */
import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import type { PlayerId } from "../index.js";
import { A, B, attack, destroy, lands, life, settle, spawn, table, toStep } from "./harness.js";

const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters?.["poison"] ?? 0;
const payOffers = (game: Game, player: PlayerId) =>
  game.legalActions(player).flatMap((a) => (a.kind === "pay-delayed-deadline" ? [a] : []));

describe("Sabertooth Cobra — another poison counter unless they pay {2} before their upkeep", () => {
  it("unpaid, the player gets the second counter at the beginning of their upkeep", () => {
    const t = table();
    const cobra = spawn(t.game, "Sabertooth Cobra");
    attack(t.game, t.a, [cobra]);
    expect(poison(t.game, B)).toBe(1);
    expect(t.game.state.delayedTriggers).toHaveLength(1);
    toStep(t.game, "upkeep", B);
    settle(t.game);
    expect(poison(t.game, B)).toBe(2);
    expect(t.game.state.delayedTriggers).toHaveLength(0);
  });

  it("paid in the attacker's turn, there's no second counter; only the damaged player is offered it", () => {
    const t = table();
    const cobra = spawn(t.game, "Sabertooth Cobra");
    lands(t.game, "Forest", 2, B);
    attack(t.game, t.a, [cobra]);
    expect(payOffers(t.game, A)).toHaveLength(0);
    // Bob gets priority in Alice's end step.
    toStep(t.game, "end", A);
    t.game.advanceUntil((s) => s.priority.holder === B);
    const offers = payOffers(t.game, B);
    expect(offers.map((o) => [o.cardName, o.cost])).toEqual([["Sabertooth Cobra", "{2}"]]);
    t.game.dispatch({ type: "pay-delayed-deadline", player: B, delayed: offers[0].delayed });
    // A special action: nothing went on the stack, and Bob still has priority.
    expect(t.game.state.zones.shared.stack).toHaveLength(0);
    expect(t.game.state.priority.holder).toBe(B);
    expect(t.game.state.delayedTriggers).toHaveLength(0);
    expect(payOffers(t.game, B)).toHaveLength(0);
    toStep(t.game, "upkeep", B);
    settle(t.game);
    expect(poison(t.game, B)).toBe(1);
  });

  it("can't be paid without the mana", () => {
    const t = table();
    const cobra = spawn(t.game, "Sabertooth Cobra");
    lands(t.game, "Forest", 1, B);
    attack(t.game, t.a, [cobra]);
    toStep(t.game, "end", A);
    t.game.advanceUntil((s) => s.priority.holder === B);
    expect(payOffers(t.game, B)).toHaveLength(0);
    const id = t.game.state.delayedTriggers[0].id;
    expect(t.game.canDispatch({ type: "pay-delayed-deadline", player: B, delayed: id })).toMatch(/cannot pay/);
  });

  it("still gives the counter after the Cobra has left the battlefield (the ruling)", () => {
    const t = table();
    const cobra = spawn(t.game, "Sabertooth Cobra");
    attack(t.game, t.a, [cobra]);
    destroy(t.game, cobra);
    toStep(t.game, "upkeep", B);
    settle(t.game);
    expect(poison(t.game, B)).toBe(2);
  });
});

describe("Glass Asp — loses 2 life at their next draw step unless they pay {2}", () => {
  it("unpaid, they lose 2 at their draw step; paid in their upkeep, they don't", () => {
    const t = table();
    const asp = spawn(t.game, "Glass Asp");
    attack(t.game, t.a, [asp]);
    expect(life(t.game, B)).toBe(18);
    toStep(t.game, "draw", B);
    settle(t.game);
    expect(life(t.game, B)).toBe(16);

    const u = table();
    const asp2 = spawn(u.game, "Glass Asp");
    lands(u.game, "Forest", 2, B);
    attack(u.game, u.a, [asp2]);
    toStep(u.game, "upkeep", B);
    const offers = payOffers(u.game, B);
    expect(offers).toHaveLength(1);
    u.game.dispatch({ type: "pay-delayed-deadline", player: B, delayed: offers[0].delayed });
    toStep(u.game, "draw", B);
    settle(u.game);
    expect(life(u.game, B)).toBe(18);
  });

  it("once the draw step has begun it's too late", () => {
    const t = table();
    const asp = spawn(t.game, "Glass Asp");
    lands(t.game, "Forest", 2, B);
    attack(t.game, t.a, [asp]);
    toStep(t.game, "draw", B);
    expect(payOffers(t.game, B)).toHaveLength(0);
    settle(t.game);
    expect(life(t.game, B)).toBe(16);
  });
});

describe("Nafs Asp — each trigger is paid for on its own", () => {
  it("two hits, one paid: they lose 1", () => {
    const t = table();
    const one = spawn(t.game, "Nafs Asp");
    const two = spawn(t.game, "Nafs Asp");
    lands(t.game, "Forest", 1, B);
    attack(t.game, t.a, [one, two]);
    expect(life(t.game, B)).toBe(18);
    expect(t.game.state.delayedTriggers).toHaveLength(2);
    toStep(t.game, "upkeep", B);
    const offers = payOffers(t.game, B);
    expect(offers).toHaveLength(2);
    t.game.dispatch({ type: "pay-delayed-deadline", player: B, delayed: offers[0].delayed });
    // The one Forest is tapped: the other can't be paid now.
    expect(payOffers(t.game, B)).toHaveLength(0);
    toStep(t.game, "draw", B);
    settle(t.game);
    expect(life(t.game, B)).toBe(17);
  });
});

describe("a bot pays it off", () => {
  it("at its last window: three hits, three paid, three poison counters", () => {
    const registry = createDefaultRegistry();
    const players = [A, B];
    const game = Game.create({
      seed: 3,
      shuffle: false,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
      controllers: Object.fromEntries(players.map((p) => [p, new EvalBotController(p, registry, {})])),
      decks: players.map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    spawn(game, "Sabertooth Cobra", A);
    lands(game, "Forest", 3, B);
    game.advanceUntil((s) => s.turn.number > 6 || s.result.over);
    expect(game.eventsOfType("delayed-trigger-paid-off")).toHaveLength(3);
    expect(poison(game, B)).toBe(3);
  });
});
