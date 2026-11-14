import { describe, expect, it } from "vitest";
import { A, B, attack, hand, pickModes, ref, settle, spawn, table, zone } from "./harness.js";

// Grothama, All-Devouring: other creatures may fight it as they attack (the
// static's source, rule 201.5a), and as it leaves each player draws one card
// for each damage dealt to it this turn by sources they controlled.
describe("Grothama, All-Devouring — damage dealt to it, by each source's controller", () => {
  it("splits the draws by who controlled each source", () => {
    const { game, a } = table();
    const grothama = spawn(game, "Grothama, All-Devouring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    // Two damage from bob's own source, earlier in the turn.
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(grothama)], { source: bears });
    const wurm = spawn(game, "Craw Wurm", A);
    pickModes(a, 0);
    const aliceHand = hand(game, A).length;
    const bobHand = hand(game, B).length;
    attack(game, a, [wurm]);
    // The fight: 6 from alice's Craw Wurm makes 8, lethal; 10 back kills the Wurm.
    expect(zone(game, grothama)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(hand(game, A).length - aliceHand).toBe(6);
    expect(hand(game, B).length - bobHand).toBe(2);
  });

  it("lets the attacking creature's controller decline the fight", () => {
    const { game, a } = table();
    const grothama = spawn(game, "Grothama, All-Devouring", B);
    const wurm = spawn(game, "Craw Wurm", A);
    pickModes(a);
    attack(game, a, [wurm]);
    expect(zone(game, grothama)).toBe("battlefield");
    expect(game.state.objects[grothama].damageMarked).toBe(0);
    expect(game.state.players[B].life).toBe(14);
  });

  it("draws nothing for damage dealt to an earlier object of the same card", () => {
    const { game } = table();
    const grothama = spawn(game, "Grothama, All-Devouring", A);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(grothama)], { source: bears });
    const bobHand = hand(game, B).length;
    // Bounced, then back: a new object (rule 400.7), with no damage dealt to it.
    game.debugMove(grothama, "hand");
    settle(game);
    expect(hand(game, B).length - bobHand).toBe(2);
    game.debugMove(grothama, "battlefield");
    game.debugMove(grothama, "graveyard");
    settle(game);
    expect(hand(game, B).length - bobHand).toBe(2);
  });
});
