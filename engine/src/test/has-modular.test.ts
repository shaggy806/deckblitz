import { describe, expect, it } from "vitest";
import { B, counters, spawn, table, toStep } from "./harness.js";

// "Each creature you control with modular" (Arcbound Overseer): `hasKeyword: "modular"`, read off
// each creature's text box, since modular is authored as its two parts (rule 702.43a) — "Modular N"
// and "Modular—Sunburst" alike.
describe("Arcbound Overseer: a +1/+1 counter on each creature you control with modular", () => {
  it("counts itself, Modular N and Modular—Sunburst, and nothing without modular or another player's", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem"); // keeps the Wanderer, cast for no colours, alive at 1/1
    const overseer = spawn(game, "Arcbound Overseer");
    const worker = spawn(game, "Arcbound Worker");
    const wanderer = spawn(game, "Arcbound Wanderer");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Arcbound Worker", B);
    // Modular 6: it enters with six +1/+1 counters.
    expect(counters(game, overseer)).toBe(6);
    expect(counters(game, worker)).toBe(1);
    expect(counters(game, wanderer)).toBe(0);

    toStep(game, "draw"); // alice's next upkeep has come and gone
    expect(counters(game, overseer)).toBe(7);
    expect(counters(game, worker)).toBe(2);
    expect(counters(game, wanderer)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(1);
  });
});
