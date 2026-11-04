/**
 * "If you control the artifact with the greatest mana value or tied for the
 * greatest mana value" as an intervening if (rule 603.4): a live maximum,
 * asked as the event happens and again on resolution.
 *
 * Proving card: Padeem, Consul of Innovation.
 */

import { describe, expect, it } from "vitest";

import { B, cast, hand, lands, ref, settle, spawn, table, toHand, toStep, type Table } from "./harness.js";

/** How many cards Padeem's upkeep draws alice. Padeem on the board first. */
function upkeepDraws(t: Table): number {
  toStep(t.game, "upkeep");
  const before = hand(t.game).length;
  settle(t.game);
  return hand(t.game).length - before;
}

describe("Padeem, Consul of Innovation", () => {
  it("draws with the greatest artifact", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Hedron Archive");
    spawn(t.game, "Sol Ring", B);
    expect(upkeepDraws(t)).toBe(1);
  });

  it("draws when tied for it", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Mind Stone");
    spawn(t.game, "Mind Stone", B);
    expect(upkeepDraws(t)).toBe(1);
  });

  it("doesn't trigger when an opponent's artifact is greater", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Sol Ring");
    spawn(t.game, "Hedron Archive", B);
    toStep(t.game, "upkeep");
    // Not "on the stack, then fizzles": the first half of the intervening if.
    expect(t.game.state.zones.shared.stack).toHaveLength(0);
    expect(t.game.state.pendingTriggers).toHaveLength(0);
  });

  it("doesn't draw without an artifact, even with none on the battlefield", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    expect(upkeepDraws(t)).toBe(0);
  });

  it("asks only among artifacts: a bigger nonartifact doesn't matter (the rulings)", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Sol Ring");
    spawn(t.game, "Colossal Dreadmaw", B);
    expect(upkeepDraws(t)).toBe(1);
  });

  it("reads {X} as 0 on the battlefield (the rulings, rule 107.3b)", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Ornithopter");
    spawn(t.game, "Everflowing Chalice", B);
    expect(upkeepDraws(t)).toBe(1);
  });

  it("is asked again on resolution: the artifact gone in response, no card", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    const mine = spawn(t.game, "Hedron Archive");
    spawn(t.game, "Sol Ring", B);
    lands(t.game, "Mountain", 2);
    const shatter = toHand(t.game, "Shatter");
    toStep(t.game, "upkeep");
    expect(t.game.state.zones.shared.stack).toHaveLength(1);
    const before = hand(t.game).length;
    cast(t.game, shatter, { targets: [ref(mine)] });
    expect(t.game.state.objects[mine].zone).toBe("graveyard");
    // One card fewer: the Shatter, with no draw back from the trigger.
    expect(hand(t.game).length).toBe(before - 1);
  });

  it("gives artifacts its controller controls hexproof, and no one else's", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    const mine = spawn(t.game, "Sol Ring");
    const theirs = spawn(t.game, "Sol Ring", B);
    lands(t.game, "Mountain", 2, B);
    const shatter = toHand(t.game, "Shatter", B);
    toStep(t.game, "precombat-main", B);
    expect(() => cast(t.game, shatter, { player: B, targets: [ref(mine)] })).toThrow(/refused/);
    cast(t.game, shatter, { player: B, targets: [ref(theirs)] });
    expect(t.game.state.objects[theirs].zone).toBe("graveyard");
    expect(t.game.state.objects[mine].zone).toBe("battlefield");
  });

  it("doesn't trigger in another player's upkeep", () => {
    const t = table();
    spawn(t.game, "Padeem, Consul of Innovation");
    spawn(t.game, "Sol Ring");
    toStep(t.game, "upkeep", B);
    expect(t.game.state.zones.shared.stack).toHaveLength(0);
    expect(t.game.state.pendingTriggers).toHaveLength(0);
  });
});
