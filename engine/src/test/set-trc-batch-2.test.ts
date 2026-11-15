/**
 * Star Trek Commander (TRC) — completing the set after its release
 * (author-by-set, batch 2): the cards an earlier batch left blocked, each on
 * the clause that blocked it.
 */
import { describe, expect, it } from "vitest";

import { A, activate, lands, ref, settle, spawn, table, toStep, tokensNamed, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "add-counter", target: 0, counter, amount }, [
    ref(id),
  ]);

describe("La Forge, Thoughtful as Ever", () => {
  it("makes a Faerie for each permanent you've put a counter on this turn, not each counter", () => {
    const { game } = table();
    const laForge = spawn(game, "La Forge, Thoughtful as Ever");
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    spawn(game, "Hill Giant"); // no counter
    addCounters(game, bears, "+1/+1", 3);
    addCounters(game, relic, "charge", 1);
    activate(game, laForge);
    expect(tokensNamed(game, "Faerie Token")).toBe(2);
  });
});

describe("The Guardian of Forever", () => {
  it("returns the sacrificed card at the beginning of the next end step", () => {
    const { game, a } = table();
    const guardian = spawn(game, "The Guardian of Forever");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 4);
    a.chooseSacrificesFn = () => [bears];
    activate(game, guardian, 0, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});
