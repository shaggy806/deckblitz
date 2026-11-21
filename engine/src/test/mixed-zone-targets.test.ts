/**
 * One target slot over two zones: "up to one other target creature **from the battlefield or
 * creature card from a graveyard**" (Savior of Ollenbock) — a `one-of` of a battlefield creature
 * and a graveyard creature card, inside `optional` and `other`. The exile is linked to the
 * Savior's stint (rule 607.2a), so its leaves trigger puts back what it exiled, each card under
 * its owner's control, whichever zone it came from.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, controller, destroy, named, spawn, table, toGraveyard, watchTargets, zone } from "./harness.js";

describe("Savior of Ollenbock: a creature or a graveyard creature card in one slot", () => {
  it("is offered both zones' creatures, never itself or a noncreature card", () => {
    const { game, a } = table();
    const savior = spawn(game, "Savior of Ollenbock");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    const dead = toGraveyard(game, "Llanowar Elves", B);
    const spell = toGraveyard(game, "Lightning Bolt", B);
    const seen = watchTargets(a);
    attack(game, a, [savior, giant]);
    expect(seen.asked).toBe(1);
    const offered = seen.offered[0];
    expect(offered).toEqual(expect.arrayContaining([giant, theirs, dead]));
    expect(offered).not.toContain(savior);
    expect(offered).not.toContain(spell);
    // Declined ("up to one"): nothing is exiled.
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, dead)).toBe("graveyard");
  });

  it("exiles a creature from the battlefield, which comes back under its owner's control when the Savior leaves", () => {
    const { game, a } = table();
    const savior = spawn(game, "Savior of Ollenbock");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    watchTargets(a, () => [theirs]);
    attack(game, a, [savior, giant]);
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, savior);
    const back = named(game, "Grizzly Bears");
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
    expect(controller(game, back[0])).toBe(B);
  });

  it("exiles a creature card from an opponent's graveyard and puts it onto the battlefield under its owner's control", () => {
    const { game, a } = table();
    const savior = spawn(game, "Savior of Ollenbock");
    const giant = spawn(game, "Hill Giant");
    const dead = toGraveyard(game, "Llanowar Elves", B);
    watchTargets(a, () => [dead]);
    attack(game, a, [savior, giant]);
    expect(zone(game, dead)).toBe("exile");
    destroy(game, savior);
    const back = named(game, "Llanowar Elves");
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
    expect(controller(game, back[0])).toBe(B);
    expect(controller(game, giant)).toBe(A);
  });
});
