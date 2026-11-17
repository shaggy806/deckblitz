/**
 * The `enters-attacking` trigger event: a creature put onto the battlefield
 * attacking (rule 508.4). It never "attacked" (508.3a), so an `attacks`
 * trigger misses it, and "whenever a creature you control attacks or enters
 * attacking" is both — Arni Metalbrow, one ability written as two entries
 * (`sameAbilityAs`).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, lands, life, pickModes, spawn, table, toHand, toStep, zone } from "./harness.js";
import { invalidateComputedCache } from "../characteristics.js";

/** The seat picks `picks[n]` at its nth choice from a zone, recording what
 * each offered. */
function pickInTurn(seat: ScriptedController, picks: readonly (readonly ObjectId[])[]): ObjectId[][] {
  const offered: ObjectId[][] = [];
  seat.chooseFromZoneFn = (_view, eligible) => {
    offered.push([...eligible]);
    return [...(picks[offered.length - 1] ?? [])];
  };
  return offered;
}

const attacking = (game: Game, id: ObjectId): boolean => game.state.objects[id].attacking === B;

describe("Arni Metalbrow — whenever a creature you control attacks or enters attacking", () => {
  it("pays {1}{R} for a creature card of lesser mana value, put in tapped and attacking — which triggers it again (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Arni Metalbrow");
    const ogre = spawn(game, "Gray Ogre"); // mana value 3
    lands(game, "Mountain", 4);
    const bears = toHand(game, "Grizzly Bears"); // 2
    const elves = toHand(game, "Llanowar Elves"); // 1
    const giant = toHand(game, "Hill Giant"); // 4: not less
    pickModes(a, 0);
    const offered = pickInTurn(a, [[bears], [elves]]);
    a.declareAttackersFn = () => [{ attacker: ogre, defender: B }];
    toStep(game, "combat-damage", A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, giant)).toBe("hand");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(attacking(game, bears)).toBe(true);
    expect(attacking(game, elves)).toBe(true);
    // The Ogre's: less than 3. The Bears' entering attacking: less than 2.
    expect(offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(offered[0]).not.toContain(giant);
    expect(offered[1]).toEqual([elves]);
    toStep(game, "postcombat-main", A);
    // Gray Ogre 2, Grizzly Bears 2, Llanowar Elves 1.
    expect(life(game, B)).toBe(15);
  });

  it("reads a creature that has left as it last existed (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Arni Metalbrow");
    const ogre = spawn(game, "Gray Ogre");
    lands(game, "Mountain", 2);
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    const offered = pickInTurn(a, [[bears]]);
    a.declareAttackersFn = () => [{ attacker: ogre, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(ogre, "graveyard");
    invalidateComputedCache();
    toStep(game, "postcombat-main", A);
    expect(offered[0]).toContain(bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("declined, nothing is paid and nothing put in", () => {
    const { game, a } = table();
    spawn(game, "Arni Metalbrow");
    const ogre = spawn(game, "Gray Ogre");
    lands(game, "Mountain", 2);
    const bears = toHand(game, "Grizzly Bears");
    // Declined: no payment, nothing put in.
    pickModes(a);
    attack(game, a, [ogre]);
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, B)).toBe(18);
  });
});
