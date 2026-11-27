/**
 * An activated ability priced by the +1/+1 counters on what it targets
 * (`targetCostReduction`'s `"target-+1/+1-counters"`): Warrior's Blades'
 * "Equip {3}. This ability costs {1} less to activate for each +1/+1 counter
 * on the creature it targets." The total cost is fixed once the target is
 * chosen (rules 602.2b, 601.2f).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { activate, lands, pt, ref, spawn, table } from "./harness.js";

const on = (game: ReturnType<typeof table>["game"], id: ObjectId) => game.state.objects[id].attachedTo;
const untapped = (game: ReturnType<typeof table>["game"], ids: readonly ObjectId[]) =>
  ids.filter((id) => game.state.objects[id].tapped !== true).length;

describe("Warrior's Blades: equip priced by the target's +1/+1 counters", () => {
  it("costs {1} less per counter: {1} on a creature with two", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 3);
    const blades = spawn(game, "Warrior's Blades");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    activate(game, blades, 0, { targets: [ref(bears)] });
    expect(on(game, blades)).toBe(bears);
    expect(untapped(game, plains)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 5 });
  });

  it("is free at three counters or more, and never below {0}", () => {
    const { game } = table();
    const blades = spawn(game, "Warrior's Blades");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 5;
    activate(game, blades, 0, { targets: [ref(bears)] });
    expect(on(game, blades)).toBe(bears);
  });

  it("isn't offered on a creature without counters it can't afford, beside one it can", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const blades = spawn(game, "Warrior's Blades");
    const plain = spawn(game, "Grizzly Bears");
    const grown = spawn(game, "Runeclaw Bear");
    game.state.objects[grown].counters["+1/+1"] = 2;
    expect(() => activate(game, blades, 0, { targets: [ref(plain)] })).toThrow();
    expect(on(game, blades)).toBeNull();
    activate(game, blades, 0, { targets: [ref(grown)] });
    expect(on(game, blades)).toBe(grown);
  });

  it("other counters take nothing off: {3} with a -1/-1 counter", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 3);
    const blades = spawn(game, "Warrior's Blades");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["-1/-1"] = 1;
    activate(game, blades, 0, { targets: [ref(bears)] });
    expect(on(game, blades)).toBe(bears);
    expect(untapped(game, plains)).toBe(0);
  });
});
