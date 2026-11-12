/**
 * The `attack-triggers-own-ability` trigger event — "whenever a creature you
 * control attacking causes a triggered ability of that creature to trigger"
 * (Firebender Ascension): the ability an attack declaration caused, of a
 * creature it named, as it goes on the stack; `"trigger-ability"` is that
 * ability, to copy.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, enter, named, settle, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const red = (game: Game): number => game.state.players[A].manaPool.filter((unit) => unit.type === "R").length;

function setUp(quest: number): { game: Game; ascension: ObjectId; soldier: ObjectId } {
  const { game, a } = table();
  a.chooseModesFn = () => [0];
  const ascension = enter(game, "Firebender Ascension");
  const soldier = named(game, "Soldier Token (Fire Nation Attacks)", A)[0]!;
  game.state.objects[soldier].summoningSick = false;
  if (quest > 0) game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "quest", amount: quest }, [], { source: ascension });
  settle(game);
  return { game, ascension, soldier };
}

function attack(game: Game, attackers: readonly ObjectId[]): void {
  toStep(game, "declare-attackers");
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  game.dispatch({ type: "declare-attackers", player: A, attackers: attackers.map((attacker) => ({ attacker, defender: B })) });
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
}

describe("Firebender Ascension", () => {
  it("a quest counter for the Soldier's firebending; at four, the copy adds another {R}", () => {
    const { game, ascension, soldier } = setUp(3);
    attack(game, [soldier]);
    expect(counters(game, ascension, "quest")).toBe(4);
    expect(red(game)).toBe(2);
  });

  it("below four, a counter and no copy", () => {
    const { game, ascension, soldier } = setUp(0);
    attack(game, [soldier]);
    expect(counters(game, ascension, "quest")).toBe(1);
    expect(red(game)).toBe(1);
  });

  it("an attacker with no attack trigger adds nothing", () => {
    const { game, ascension } = setUp(0);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, [bears]);
    expect(counters(game, ascension, "quest")).toBe(0);
  });
});
