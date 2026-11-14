/**
 * Redirections of one damage event to different chosen permanents, ordered
 * by the affected player (rule 616.1 — the need key
 * `decision:damage-redirect-order`). The one applied first sends the damage
 * to its permanent, where the others not yet applied still apply (614.5,
 * 616.1f) — so with two Gideon's Sacrifices it lands on one of the chosen
 * permanents, the player's choice, and each option says where it lands. Two
 * redirections to permanents of one name, or two from one card, are still
 * two options.
 */
import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, cast, destroy, lands, life, named, pickPermanents, ref, settle, spawn, table, toHand } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Alice's Gideon's Sacrifice, choosing `chosen`. */
function sacrifice(game: Game, seat: ScriptedController, chosen?: ObjectId): void {
  lands(game, "Plains", 1);
  if (chosen !== undefined) pickPermanents(seat, chosen);
  cast(game, toHand(game, "Gideon's Sacrifice"));
}

/** Alice's Lightning Bolt at `target`. */
function bolt(game: Game, target: PlayerId | ObjectId): void {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target)] });
}

/** Answers each question with the option whose result mentions `landsOn`. */
function landingOn(seat: ScriptedController, landsOn: string): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex((o) => o.result?.includes(landsOn) === true));
  };
  return asked;
}

describe("Gideon's Sacrifice", () => {
  it("deals the damage to you and your permanents this turn to the chosen creature instead, while it's there", () => {
    const { game, a } = table();
    const wall = spawn(game, "Wall of Stone", A);
    const bears = spawn(game, "Grizzly Bears", A);
    sacrifice(game, a, wall);
    bolt(game, A);
    expect(life(game, A)).toBe(20);
    expect(damage(game, wall)).toBe(3);
    bolt(game, bears);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, wall)).toBe(6);
    // No longer on the battlefield: not redirected (614.9, the ruling).
    destroy(game, wall);
    bolt(game, A);
    expect(life(game, A)).toBe(17);
  });

  it("does nothing with no creature or planeswalker to choose", () => {
    const { game, a } = table();
    sacrifice(game, a);
    expect(game.state.activeReplacements).toHaveLength(0);
    bolt(game, A);
    expect(life(game, A)).toBe(17);
  });
});

describe("the affected player orders redirections to chosen permanents (616.1)", () => {
  it("two Sacrifices: one question, each option saying where the damage lands", () => {
    for (const landsOn of ["Colossal Dreadmaw", "Wall of Stone"]) {
      const { game, a } = table();
      const dreadmaw = spawn(game, "Colossal Dreadmaw", A);
      const wall = spawn(game, "Wall of Stone", A);
      sacrifice(game, a, dreadmaw);
      sacrifice(game, a, wall);
      const asked = landingOn(a, landsOn);
      bolt(game, A);
      expect(asked).toHaveLength(1);
      expect(asked[0].options.map((o) => o.result).sort()).toEqual([
        "3 damage is dealt to Colossal Dreadmaw",
        "3 damage is dealt to Wall of Stone",
      ]);
      // The one applied first sends it to its permanent, the other on to its
      // own (616.1f): the option says so.
      const first = asked[0].options.find((o) => o.result?.includes(landsOn) === true);
      expect(first?.text).not.toContain(landsOn);
      expect(life(game, A)).toBe(20);
      expect(damage(game, landsOn === "Colossal Dreadmaw" ? dreadmaw : wall)).toBe(3);
      expect(damage(game, landsOn === "Colossal Dreadmaw" ? wall : dreadmaw)).toBe(0);
    }
  });

  it("two permanents of one name are still two options", () => {
    const { game, a } = table();
    const [one, two] = [spawn(game, "Wall of Stone", A), spawn(game, "Wall of Stone", A)];
    sacrifice(game, a, one);
    sacrifice(game, a, two);
    const asked: ReplacementOrderOffer[] = [];
    a.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return 1;
    };
    bolt(game, A);
    expect(asked).toHaveLength(1);
    expect(asked[0].options).toHaveLength(2);
    expect(damage(game, one) + damage(game, two)).toBe(3);
  });

  it("Ascent of the Worthy's chapters I and II from one Saga, both standing, are still a choice", () => {
    for (const pick of [0, 1]) {
      const { game, a } = table();
      const dreadmaw = spawn(game, "Colossal Dreadmaw", A);
      const wall = spawn(game, "Wall of Stone", A);
      const target = spawn(game, "Grizzly Bears", A);
      lands(game, "Scrubland", 3);
      pickPermanents(a, dreadmaw);
      cast(game, toHand(game, "Ascent of the Worthy"));
      const [saga] = named(game, "Ascent of the Worthy");
      // Proliferated the same turn: chapter II while chapter I still stands.
      pickPermanents(a, wall);
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
      settle(game);
      expect(game.state.activeReplacements).toHaveLength(2);
      const asked: ReplacementOrderOffer[] = [];
      a.chooseReplacementOrderFn = (_view, offer) => {
        asked.push(offer);
        return pick;
      };
      bolt(game, target);
      expect(asked).toHaveLength(1);
      expect(asked[0].options.map((o) => o.name)).toEqual(["Ascent of the Worthy", "Ascent of the Worthy"]);
      const landsOn = asked[0].options[pick].result ?? "";
      expect(damage(game, target)).toBe(0);
      expect(damage(game, landsOn.endsWith("Colossal Dreadmaw") ? dreadmaw : wall)).toBe(3);
      // Damage to you isn't covered.
      bolt(game, A);
      expect(life(game, A)).toBe(17);
    }
  });
});
