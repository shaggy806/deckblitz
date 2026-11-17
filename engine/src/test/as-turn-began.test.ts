/**
 * "As the turn began" / "at the beginning of this turn": how the table stood
 * as the turn began, before its untap step (rule 501.1 — the untap step is the
 * first thing a turn does), kept on the journal's record of the turn
 * (`JournalTurn.began`) and read as the `*-as-turn-began` `TurnStat`s: a
 * player's life total (Sengir, the Dark Baron), cards in hand (Mindstorm
 * Crown), untapped lands (Power Surge) and who was the monarch (Knights of the
 * Black Rose).
 */
import { describe, expect, it } from "vitest";

import { turnStatOf } from "../characteristics.js";

import { A, B, C, counters, destroy, enter, hand, lands, life, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("the table as the turn began", () => {
  it("keeps each player's life, hand, untapped lands and the monarch as the turn began, whatever happens after", () => {
    const { game } = table({ players: 3 });
    lands(game, "Wastes", 2, B);
    spawn(game, "Wastes", B, { tapped: true });
    game.debugApplyEffect(B, { kind: "become-monarch" });
    toStep(game, "precombat-main", B);
    // Bob's untap step untapped his third land after the turn began.
    expect(turnStatOf(game.state, B, "untapped-lands-as-turn-began")).toBe(2);
    expect(turnStatOf(game.state, B, "monarch-as-turn-began")).toBe(1);
    expect(turnStatOf(game.state, A, "monarch-as-turn-began")).toBe(0);
    const bobLife = life(game, B);
    const bobHand = hand(game, B).length;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5 });
    game.debugApplyEffect(A, { kind: "become-monarch" });
    settle(game);
    expect(turnStatOf(game.state, B, "life-as-turn-began")).toBe(bobLife);
    // Before his draw step's card.
    expect(turnStatOf(game.state, B, "cards-in-hand-as-turn-began")).toBe(bobHand - 1);
    expect(turnStatOf(game.state, B, "monarch-as-turn-began")).toBe(1);
    expect(turnStatOf(game.state, C, "life-as-turn-began")).toBe(20);
  });
});

describe("Power Surge — untapped lands at the beginning of this turn", () => {
  it("deals the player whose upkeep it is damage for the lands they left untapped, not those their untap step untapped", () => {
    const { game } = table();
    spawn(game, "Power Surge");
    lands(game, "Wastes", 3, B);
    spawn(game, "Wastes", B, { tapped: true });
    spawn(game, "Wastes", B, { tapped: true });
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("deals nothing to a player who began the turn with every land tapped", () => {
    const { game } = table();
    spawn(game, "Power Surge");
    spawn(game, "Wastes", B, { tapped: true });
    spawn(game, "Wastes", B, { tapped: true });
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Sengir, the Dark Baron", () => {
  it("gains the life total a player who loses the game had as the turn began", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Sengir, the Dark Baron");
    game.debugApplyEffect(A, { kind: "lose-life", who: "each-opponent", amount: 8 });
    toStep(game, "precombat-main", B);
    expect(life(game, B)).toBe(12);
    // Bob began his turn at 12, and is down to 7 when he loses the game.
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5 });
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [{ kind: "player", player: B }]);
    settle(game);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(life(game, A)).toBe(32);
  });

  it("gets two +1/+1 counters whenever another creature dies", () => {
    const { game } = table();
    const sengir = spawn(game, "Sengir, the Dark Baron");
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    expect(counters(game, sengir)).toBe(2);
  });
});

describe("Mindstorm Crown — cards in hand at the beginning of this turn", () => {
  it("deals 1 damage to a player who began the turn with a card in hand", () => {
    const { game } = table();
    spawn(game, "Mindstorm Crown");
    toStep(game, "upkeep", A);
    const before = hand(game, A).length;
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(hand(game, A).length).toBe(before);
  });

  it("draws for a player who began the turn with no cards in hand, even with one there by the time it resolves", () => {
    const { game } = table();
    spawn(game, "Mindstorm Crown");
    for (const id of [...hand(game, A)]) game.debugMove(id, "graveyard");
    toStep(game, "upkeep", A);
    expect(game.state.zones.shared.stack.length).toBe(1);
    toHand(game, "Wastes", A);
    settle(game);
    expect(hand(game, A).length).toBe(2);
    expect(life(game, A)).toBe(20);
  });
});

describe("Knights of the Black Rose — the monarch as the turn began", () => {
  it("drains an opponent who takes the monarchy from you when you were the monarch as the turn began", () => {
    const { game } = table();
    enter(game, "Knights of the Black Rose");
    expect(game.state.monarch).toBe(A);
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(B, { kind: "become-monarch" });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("does nothing on the turn you became the monarch (rule 603.4: the intervening if)", () => {
    const { game } = table();
    enter(game, "Knights of the Black Rose");
    game.debugApplyEffect(B, { kind: "become-monarch" });
    settle(game);
    expect(game.state.monarch).toBe(B);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});
