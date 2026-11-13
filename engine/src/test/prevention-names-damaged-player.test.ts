import { describe, expect, it } from "vitest";
import { A, B, activate, attack, hand, keywords, life, ref, spawn, table } from "./harness.js";

// A prevention's follow-up (rule 615.5) names "that player": the player the
// damage would have been dealt to is `"trigger-player"` there, beside the
// recipient as `"trigger-recipient"` (Vigor). Sokrates, Athenian Teacher's
// granted "If this creature would deal combat damage to a player, prevent
// that damage. This creature's controller and that player each draw half
// that many cards, rounded down."
describe("prevention then names the damaged player — Sokrates, Athenian Teacher", () => {
  it("prevents the combat damage; its controller and that player each draw half, rounded down", () => {
    const { game, a } = table();
    const sokrates = spawn(game, "Sokrates, Athenian Teacher");
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    activate(game, sokrates, 0, { targets: [ref(wurm)] });
    const [handA, handB] = [hand(game, A).length, hand(game, B).length];
    attack(game, a, [wurm]);
    expect(life(game, B)).toBe(20);
    expect(hand(game, A).length).toBe(handA + 3);
    expect(hand(game, B).length).toBe(handB + 3);
  });

  it("an opponent's creature: its controller and the player it attacked draw", () => {
    const { game, b } = table();
    const sokrates = spawn(game, "Sokrates, Athenian Teacher");
    const bears = spawn(game, "Grizzly Bears", B); // 2/2 → 1 each
    // Alice answers in bob's upkeep, once he has passed to her.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    activate(game, sokrates, 0, { player: A, targets: [ref(bears)] });
    const [handA, handB] = [hand(game, A).length, hand(game, B).length];
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
    // Bob's draw step drew him one besides.
    expect(hand(game, B).length).toBe(handB + 1 + 1);
    expect(hand(game, A).length).toBe(handA + 1);
  });

  it("still draws when the damage can't be prevented (the ruling, rule 615.12)", () => {
    const { game, a } = table();
    const sokrates = spawn(game, "Sokrates, Athenian Teacher");
    const wurm = spawn(game, "Craw Wurm");
    activate(game, sokrates, 0, { targets: [ref(wurm)] });
    game.state.damageUnpreventableThisTurn = true;
    const [handA, handB] = [hand(game, A).length, hand(game, B).length];
    attack(game, a, [wurm]);
    expect(life(game, B)).toBe(14);
    expect(hand(game, A).length).toBe(handA + 3);
    expect(hand(game, B).length).toBe(handB + 3);
  });

  it("has hexproof only while untapped", () => {
    const { game } = table();
    const sokrates = spawn(game, "Sokrates, Athenian Teacher");
    expect(keywords(game, sokrates).has("hexproof")).toBe(true);
    const wurm = spawn(game, "Craw Wurm");
    activate(game, sokrates, 0, { targets: [ref(wurm)] });
    expect(keywords(game, sokrates).has("hexproof")).toBe(false);
  });
});
