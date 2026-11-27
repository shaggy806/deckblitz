import { describe, expect, it } from "vitest";
import { attack, counters, keywords, settle, spawn, table, toStep } from "./harness.js";

// "This ability triggers only once" (`triggersOnlyOnce`) on a step trigger:
// Acrobatic Cheerleader's survival puts one flying counter on it, ever, for
// this object.
describe("triggers only once on a survival trigger: Acrobatic Cheerleader", () => {
  it("does nothing untapped", () => {
    const { game } = table();
    const cheer = spawn(game, "Acrobatic Cheerleader");
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, cheer, "flying")).toBe(0);
  });

  it("tapped, gets a flying counter, and never triggers again", () => {
    const { game, a } = table();
    const cheer = spawn(game, "Acrobatic Cheerleader");
    attack(game, a, [cheer]);
    settle(game);
    expect(counters(game, cheer, "flying")).toBe(1);
    expect(keywords(game, cheer).has("flying")).toBe(true);
    // Alice's next turn, tapped again in the second main phase: no second
    // counter.
    toStep(game, "precombat-main");
    attack(game, a, [cheer]);
    settle(game);
    expect(game.state.objects[cheer].tapped).toBe(true);
    expect(counters(game, cheer, "flying")).toBe(1);
  });
});
