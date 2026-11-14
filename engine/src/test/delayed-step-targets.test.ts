/**
 * A step-timed delayed ability with targets of its own (`DelayedAt.targets`):
 * chosen as it's put on the stack when the step begins (rule 603.3d), not as
 * it's set up — Swooping Pteranodon's "at the beginning of the next end
 * step, target land deals 3 damage to that creature" (its ruling: "you choose
 * the target land … as the delayed triggered ability triggers"). "That
 * creature" is remembered from the creating ability.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  enter,
  lands,
  nextTurn,
  pickTargets,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("a step-timed delayed trigger choosing its own targets", () => {
  it("Swooping Pteranodon steals a creature, and a land chosen at the end step drops it", () => {
    const { game, a } = table();
    const [mountain] = lands(game, "Mountain", 1);
    lands(game, "Forest", 1, B);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, giant);
    enter(game, "Swooping Pteranodon");
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    // Nothing is asked of the delayed ability until the end step.
    const seen = watchTargets(a, (offered) => [offered[0].includes(mountain) ? mountain : null]);
    toStep(game, "postcombat-main");
    expect(seen.asked).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(mountain);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Feral Encounter's creature deals damage equal to its power at the next combat, both targets chosen then", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const ogre = spawn(game, "Gray Ogre", B);
    a.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Feral Encounter"));
    const seen = watchTargets(a, () => [giant, ogre]);
    expect(seen.asked).toBe(0);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("Feral Encounter cast after combat waits for no later turn's combat", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const ogre = spawn(game, "Gray Ogre", B);
    a.chooseFromZoneFn = () => [];
    toStep(game, "postcombat-main");
    cast(game, toHand(game, "Feral Encounter"));
    const seen = watchTargets(a, () => [giant, ogre]);
    nextTurn(game);
    toStep(game, "begin-combat", B);
    settle(game);
    expect(seen.asked).toBe(0);
    expect(zone(game, ogre)).toBe("battlefield");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("a creature that left and came back isn't 'that creature' any more (rule 603.7c)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1, B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Swooping Pteranodon");
    game.debugApplyEffect(B, { kind: "flicker", target: 0 }, [{ kind: "object", object: giant }]);
    const seen = watchTargets(a, (offered) => [offered[0][0]]);
    toStep(game, "end");
    settle(game);
    // It still triggers and targets a land; the damage goes nowhere.
    expect(seen.asked).toBe(1);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked ?? 0).toBe(0);
  });
});
