/**
 * Attached-ref batch, group B: Auras and Equipment whose effects name
 * "enchanted creature" / "equipped creature" (the `"attached"` EffectTargetRef).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Destroy `id` as an effect of bob's, without settling. */
function destroyNow(game: Game, id: ObjectId): void {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
}

describe("Aura enters triggers on the enchanted permanent", () => {
  it("Awakened Awareness: base 1/1, then X +1/+1 counters", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Awakened Awareness"), { targets: [ref(giant)], x: 1 });
    expect(counters(game, giant)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });

  it("Convenient Target suspects the creature, and returns from the graveyard to hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    const aura = toHand(game, "Convenient Target");
    cast(game, aura, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    destroyNow(game, aura);
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    // Still suspected once the Aura is gone.
    expect(keywords(game, bears).has("menace")).toBe(true);
    activate(game, aura, 0);
    expect(zone(game, aura)).toBe("hand");
  });

  it("Silken Strength untaps the creature it enchants", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Silken Strength"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
  });

  it("Level Up: attacking doubles the counters, and draws once power is 10 or more", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 5 }, [ref(giant)]);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Level Up"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Level Up"), { targets: [ref(giant)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(6);
    const before = hand(game).length;
    attack(game, a, [bears, giant]);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(12);
    // The giant (15 power) draws; the bears (4 power) don't.
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Aura upkeep triggers", () => {
  it("Hydra's Growth: one counter on entering, doubled each upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Hydra's Growth"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears)).toBe(2);
  });

  it("Glistening Oil puts a -1/-1 counter on an opponent's creature in its controller's upkeep", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    const oil = toHand(game, "Glistening Oil");
    cast(game, oil, { targets: [ref(giant)] });
    expect(keywords(game, giant).has("infect")).toBe(true);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, giant, "-1/-1")).toBe(1);
  });
});

describe("Aura activated abilities", () => {
  it("Freed from the Real taps and untaps the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const aura = toHand(game, "Freed from the Real");
    cast(game, aura, { targets: [ref(bears)] });
    activate(game, aura, 0);
    expect(game.state.objects[bears].tapped).toBe(true);
    activate(game, aura, 1);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("Path to Redemption, sacrificed: exiles the creature it enchanted and makes an Ally", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 7);
    const aura = toHand(game, "Path to Redemption");
    cast(game, aura, { targets: [ref(bears)] });
    activate(game, aura, 0);
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });

  it("Uneasy Alliance, sacrificed: exiles the creature it enchanted and makes a Ninja for you", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 7);
    const aura = toHand(game, "Uneasy Alliance");
    cast(game, aura, { targets: [ref(bears)] });
    activate(game, aura, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Ninja Token (Dark Leo & Shredder)", A)).toBe(1);
  });
});

describe("Equipment effects on the equipped creature", () => {
  it("Skyclave Pick-Axe attaches as it enters, and landfall pumps the equipped creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const axe = enter(game, "Skyclave Pick-Axe");
    expect(game.state.objects[axe].attachedTo).toBe(bears);
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});
