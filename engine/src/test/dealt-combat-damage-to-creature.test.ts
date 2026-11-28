/**
 * The journal word `"dealt-combat-damage-to-creature"`: the sources that
 * dealt combat damage to a permanent that was a creature as it was dealt it
 * (rule 510.2) — read by Thirsting Axe's "if equipped creature didn't deal
 * combat damage to a creature this turn, sacrifice it", a `journaled` clause.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, lands, ref, spawn, table, toStep, zone } from "./harness.js";

const equipped = (creature: string) => {
  const t = table();
  const { game } = t;
  const axe = spawn(game, "Thirsting Axe");
  const bearer = spawn(game, creature);
  lands(game, "Plains", 2);
  activate(game, axe, 0, { targets: [ref(bearer)] });
  return { ...t, axe, bearer };
};

describe("Thirsting Axe", () => {
  it("keeps a creature that dealt combat damage to a blocking creature", () => {
    const { game, a, b, bearer } = equipped("Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bearer }];
    attack(game, a, [bearer]);
    toStep(game, "end", A);
    game.advanceUntil((s) => s.turn.number > 1);
    expect(zone(game, bearer)).toBe("battlefield");
  });

  it("sacrifices one that dealt combat damage only to a player", () => {
    const { game, a, bearer, axe } = equipped("Grizzly Bears");
    attack(game, a, [bearer]);
    expect(game.state.players[B].life).toBe(14);
    game.advanceUntil((s) => s.turn.number > 1);
    expect(zone(game, bearer)).toBe("graveyard");
    expect(zone(game, axe)).toBe("battlefield");
  });

  it("noncombat damage to a creature doesn't count", () => {
    const { game, bearer } = equipped("Prodigal Pyromancer");
    const target = spawn(game, "Wall of Stone", B);
    activate(game, bearer, 0, { targets: [ref(target)] });
    game.advanceUntil((s) => s.turn.number > 1);
    expect(zone(game, bearer)).toBe("graveyard");
  });

  it("a creature that didn't fight at all is sacrificed; an unequipped Axe does nothing", () => {
    const { game, bearer } = equipped("Grizzly Bears");
    const t2 = table();
    const lone = spawn(t2.game, "Thirsting Axe");
    game.advanceUntil((s) => s.turn.number > 1);
    t2.game.advanceUntil((s) => s.turn.number > 1);
    expect(zone(game, bearer)).toBe("graveyard");
    expect(zone(t2.game, lone)).toBe("battlefield");
  });
});
