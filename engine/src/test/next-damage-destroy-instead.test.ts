/**
 * "The next time damage would be dealt to target creature this turn, destroy
 * that creature instead" (Kill-Suit Cultist): a one-shot `replacement-effect`
 * on the target (`next: true`, `object: 0`) whose `instead` is an `{ effect }`
 * — the damage is never dealt (rule 614.6), so nothing that would follow from
 * it happens (the card's ruling).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, life, ref, spawn, table, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function cultistOn(game: Game, creature: ObjectId): void {
  spawn(game, "Swamp", A);
  const cultist = spawn(game, "Kill-Suit Cultist", A);
  activate(game, cultist, 0, { targets: [ref(creature)] });
}

describe("Kill-Suit Cultist: the next damage to the creature destroys it instead", () => {
  it("the creature is destroyed instead of being dealt the damage", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    cultistOn(game, giant);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [{ kind: "object", object: giant }]);
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("the damage isn't dealt: a lifelinking attacker blocked by it gains nothing", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const lifelinker = spawn(game, "Child of Night", A);
    cultistOn(game, giant);
    a.declareAttackersFn = () => [{ attacker: lifelinker, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: lifelinker }];
    const lifeBefore = life(game, A);
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(lifeBefore);
  });

  it("only the next time: once used, later damage is dealt as usual", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    cultistOn(game, giant);
    // Damage to another creature doesn't use it.
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [{ kind: "object", object: other }]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[other].damageMarked).toBe(1);
    expect(game.state.activeReplacements.length).toBe(1);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [{ kind: "object", object: giant }]);
    expect(game.state.activeReplacements.length).toBe(0);
  });

  it("ends with the turn", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    cultistOn(game, giant);
    toStep(game, "upkeep", B);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [{ kind: "object", object: giant }]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("the Cultist is sacrificed to pay for it", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Swamp", A);
    const cultist = spawn(game, "Kill-Suit Cultist", A);
    activate(game, cultist, 0, { targets: [ref(giant)] });
    expect(zone(game, cultist)).toBe("graveyard");
  });
});
