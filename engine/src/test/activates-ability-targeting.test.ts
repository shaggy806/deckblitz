/**
 * The `activates-ability` trigger narrowed by what the ability targets
 * (`targets`, the clause a spell's `CardFilter.targets` takes): Ertha Jo,
 * Frontier Mentor's "whenever you activate an ability that targets a creature
 * or player, copy that ability. You may choose new targets for the copy."
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, enter, lands, life, pickTargets, ref, spawn, table, tokensNamed, zone } from "./harness.js";

describe("Ertha Jo, Frontier Mentor", () => {
  it("makes a Mercenary as it enters", () => {
    const { game } = table();
    enter(game, "Ertha Jo, Frontier Mentor");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
  });

  it("copies an ability that targets a player, which keeps its target", () => {
    const { game } = table();
    spawn(game, "Ertha Jo, Frontier Mentor");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(game.eventsOfType("ability-copied")).toHaveLength(1);
  });

  it("the copy may get a new target", () => {
    const { game, a } = table();
    spawn(game, "Ertha Jo, Frontier Mentor");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, elves);
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("copies an ability that targets a creature, but not one aimed at a land only", () => {
    const { game, a } = table();
    spawn(game, "Ertha Jo, Frontier Mentor");
    const icy = spawn(game, "Icy Manipulator");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const [land] = lands(game, "Forest", 1, B);
    lands(game, "Wastes", 2);
    pickTargets(a, elves);
    activate(game, icy, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[elves].tapped).toBe(true);
    expect(game.eventsOfType("ability-copied")).toHaveLength(1);
    // Untapped again, aimed at a land: no creature or player among its targets.
    const icy2 = spawn(game, "Icy Manipulator");
    activate(game, icy2, 0, { targets: [ref(land)] });
    expect(game.state.objects[land].tapped).toBe(true);
    expect(game.eventsOfType("ability-copied")).toHaveLength(1);
  });

  it("doesn't see an ability with no targets, nor an opponent's", () => {
    const { game } = table();
    spawn(game, "Ertha Jo, Frontier Mentor");
    const refueler = spawn(game, "Rangers' Refueler");
    lands(game, "Wastes", 4);
    activate(game, refueler, 0);
    expect(game.eventsOfType("ability-copied")).toHaveLength(0);
    const theirs = spawn(game, "Prodigal Pyromancer", B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, theirs, 0, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(game.eventsOfType("ability-copied")).toHaveLength(0);
  });
});
