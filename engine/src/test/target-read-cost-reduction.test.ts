/**
 * An activated ability priced by what it targets (`targetCostReduction`'s
 * `"target-power"`): "Equip {10}. This ability costs {X} less to activate,
 * where X is the power of the creature it targets" (Belt of Giant Strength).
 * The total cost is fixed once the target is chosen (rules 602.2b, 601.2f).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { activate, cast, lands, pt, ref, spawn, table, toHand } from "./harness.js";

const on = (game: ReturnType<typeof table>["game"], id: ObjectId) => game.state.objects[id].attachedTo;
const untapped = (game: ReturnType<typeof table>["game"], ids: readonly ObjectId[]) =>
  ids.filter((id) => game.state.objects[id].tapped !== true).length;

describe("Belt of Giant Strength: equip priced by the target's power", () => {
  it("costs {10} less the power: {3} on a 7-power creature, which then has base 10/10", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const belt = spawn(game, "Belt of Giant Strength");
    const tyrant = spawn(game, "Carnage Tyrant");
    activate(game, belt, 0, { targets: [ref(tyrant)] });
    expect(on(game, belt)).toBe(tyrant);
    expect(untapped(game, forests)).toBe(1);
    expect(pt(game, tyrant)).toEqual({ power: 10, toughness: 10 });
  });

  it("isn't offered on a creature it can't be afforded on, beside one it can", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const belt = spawn(game, "Belt of Giant Strength");
    const bears = spawn(game, "Grizzly Bears");
    const tyrant = spawn(game, "Carnage Tyrant");
    // {8} on the Bears with three lands.
    expect(() => activate(game, belt, 0, { targets: [ref(bears)] })).toThrow();
    expect(on(game, belt)).toBeNull();
    activate(game, belt, 0, { targets: [ref(tyrant)] });
    expect(on(game, belt)).toBe(tyrant);
  });

  it("reads the power as it is, pump included: free at 10 or more", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const belt = spawn(game, "Belt of Giant Strength");
    const tyrant = spawn(game, "Carnage Tyrant");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(tyrant)] });
    expect(pt(game, tyrant).power).toBe(10);
    activate(game, belt, 0, { targets: [ref(tyrant)] });
    expect(on(game, belt)).toBe(tyrant);
    // Base 10/10 under Giant Growth's +3/+3.
    expect(pt(game, tyrant)).toEqual({ power: 13, toughness: 13 });
  });

  it("a power below 0 takes nothing off, and adds nothing: {10}", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 10);
    const belt = spawn(game, "Belt of Giant Strength");
    const rumbler = spawn(game, "Char-Rumbler");
    expect(pt(game, rumbler).power).toBe(-1);
    activate(game, belt, 0, { targets: [ref(rumbler)] });
    expect(on(game, belt)).toBe(rumbler);
    expect(untapped(game, forests)).toBe(0);
  });
});
