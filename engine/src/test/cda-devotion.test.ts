/**
 * Daxos, Blessed by the Sun: a toughness CDA over devotion (rule 604.3, the
 * record's `bug:cda-devotion`, which needed no engine code) and "another
 * creature you control enters or dies".
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, enter, life, pt, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Daxos, Blessed by the Sun", () => {
  it("its toughness is your devotion to white, its own {W}{W} included", () => {
    const { game } = table();
    const daxos = spawn(game, "Daxos, Blessed by the Sun");
    expect(pt(game, daxos)).toEqual({ power: 2, toughness: 2 });
    // Serra Angel's {3}{W}{W} adds two; generic and other colours add none.
    const angel = spawn(game, "Serra Angel");
    spawn(game, "Grizzly Bears");
    expect(pt(game, daxos)).toEqual({ power: 2, toughness: 4 });
    destroy(game, angel);
    expect(pt(game, daxos)).toEqual({ power: 2, toughness: 2 });
  });

  it("an opponent's permanents don't count", () => {
    const { game } = table();
    const daxos = spawn(game, "Daxos, Blessed by the Sun");
    spawn(game, "Serra Angel", B);
    expect(pt(game, daxos).toughness).toBe(2);
  });

  it("the toughness is defined in every zone: from a graveyard it reads the battlefield", () => {
    const { game } = table();
    const daxos = toGraveyard(game, "Daxos, Blessed by the Sun");
    expect(pt(game, daxos).toughness).toBe(0);
    spawn(game, "Serra Angel");
    expect(pt(game, daxos).toughness).toBe(2);
  });

  it("damage that was survivable turns lethal when the devotion falls (rule 704.5g)", () => {
    const { game } = table();
    const daxos = spawn(game, "Daxos, Blessed by the Sun");
    const angel = spawn(game, "Serra Angel");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [{ kind: "object", object: daxos }]);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(zone(game, daxos)).toBe("battlefield");
    destroy(game, angel);
    expect(zone(game, daxos)).toBe("graveyard");
  });

  it("another creature you control entering or dying gains 1 life; yours only, not Daxos", () => {
    const { game } = table();
    const daxos = spawn(game, "Daxos, Blessed by the Sun");
    const bears = enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(21);
    destroy(game, bears);
    expect(life(game, A)).toBe(22);
    const theirs = enter(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(life(game, A)).toBe(22);
    destroy(game, daxos);
    expect(life(game, A)).toBe(22);
  });

  it("a creature dying at the same time as Daxos still gains 1 life (rule 603.10a)", () => {
    const { game } = table();
    spawn(game, "Daxos, Blessed by the Sun");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(life(game, A)).toBe(21);
  });
});
