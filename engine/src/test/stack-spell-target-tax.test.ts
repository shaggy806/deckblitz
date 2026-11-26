/**
 * "As long as Kaervek's Torch is on the stack, spells that target it cost
 * {2} more to cast" (`targetedBySpellsCost.whileOnStack`): a static working
 * from a spell on the stack (rule 113.6), taxing every caster's spell aimed
 * at it, its own controller's too, added to the total cost (601.2f).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, ref, toHand, zone } from "./harness.js";
import { table } from "./harness.js";

describe("Kaervek's Torch: spells that target it cost {2} more while it's on the stack", () => {
  it("a Counterspell aimed at it costs {2}{U}{U}, and can't be cast for {U}{U}{U}", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 3);
    const torch = toHand(game, "Kaervek's Torch");
    cast(game, torch, { x: 1, targets: [ref(B)], settle: false });
    expect(zone(game, torch)).toBe("stack");
    const counter = toHand(game, "Counterspell");
    expect(() => cast(game, counter, { targets: [ref(torch)], settle: false })).toThrow(/cannot pay/);
  });

  it("with four lands left the Counterspell is cast, the tax paid, and the Torch countered", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 4);
    const torch = toHand(game, "Kaervek's Torch");
    cast(game, torch, { x: 1, targets: [ref(B)], settle: false });
    const before = life(game, B);
    cast(game, toHand(game, "Counterspell"), { targets: [ref(torch)] });
    expect(zone(game, torch)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
    const untapped = game.state.zones.shared.battlefield.filter((id) => !game.state.objects[id].tapped);
    expect(untapped).toEqual([]);
  });

  it("an opponent's spell aimed at it pays the tax too, and one aimed elsewhere doesn't", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2, B);
    const torch = toHand(game, "Kaervek's Torch");
    cast(game, torch, { x: 1, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    const counter = toHand(game, "Counterspell", B);
    expect(() => cast(game, counter, { player: B, targets: [ref(torch)], settle: false })).toThrow(/cannot pay/);
    lands(game, "Island", 2, B);
    cast(game, counter, { player: B, targets: [ref(torch)] });
    expect(zone(game, torch)).toBe("graveyard");
  });

  it("a spell cast while it's on the stack but aimed elsewhere pays nothing more", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const torch = toHand(game, "Kaervek's Torch");
    cast(game, torch, { x: 1, targets: [ref(B)], settle: false });
    const before = life(game, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 4);
  });
});
