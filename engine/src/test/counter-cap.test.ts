/**
 * Caps on counters: a permanent that "can't have more than N" counters of a
 * kind (rule 122.4 — Rasputin Dreamweaver's `counterCap`: counters put stop
 * at N, and past N all but N come off as a state-based action, 704.5r), an
 * ability that "can't cause the total … to be greater than N" (the
 * Clockwork creatures' `upToTotal`, held after Doubling Season), and "if ~
 * started the turn untapped" (`startedTurnUntapped`, the journal's record of
 * what was tapped as the turn began).
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, counters, lands, nextTurn, ref, registryOf, settle, spawn, table, toStep } from "./harness.js";

const put = (game: Game, id: ObjectId, kind: string, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: kind, amount }, [ref(id)]);

describe("Rasputin Dreamweaver", () => {
  it("enters with seven dream counters", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    expect(counters(game, rasputin, "dream")).toBe(7);
  });

  it("can't have more than seven: counters put are brought to seven instead", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    put(game, rasputin, "dream", 2);
    expect(counters(game, rasputin, "dream")).toBe(7);
    game.state.objects[rasputin].counters.dream = 5;
    put(game, rasputin, "dream", 4);
    expect(counters(game, rasputin, "dream")).toBe(7);
    // Other kinds aren't capped.
    put(game, rasputin, "+1/+1", 9);
    expect(counters(game, rasputin, "+1/+1")).toBe(9);
  });

  it("past seven, all but seven come off as a state-based action (704.5r)", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    game.state.objects[rasputin].counters.dream = 10;
    // The next time a player would receive priority (rule 704.3).
    activate(game, rasputin, 1);
    expect(counters(game, rasputin, "dream")).toBe(7);
  });

  it("its counters pay for mana and prevention", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    activate(game, rasputin, 1);
    expect(counters(game, rasputin, "dream")).toBe(6);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(rasputin)]);
    settle(game);
    expect(game.state.objects[rasputin].zone).toBe("battlefield");
  });

  it("gets a dream counter at your upkeep if it started the turn untapped", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    game.state.objects[rasputin].counters.dream = 3;
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, rasputin, "dream")).toBe(4);
  });

  it("none if it started the turn tapped, though the untap step untapped it", () => {
    const { game } = table();
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    game.state.objects[rasputin].counters.dream = 3;
    nextTurn(game);
    game.state.objects[rasputin].tapped = true;
    toStep(game, "upkeep");
    expect(game.state.objects[rasputin].tapped).toBe(false);
    settle(game);
    expect(counters(game, rasputin, "dream")).toBe(3);
  });

  it("a permanent that came to the battlefield this turn didn't start it", () => {
    const { game } = table();
    nextTurn(game);
    const rasputin = spawn(game, "Rasputin Dreamweaver");
    const started = (): boolean => matchesFilter(game.state, registryOf(game), rasputin, { startedTurnUntapped: true }, { you: A });
    expect(started()).toBe(false);
    nextTurn(game);
    expect(started()).toBe(true);
  });
});

describe("Clockwork Steed", () => {
  it("puts up to X +1/+0 counters, never past four, Doubling Season included", () => {
    const { game, a } = table();
    const steed = spawn(game, "Clockwork Steed");
    spawn(game, "Doubling Season");
    game.state.objects[steed].counters["+1/+0"] = 3;
    lands(game, "Wastes", 1);
    toStep(game, "upkeep");
    settle(game);
    a.chooseNumberFn = (_view, offer) => offer.max ?? 0;
    activate(game, steed, 0, { x: 1 });
    expect(counters(game, steed, "+1/+0")).toBe(4);
  });

  it("does nothing on one with four already", () => {
    const { game, a } = table();
    const steed = spawn(game, "Clockwork Steed");
    expect(counters(game, steed, "+1/+0")).toBe(4);
    lands(game, "Wastes", 2);
    toStep(game, "upkeep");
    settle(game);
    a.chooseNumberFn = (_view, offer) => offer.max ?? 0;
    activate(game, steed, 0, { x: 2 });
    expect(counters(game, steed, "+1/+0")).toBe(4);
  });
});
