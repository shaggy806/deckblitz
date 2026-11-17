/**
 * "When you next activate an ability that isn't a mana ability this turn by
 * spending four or more mana to activate it, copy that ability" (Dynaheir,
 * Invoker Adept): a delayed `whenever` watch on `activates-ability` with
 * `manaSpentAtLeast` — the mana that paid the ability's own cost (the
 * `ability-activated` event's `manaSpent`, rules 602.2b, 601.2h) — `once`
 * (rule 603.7b). An ability paid for with less neither fires it nor uses it
 * up. And "you may activate abilities of other creatures you control as
 * though those creatures had haste" (rule 302.6).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, lands, life, nextTurn, spawn, table } from "./harness.js";

describe("Dynaheir, Invoker Adept", () => {
  it("copies the next ability paid with four or more mana, not a cheaper one before it", () => {
    const { game } = table();
    lands(game, "Mountain", 9);
    const dynaheir = spawn(game, "Dynaheir, Invoker Adept");
    const rod = spawn(game, "Rod of Ruin");
    const monkey = spawn(game, "Hog-Monkey");
    activate(game, dynaheir, 0);
    expect(game.state.delayedTriggers).toHaveLength(1);
    // {3}: three mana, not four — Bob takes 1, once, and the watch stays.
    activate(game, rod, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(19);
    expect(game.state.delayedTriggers).toHaveLength(1);
    // Hog-Monkey's exhaust ability, {5}: the ability and its copy.
    activate(game, monkey, 0);
    expect(counters(game, monkey, "+1/+1")).toBe(4);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("lapses at the end of the turn", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const dynaheir = spawn(game, "Dynaheir, Invoker Adept");
    activate(game, dynaheir, 0);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(0);
    const monkey = spawn(game, "Hog-Monkey");
    activate(game, monkey, 0);
    expect(counters(game, monkey, "+1/+1")).toBe(2);
  });

  it("lets another creature that came under your control this turn pay {T}", () => {
    const { game } = table();
    const pyromancer = spawn(game, "Prodigal Pyromancer", A, { sick: true });
    expect(() => activate(game, pyromancer, 0, { targets: [{ kind: "player", player: B }] })).toThrow(/summoning sickness/);
    spawn(game, "Dynaheir, Invoker Adept");
    activate(game, pyromancer, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(19);
  });
});
