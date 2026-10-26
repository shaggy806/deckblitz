/**
 * Stronghold (STH, B184), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  named,
  zone,
} from "./harness.js";

describe("Stronghold group B (batch 1)", () => {
  it("Awakening untaps every creature and land at an opponent's upkeep too", () => {
    const { game } = table();
    spawn(game, "Awakening");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const forest = spawn(game, "Forest", B, { tapped: true });
    nextTurn(game, "upkeep");
    // Bob's untap step untaps his own; Alice's tapped Bears untaps only by Awakening.
    game.advanceUntil((s) => s.turn.step === "draw");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[forest].tapped).toBe(false);
  });

  it("Wall of Souls deals the combat damage it's dealt to target opponent, not noncombat", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Souls", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    pickTargets(b, A);
    attack(game, a, [giant]);
    expect(life(game, A)).toBe(17);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(wall)] });
    expect(life(game, A)).toBe(17);
  });

  it("Shard Phoenix's sacrifice deals 2 to each creature without flying; returns only in upkeep", () => {
    const { game } = table();
    const phoenix = spawn(game, "Shard Phoenix");
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    activate(game, phoenix, 0);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
    lands(game, "Mountain", 3);
    expect(() => activate(game, phoenix, 1)).toThrow();
    toStep(game, "upkeep");
    activate(game, phoenix, 1);
    expect(zone(game, phoenix)).toBe("hand");
  });

  it("Hesitation counters the next spell any player casts, and is sacrificed", () => {
    const { game } = table();
    const hesitation = spawn(game, "Hesitation", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, hesitation)).toBe("graveyard");
  });

  it("Change of Heart stops the target attacking this turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Change of Heart"), { targets: [ref(giant)] });
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(20);
  });

  it("Hornet Cannon makes a hasty flying Hornet that's destroyed at the next end step", () => {
    const { game } = table();
    const cannon = spawn(game, "Hornet Cannon");
    lands(game, "Wastes", 3);
    activate(game, cannon, 0);
    const [hornet] = named(game, "Hornet Token");
    expect(hornet).toBeDefined();
    expect(keywords(game, hornet).has("haste")).toBe(true);
    expect(keywords(game, hornet).has("flying")).toBe(true);
    expect(pt(game, hornet)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(tokensNamed(game, "Hornet Token")).toBe(0);
  });

  it("Spitting Hydra enters with four counters and pings a creature for one", () => {
    const { game } = table();
    const hydra = enter(game, "Spitting Hydra");
    expect(counters(game, hydra)).toBe(4);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    activate(game, hydra, 0, { targets: [ref(bears)] });
    activate(game, hydra, 0, { targets: [ref(bears)] });
    expect(counters(game, hydra)).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
