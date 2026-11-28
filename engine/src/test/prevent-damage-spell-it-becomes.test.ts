/**
 * "Prevent all damage target spell would deal this turn" goes on to the
 * permanent a permanent spell becomes (rule 400.7c): a `damage-rule` whose
 * `by.target` is a spell on the stack covers that object's next stint on the
 * battlefield too, as a chosen source's shield does (609.7a) — Shieldmage
 * Elder, whose other ability prevents a target creature's damage.
 */
import { describe, expect, it } from "vitest";

import { B, activate, cast, lands, life, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Shieldmage Elder", () => {
  it("prevents the damage of a creature spell's permanent, its enters trigger included", () => {
    const { game, a } = table();
    const elder = spawn(game, "Shieldmage Elder");
    spawn(game, "Aphetto Grifter");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    const kavu = toHand(game, "Flametongue Kavu");
    cast(game, kavu, { settle: false });
    pickTargets(a, bears);
    activate(game, elder, 1, { targets: [ref(kavu)] });
    expect(zone(game, kavu)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("prevents a sorcery's damage", () => {
    const { game } = table();
    const elder = spawn(game, "Shieldmage Elder");
    spawn(game, "Aphetto Grifter");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, elder, 1, { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20);
  });

  it("taps two Clerics to prevent all damage a target creature would deal this turn", () => {
    const { game, a } = table();
    const elder = spawn(game, "Shieldmage Elder");
    spawn(game, "Benevolent Bodyguard");
    const giant = spawn(game, "Hill Giant");
    activate(game, elder, 0, { targets: [ref(giant)] });
    expect(game.state.objects[elder].tapped).toBe(true);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(20);
  });

  it("without the spell target, the permanent deals its damage", () => {
    const { game, a } = table();
    spawn(game, "Shieldmage Elder");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    const kavu = toHand(game, "Flametongue Kavu");
    pickTargets(a, bears);
    cast(game, kavu);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
