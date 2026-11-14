/**
 * "A creature that fought this turn" (rule 701.14a): the journal's `fought`
 * entries, one per fighter a fight, read by a `journaled` filter clause in
 * the stint it fought in. Boxing Ring's "activate only if you control a
 * creature that fought this turn" — any fight counts, and one that died of
 * its fight is gone (its rulings).
 */
import { describe, expect, it } from "vitest";

import { activate, B, nextTurn, spawn, table, tokensNamed, watchTargets, enter, zone } from "./harness.js";

describe("a creature that fought this turn", () => {
  it("Boxing Ring's creature fights one with the same mana value, and the winner earns a Treasure", () => {
    const { game, a } = table();
    const ring = spawn(game, "Boxing Ring");
    const memnite = spawn(game, "Memnite", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, ring)).toThrow();
    const seen = watchTargets(a, (offered) => [offered[0].includes(memnite) ? memnite : null]);
    const thopter = enter(game, "Ornithopter");
    expect(seen.asked).toBe(1);
    // Only a creature with the same mana value (0) is offered.
    expect(seen.offered[0]).toContain(memnite);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(game.state.objects[thopter].damageMarked).toBe(1);
    activate(game, ring);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
    // Not next turn.
    nextTurn(game);
    nextTurn(game);
    expect(() => activate(game, ring)).toThrow();
  });

  it("a creature that died of its fight doesn't count (the ruling)", () => {
    const { game, a } = table();
    const ring = spawn(game, "Boxing Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    watchTargets(a, (offered) => [offered[0].includes(theirs) ? theirs : null]);
    const mine = enter(game, "Grizzly Bears");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(() => activate(game, ring)).toThrow();
  });

  it("any fight counts, not only the Ring's", () => {
    const { game } = table();
    const ring = spawn(game, "Boxing Ring");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(game.state.objects[giant].controller, { kind: "fight", a: 0, b: 1 }, [
      { kind: "object", object: giant },
      { kind: "object", object: bears },
    ]);
    activate(game, ring);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });
});
