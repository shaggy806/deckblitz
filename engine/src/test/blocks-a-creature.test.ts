/**
 * "Whenever this creature blocks a creature, … that creature" — the `blocks` trigger's
 * `object: "blocked"`: the trigger object is the creature it blocks. Wall of Frost, Wall of Tears,
 * Infernal Medusa, Meglonoth.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, nextTurn, spawn, table, zone } from "./harness.js";

describe("blocks a creature: that creature", () => {
  it("Wall of Frost: the blocked attacker skips its next untap", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Frost", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(0);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[wall].tapped).toBe(false);
  });

  it("Wall of Tears: the blocked attacker returns to its owner's hand at end of combat", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Tears", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("Infernal Medusa: destroys what it blocks, and a non-Wall that blocks it, at end of combat", () => {
    const { game, a, b } = table();
    const medusa = spawn(game, "Infernal Medusa", B);
    // A 3/3: Medusa's 2 damage alone wouldn't kill it.
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: medusa, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("graveyard");

    const second = table();
    const mine = spawn(second.game, "Infernal Medusa");
    const blocker = spawn(second.game, "Hill Giant", B);
    second.b.declareBlockersFn = () => [{ blocker, attacker: mine }];
    attack(second.game, second.a, [mine]);
    expect(zone(second.game, blocker)).toBe("graveyard");
  });

  it("Meglonoth: deals its power to the blocked creature's controller", () => {
    const { game, a, b } = table();
    const meglonoth = spawn(game, "Meglonoth", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: meglonoth, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.players[A].life).toBe(14);
  });
});
