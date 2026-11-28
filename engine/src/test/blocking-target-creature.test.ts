/**
 * "Creatures blocking target attacking creature" — `blockingRelation`'s `of`
 * as a target slot with `relation: "blocking"`, found as the spell resolves
 * (rule 608.2h), in `tap-all`'s filter and a `for-each-permanent`'s. Feint is
 * the proving card: its blockers tapped, which keeps them blocking and dealing
 * damage (rule 506.4b), and every combat damage they and the attacker would
 * deal this turn prevented; an unblocked attacker is untouched.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, life, lands, ref, spawn, table, toHand, toStep } from "./harness.js";

describe("Feint", () => {
  it("taps the creatures blocking the target and prevents its and their combat damage this turn", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const wolf = spawn(game, "Grizzly Bears", B);
    const bystander = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    b.declareBlockersFn = () => [
      { blocker: dreadmaw, attacker: giant },
      { blocker: wolf, attacker: giant },
    ];
    toStep(game, "declare-blockers", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Feint"), { targets: [ref(giant)] });
    // Both blockers tapped, the creature not in combat left alone.
    expect(game.state.objects[dreadmaw].tapped).toBe(true);
    expect(game.state.objects[wolf].tapped).toBe(true);
    expect(game.state.objects[bystander].tapped).toBe(false);
    // Three shields: the Giant's and each blocker's.
    expect(game.state.activeReplacements).toHaveLength(3);
    toStep(game, "postcombat-main", A);
    expect(game.state.objects[giant].zone).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(game.state.objects[dreadmaw].damageMarked).toBe(0);
    expect(game.state.objects[wolf].zone).toBe("battlefield");
    expect(game.state.objects[wolf].damageMarked).toBe(0);
    // The unblocked Bears weren't covered.
    expect(life(game, B)).toBe(18);
    // "This turn": the shields outlast combat.
    expect(game.state.activeReplacements).toHaveLength(3);
  });

  it("with no blockers it prevents the attacker's damage to the player", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "declare-blockers", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Feint"), { targets: [ref(giant)] });
    expect(game.state.activeReplacements).toHaveLength(1);
    toStep(game, "postcombat-main", A);
    expect(life(game, B)).toBe(20);
  });
});
