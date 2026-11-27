/**
 * "Whenever this creature becomes blocked by a creature, that creature's
 * controller sacrifices it at end of combat. If the player does, they create
 * a 0/2 colorless Wall artifact creature token with defender" (Basalt Golem):
 * a delayed `sacrifice-target` of the blocker by its controller, then a
 * `create-token` for `{ controllerOf: "trigger-object" }` only if it was
 * sacrificed this way (the ruling).
 */
import { describe, expect, it } from "vitest";
import { A, B, attack, spawn, table, tokensNamed, zone, destroy } from "./harness.js";

const WALL = "Wall Token (Basalt Golem)";

describe("Basalt Golem", () => {
  it("each blocker is sacrificed at end of combat, and its controller gets a Wall for each", () => {
    const { game, a, b } = table();
    const golem = spawn(game, "Basalt Golem", A, { sick: false });
    const bears = spawn(game, "Hill Giant", B);
    const elves = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [
      { blocker: bears, attacker: golem },
      { blocker: elves, attacker: golem },
    ];
    attack(game, a, [golem]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(tokensNamed(game, WALL, B)).toBe(2);
    expect(tokensNamed(game, WALL, A)).toBe(0);
    // Two 3/3s dealt it 6: the delayed sacrifices don't need the Golem.
    expect(zone(game, golem)).toBe("graveyard");
  });

  it("makes no Wall when the blocker is gone before end of combat", () => {
    const { game, a, b } = table();
    const golem = spawn(game, "Basalt Golem", A, { sick: false });
    const bears = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: golem }];
    a.declareAttackersFn = () => [{ attacker: golem, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length === 0 && s.priority.holder === A && s.delayedTriggers.length > 0,
    );
    destroy(game, bears);
    a.declareAttackersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, WALL, B)).toBe(0);
  });
});
