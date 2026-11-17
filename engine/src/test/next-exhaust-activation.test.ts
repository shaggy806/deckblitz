/**
 * "When you next activate an exhaust ability that isn't a mana ability this
 * turn, copy it" (Pit Automaton): a delayed triggered ability (rule 603.7)
 * watching its controller's next exhaust ability (rule 702.177) — a `whenever`
 * watch on `activates-ability` with `exhaust`, `once` (603.7b), lapsing as the
 * turn ends. A mana ability never fires it (605.1a; the card's ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, lands, life, nextTurn, pickTargets, ref, spawn, table, zone } from "./harness.js";

describe("Pit Automaton", () => {
  it("copies the next exhaust ability once, and no later one", () => {
    const { game } = table();
    lands(game, "Swamp", 12);
    const pit = spawn(game, "Pit Automaton");
    const monkey = spawn(game, "Hog-Monkey");
    const second = spawn(game, "Hog-Monkey");
    activate(game, pit, 1);
    expect(game.state.delayedTriggers).toHaveLength(1);
    // "Exhaust — {5}: Put two +1/+1 counters on this creature": the ability and its copy.
    activate(game, monkey, 0);
    expect(counters(game, monkey, "+1/+1")).toBe(4);
    // Used up: the next exhaust ability is only itself.
    activate(game, second, 0);
    expect(counters(game, second, "+1/+1")).toBe(2);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("isn't fired or used up by an ability that isn't an exhaust ability, nor by an exhaust mana ability", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const pit = spawn(game, "Pit Automaton");
    const loot = spawn(game, "Loot, the Pathfinder");
    const monkey = spawn(game, "Hog-Monkey");
    activate(game, pit, 1);
    // An exhaust ability that is a mana ability: "{G}, {T}: Add three mana of any one color".
    activate(game, loot, 0);
    expect(game.state.delayedTriggers).toHaveLength(1);
    // A plain activated ability (Pit Automaton's own, on a second one) isn't an exhaust ability.
    const other = spawn(game, "Pit Automaton");
    activate(game, other, 1);
    expect(game.state.delayedTriggers).toHaveLength(2);
    activate(game, monkey, 0);
    // Both watches fire on the same activation: two copies.
    expect(counters(game, monkey, "+1/+1")).toBe(6);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("pays for the exhaust ability with its own restricted mana", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const pit = spawn(game, "Pit Automaton");
    const helper = spawn(game, "Pit Automaton");
    const monkey = spawn(game, "Hog-Monkey");
    activate(game, pit, 1);
    // {C}{C} spent only on abilities, plus three lands: the {5}.
    activate(game, helper, 0);
    expect(game.state.players[A].manaPool).toHaveLength(2);
    activate(game, monkey, 0);
    expect(counters(game, monkey, "+1/+1")).toBe(4);
  });

  it("may choose new targets for the copy", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const pit = spawn(game, "Pit Automaton");
    const loot = spawn(game, "Loot, the Pathfinder");
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, pit, 1);
    // The copy is aimed at the Bears; the ability itself at B.
    pickTargets(a, bear);
    activate(game, loot, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("lapses at the end of the turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const pit = spawn(game, "Pit Automaton");
    activate(game, pit, 1);
    expect(game.state.delayedTriggers).toHaveLength(1);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});
