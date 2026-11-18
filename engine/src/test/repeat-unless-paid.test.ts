/**
 * "Flip a coin. If you win the flip, destroy target creature an opponent
 * controls. If you lose the flip, destroy target creature you control unless
 * you pay {3} and repeat this process." (Crooked Scales): a `repeat` of the
 * flip whose `again` is a lost flip and whose `mayAgain` costs {3}, then the
 * creature of yours destroyed only when no flip was won (rule 705) — the
 * process ends lost only when the payment is declined or can't be made. The
 * targets are chosen once, on activation (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { A, B, activate, lands, ref, spawn, table, zone } from "./harness.js";

const PROMPT = "Pay {3} and repeat this process? If you don't, your creature is destroyed.";

const flips = (game: Game): boolean[] =>
  game.state.eventLog.flatMap((e) => (e.type === "coin-flipped" && e.won !== undefined ? [e.won] : []));

/** Each "pay {3} and repeat?" answered with `pay`, counted. */
function answering(a: ScriptedController, pay: boolean): { asked: number } {
  const seen = { asked: 0 };
  a.chooseModesFn = (_view, minModes, _max, texts) => {
    if (texts[0] !== PROMPT) return Array.from({ length: minModes }, (_, i) => i);
    seen.asked += 1;
    return pay ? [0] : [];
  };
  return seen;
}

function play(seed: number, pay: boolean, extraMana: number) {
  const { game, a } = table({ seed });
  const scales = spawn(game, "Crooked Scales");
  const theirs = spawn(game, "Grizzly Bears", B);
  const mine = spawn(game, "Grizzly Bears", A);
  const wastes = lands(game, "Wastes", 4 + extraMana);
  const seen = answering(a, pay);
  activate(game, scales, 0, { targets: [ref(theirs), ref(mine)] });
  const untapped = wastes.filter((id) => game.state.objects[id].tapped !== true).length;
  return { game, theirs, mine, asked: seen.asked, flipped: flips(game), untapped };
}

describe("Crooked Scales", () => {
  it("needs both targets to be activated", () => {
    const { game } = table();
    const scales = spawn(game, "Crooked Scales");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    expect(() => activate(game, scales, 0, { targets: [ref(theirs), null] })).toThrow(/target/i);
  });

  it("a won flip destroys their creature; a lost one, the payment declined, destroys yours", () => {
    const outcomes = new Set<boolean>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, theirs, mine, asked, flipped } = play(seed, false, 3);
      expect(flipped).toHaveLength(1);
      outcomes.add(flipped[0]);
      if (flipped[0]) {
        expect(asked).toBe(0);
        expect(zone(game, theirs)).toBe("graveyard");
        expect(zone(game, mine)).toBe("battlefield");
      } else {
        expect(asked).toBe(1);
        expect(zone(game, mine)).toBe("graveyard");
        expect(zone(game, theirs)).toBe("battlefield");
      }
    }
    expect(outcomes).toEqual(new Set([true, false]));
  });

  it("paying {3} flips again with the same targets, until a flip is won or it can't be paid", () => {
    let wonAfterLosing = false;
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const { game, theirs, mine, asked, flipped, untapped } = play(seed, true, 6);
      const won = flipped.includes(true);
      // Each lost flip but a last unpayable one asked, and paid.
      expect(flipped.slice(0, -1).every((f) => !f)).toBe(true);
      expect(untapped).toBe(6 - 3 * asked);
      if (won) {
        expect(flipped[flipped.length - 1]).toBe(true);
        expect(asked).toBe(flipped.length - 1);
        expect(zone(game, theirs)).toBe("graveyard");
        expect(zone(game, mine)).toBe("battlefield");
        if (flipped.length > 1) wonAfterLosing = true;
      } else {
        // Two payments made, the third lost flip not payable: never asked.
        expect(flipped).toHaveLength(3);
        expect(asked).toBe(2);
        expect(zone(game, mine)).toBe("graveyard");
        expect(zone(game, theirs)).toBe("battlefield");
      }
    }
    expect(wonAfterLosing).toBe(true);
  });

  it("with no {3} to pay, a lost flip destroys your creature without asking", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game, mine, asked, flipped } = play(seed, true, 0);
      expect(asked).toBe(0);
      if (!flipped[0]) expect(zone(game, mine)).toBe("graveyard");
    }
  });
});
