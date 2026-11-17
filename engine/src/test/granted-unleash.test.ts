/**
 * Unleash granted by a static (rule 702.98a; 614.12: a static that will give
 * the permanent an ability as it enters applies to it entering) — Tesak,
 * Judith's Hellhound's "Other Dogs you control have unleash": each other Dog
 * entering under its controller is asked for the +1/+1 counter, a created
 * token too, and each instance of unleash it will have is its own question.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, enter, keywords, lands, spawn, table, toHand } from "./harness.js";

const cantBlock = (game: Game, id: ObjectId): boolean => restrictionsOf(game.state, game.registry, id).has("cant-block");

const DOG_TOKEN = "1/1 White Dog Token";

describe("Tesak, Judith's Hellhound", () => {
  it("asks another Dog you cast for unleash's counter: with it, it can't block and has haste", () => {
    const { game, a } = table();
    spawn(game, "Tesak, Judith's Hellhound");
    lands(game, "Plains", 2);
    const asked: string[][] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked.push([...options]);
      return options[0];
    };
    const dog = toHand(game, "Alpine Watchdog");
    cast(game, dog);
    expect(asked).toEqual([["+1/+1 counter", "No counter"]]);
    expect(counters(game, dog)).toBe(1);
    expect(keywords(game, dog).has("unleash")).toBe(true);
    expect(cantBlock(game, dog)).toBe(true);
    // "Creatures you control with counters on them have haste."
    expect(keywords(game, dog).has("haste")).toBe(true);
  });

  it("without the counter it can block and has no haste", () => {
    const { game, a } = table();
    spawn(game, "Tesak, Judith's Hellhound");
    lands(game, "Plains", 2);
    a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
    const dog = toHand(game, "Alpine Watchdog");
    cast(game, dog);
    expect(counters(game, dog)).toBe(0);
    expect(cantBlock(game, dog)).toBe(false);
    expect(keywords(game, dog).has("haste")).toBe(false);
  });

  it("doesn't ask a Dog entering under an opponent, or a creature that isn't a Dog", () => {
    const { game, a, b } = table();
    spawn(game, "Tesak, Judith's Hellhound");
    const asked: string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => (asked.push("a"), options[0]);
    b.chooseCreatureTypeFn = (_view, _source, options) => (asked.push("b"), options[0]);
    const theirs = enter(game, "Alpine Watchdog", B);
    const bears = enter(game, "Grizzly Bears");
    expect(asked).toEqual([]);
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });

  it("asks a Dog token as it's created", () => {
    const { game, a } = table();
    spawn(game, "Tesak, Judith's Hellhound");
    let asked = 0;
    a.chooseCreatureTypeFn = (_view, _source, options) => (asked++, options[0]);
    game.debugApplyEffect(A, { kind: "create-token", token: DOG_TOKEN, count: 1 }, []);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(asked).toBe(1);
    const [token] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === DOG_TOKEN);
    expect(token).toBeDefined();
    expect(counters(game, token)).toBe(1);
    expect(cantBlock(game, token)).toBe(true);
  });

  it("asks Tesak its own unleash once: the grant is to other Dogs", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    let asked = 0;
    a.chooseCreatureTypeFn = (_view, _source, options) => (asked++, options[0]);
    const tesak = toHand(game, "Tesak, Judith's Hellhound");
    cast(game, tesak);
    expect(asked).toBe(1);
    expect(counters(game, tesak)).toBe(1);
  });

  it("adds {R} for each attacking creature as it attacks", () => {
    const { game, a } = table();
    const tesak = spawn(game, "Tesak, Judith's Hellhound");
    const bears = spawn(game, "Grizzly Bears");
    const from = game.events.length;
    let pool = 0;
    a.declareAttackersFn = () => [tesak, bears].map((attacker) => ({ attacker, defender: B }));
    // Read the pool while the step that made it lasts (rule 500.4 empties it).
    game.advanceUntil((s) => {
      if (s.turn.step === "declare-attackers") pool = Math.max(pool, poolCounts(s.players[A].manaPool).R ?? 0);
      return s.turn.step === "declare-blockers";
    });
    const added = game.events.slice(from).flatMap((e) => (e.type === "mana-added" && e.player === A ? [e] : []));
    expect(added.reduce((n, e) => n + e.amount, 0)).toBe(2);
    expect(pool).toBe(2);
  });
});
