/**
 * Rise of the Eldrazi's two keywords: level up (rule 702.87, the `levelUp()`
 * helper) with the leveler's level symbols (rule 711.2, `levelBand` /
 * `levelStatic`), and umbra armor (rule 702.89a, the `umbra-armor` keyword —
 * `Game.umbraArmorInstead`, at an effect's destruction and at the lethal-damage
 * and deathtouch state-based actions).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, counters, destroy, graveyard, keywords, lands, pt, ref, settle, spawn, table, toHand, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const levels = (game: Game, id: ObjectId, n: number): void => {
  for (let i = 0; i < n; i += 1) activate(game, id, 0);
};

describe("level up (rules 702.87, 711)", () => {
  it("Student of Warfare: 1/1 below level 2, 3/3 first strike at 2-6, 4/4 double strike at 7+", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const student = spawn(game, "Student of Warfare");
    levels(game, student, 1);
    expect(counters(game, student, "level")).toBe(1);
    expect(pt(game, student)).toEqual({ power: 1, toughness: 1 });
    levels(game, student, 1);
    expect(pt(game, student)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, student).has("first-strike")).toBe(true);
    levels(game, student, 5);
    expect(counters(game, student, "level")).toBe(7);
    expect(pt(game, student)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, student).has("first-strike")).toBe(false);
    expect(keywords(game, student).has("double-strike")).toBe(true);
  });

  it("is a sorcery-speed ability", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const student = spawn(game, "Student of Warfare");
    toStep(game, "begin-combat");
    expect(() => activate(game, student, 0)).toThrow();
  });

  it("a pump and +1/+1 counters apply on top of the level's base P/T (the rulings)", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const student = spawn(game, "Student of Warfare");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(student)]);
    levels(game, student, 2);
    expect(pt(game, student)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("umbra armor (rule 702.89a)", () => {
  const umbraOn = (game: Game, creature: ObjectId): ObjectId => {
    lands(game, "Forest", 4);
    const umbra = toHand(game, "Bear Umbra");
    cast(game, umbra, { targets: [ref(creature)] });
    return umbra;
  };

  it("a destroy effect destroys the Aura instead, and the creature stays untapped", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const umbra = umbraOn(game, bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    destroy(game, bears);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(graveyard(game)).toContain(umbra);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    destroy(game, bears);
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("lethal damage removes the damage and destroys the Aura instead", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const umbra = umbraOn(game, bears);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(bears)]);
    // The state-based actions run on the game's next pass.
    toStep(game, "begin-combat");
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(graveyard(game)).toContain(umbra);
  });

  it("\"can't be regenerated\" doesn't stop it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const umbra = umbraOn(game, bears);
    game.debugApplyEffect(B, { kind: "destroy", target: 0, cantBeRegenerated: true }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(graveyard(game)).toContain(umbra);
  });

  it("a sacrifice isn't destruction: the creature goes", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    umbraOn(game, bears);
    game.debugApplyEffect(A, { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 }, []);
    toStep(game, "begin-combat");
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("the attack trigger untaps the creature's controller's lands", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    umbraOn(game, bears);
    const tapped = lands(game, "Forest", 2).map((id) => {
      game.state.objects[id].tapped = true;
      return id;
    });
    attack(game, a, [bears]);
    expect(tapped.every((id) => !game.state.objects[id].tapped)).toBe(true);
  });
});
