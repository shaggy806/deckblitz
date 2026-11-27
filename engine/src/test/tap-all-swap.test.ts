import { describe, expect, it } from "vitest";
import { A, B, cast, counters, lands, spawn, table, toHand, toStep } from "./harness.js";

// `tap-all`'s `swap`: "simultaneously untap all tapped creatures and tap all
// untapped creatures" (Breaking Wave). Which are tapped is read once
// (rule 701.26a-b: only untapped permanents tap, only tapped ones untap).
describe("tap-all swap: Breaking Wave", () => {
  it("untaps every tapped creature and taps every untapped one, each player's", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const tappedMine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const untappedMine = spawn(game, "Hill Giant");
    const tappedTheirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untappedTheirs = spawn(game, "Hill Giant", B);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Breaking Wave"));
    expect(game.state.objects[tappedMine].tapped).toBe(false);
    expect(game.state.objects[untappedMine].tapped).toBe(true);
    expect(game.state.objects[tappedTheirs].tapped).toBe(false);
    expect(game.state.objects[untappedTheirs].tapped).toBe(true);
    // Creatures only.
    expect(game.state.objects[land].tapped).toBe(false);
  });

  it("a tapped creature with a stun counter loses the counter and stays tapped (rule 122.1d)", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const stunned = spawn(game, "Grizzly Bears", B, { tapped: true });
    game.state.objects[stunned].counters.stun = 1;
    cast(game, toHand(game, "Breaking Wave"));
    expect(game.state.objects[stunned].tapped).toBe(true);
    expect(counters(game, stunned, "stun")).toBe(0);
  });

  it("can be cast as though it had flash for {2} more", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const giant = spawn(game, "Hill Giant", B);
    toStep(game, "upkeep", B);
    // Bob passes in his upkeep: alice has priority there.
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, toHand(game, "Breaking Wave"), { kicked: true });
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});
