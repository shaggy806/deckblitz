/**
 * "Sacrifice a creature named Feral Shadow, a creature named Breathstealer,
 * and this creature" (Urborg Panther): `sacrifice.each`, one permanent for
 * each filter, all sacrificed together; and "Sacrifice this creature: Destroy
 * target creature blocking it", "blocking it" read off the sacrificed
 * Panther's last-known information (rules 608.2b, 608.2h).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, pickFromZone, ref, spawn, table, toLibrary, toStep, zone } from "./harness.js";

const offeredIndex = (game: Game, source: ObjectId, index: number): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

describe("Urborg Panther", () => {
  it("sacrifices itself, a Feral Shadow and a Breathstealer to fetch Spirit of the Night", () => {
    const { game, a } = table();
    const panther = spawn(game, "Urborg Panther");
    const shadow = spawn(game, "Feral Shadow");
    const stealer = spawn(game, "Breathstealer");
    const spirit = toLibrary(game, "Spirit of the Night");
    pickFromZone(a, spirit);
    expect(offeredIndex(game, panther, 1)).toBe(true);
    activate(game, panther, 1);
    expect(zone(game, panther)).toBe("graveyard");
    expect(zone(game, shadow)).toBe("graveyard");
    expect(zone(game, stealer)).toBe("graveyard");
    expect(zone(game, spirit)).toBe("battlefield");
  });

  it("can't be activated without each named creature", () => {
    const { game } = table();
    const panther = spawn(game, "Urborg Panther");
    spawn(game, "Feral Shadow");
    // An opponent's Breathstealer can't be sacrificed (rule 701.21a).
    spawn(game, "Breathstealer", B);
    expect(offeredIndex(game, panther, 1)).toBe(false);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: panther, abilityIndex: 1, targets: [] })).not.toBeNull();
  });

  it("destroys a creature blocking it, the Panther sacrificed", () => {
    const { game, a, b } = table();
    const panther = spawn(game, "Urborg Panther");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: panther }];
    a.declareAttackersFn = () => [{ attacker: panther, defender: B }];
    lands(game, "Swamp", 1);
    toStep(game, "declare-blockers");
    expect(() => activate(game, panther, 0, { targets: [ref(elf)] })).toThrow(/target/i);
    activate(game, panther, 0, { targets: [ref(wall)] });
    expect(zone(game, panther)).toBe("graveyard");
    expect(zone(game, wall)).toBe("graveyard");
  });
});
