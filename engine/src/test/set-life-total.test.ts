/**
 * "Your life total becomes N" — the `set-life-total` effect. Rule 119.5: the
 * player gains or loses the difference, so it's a real gain or loss to
 * everything that watches life change. And the `startingLifeTotal` and
 * `lowestLifeTotal` amounts it reads.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, enter, lands, life, pickTargets, ref, settle, spawn, table, toHand, turnTotal } from "./harness.js";

const lifeChanges = (game: Game, player: string) =>
  game.state.eventLog.filter((e) => e.type === "life-changed" && e.player === player).map((e) => (e as { delta: number }).delta);

describe("set-life-total", () => {
  it("Magister Sphinx takes an opponent down to 10: a loss of the difference, tallied as one", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Magister Sphinx");
    expect(life(game, B)).toBe(10);
    expect(lifeChanges(game, B)).toEqual([-10]);
    expect(turnTotal(game.state, B, "life-lost")).toBe(10);
    expect(turnTotal(game.state, B, "life-gained")).toBe(0);
  });

  it("…and brings a player below 10 up to it: a gain, seen by 'whenever you gain life'", () => {
    const { game, a } = table();
    game.state.players[A].life = 4;
    spawn(game, "Ajani's Pridemate");
    pickTargets(a, A);
    enter(game, "Magister Sphinx");
    expect(life(game, A)).toBe(10);
    expect(turnTotal(game.state, A, "life-gained")).toBe(6);
    const pridemate = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Ajani's Pridemate");
    expect(game.state.objects[pridemate as ObjectId].counters["+1/+1"]).toBe(1);
  });

  it("a player already there has no gain or loss (rule 119.9): no event", () => {
    const { game, a } = table();
    game.state.players[B].life = 10;
    pickTargets(a, B);
    enter(game, "Magister Sphinx");
    expect(life(game, B)).toBe(10);
    expect(lifeChanges(game, B)).toEqual([]);
  });

  it("a replacement on gaining changes it (the Alhammarret's Archive rulings): doubled past the number", () => {
    const { game, a } = table();
    game.state.players[A].life = 8;
    spawn(game, "Rhox Faithmender");
    pickTargets(a, A);
    enter(game, "Magister Sphinx");
    expect(life(game, A)).toBe(12);
  });

  it("'can't gain life' stops a rise but not a fall", () => {
    const { game, a } = table();
    game.state.players[B].life = 4;
    spawn(game, "Erebos, God of the Dead", A);
    pickTargets(a, B);
    enter(game, "Magister Sphinx");
    expect(life(game, B)).toBe(4);
    game.state.players[B].life = 15;
    pickTargets(a, B);
    enter(game, "Magister Sphinx");
    expect(life(game, B)).toBe(10);
  });

  it("Biorhythm reads each player's own creatures; 0 loses the game (rule 119.6)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Biorhythm"));
    expect(life(game, A)).toBe(2);
    expect(life(game, B)).toBe(1);
    expect(game.state.players[C].hasLost).toBe(true);
  });

  it("Repay in Kind: everyone to the lowest total", () => {
    const { game } = table({ players: 3 });
    game.state.players[A].life = 15;
    game.state.players[B].life = 7;
    game.state.players[C].life = 30;
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Repay in Kind"));
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([7, 7, 7]);
    expect(lifeChanges(game, B)).toEqual([]);
  });

  it("Repay in Kind counts only players still in the game", () => {
    const { game } = table({ players: 3 });
    game.state.players[C].life = 2;
    game.state.players[B].life = 11;
    game.state.players[C].hasLost = true;
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Repay in Kind"));
    expect(life(game, A)).toBe(11);
  });

  it("Oketra's Last Mercy: back to the starting total of the game's rules, and lands stay tapped", () => {
    const { game } = table({ life: 40 });
    game.state.players[A].life = 12;
    lands(game, "Plains", 3);
    const plains = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Plains") as ObjectId;
    cast(game, toHand(game, "Oketra's Last Mercy"));
    expect(life(game, A)).toBe(40);
    expect(game.state.objects[plains].tapped).toBe(true);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.turn.number === 3);
    expect(game.state.objects[plains].tapped).toBe(true);
    // Over the starting total, it's a loss.
    const over = table({ life: 20 });
    over.game.state.players[A].life = 33;
    lands(over.game, "Plains", 3);
    cast(over.game, toHand(over.game, "Oketra's Last Mercy"));
    expect(life(over.game, A)).toBe(20);
  });

  it("The Endstone: half the starting total, rounded up, at your own end step only", () => {
    const { game } = table({ life: 41 });
    spawn(game, "The Endstone");
    game.advanceUntil((s) => s.turn.step === "end" && s.turn.number === 1);
    settle(game);
    expect(life(game, A)).toBe(21);
    const before = life(game, A);
    game.advanceUntil((s) => s.turn.step === "end" && s.turn.number === 2);
    settle(game);
    expect(life(game, A)).toBe(before);
  });

  it("The Endstone draws for a land played and a spell cast, not for its own casting", () => {
    const { game } = table();
    const hand = () => game.state.zones.perPlayer[A].hand.length;
    lands(game, "Mountain", 8);
    const stone = toHand(game, "The Endstone");
    const before = hand();
    cast(game, stone);
    // Its own casting draws nothing; the card left the hand.
    expect(hand()).toBe(before - 1);
    const bolt = toHand(game, "Lightning Bolt");
    const withBolt = hand();
    game.state.players[B].life = 20;
    cast(game, bolt, { targets: [ref(B)] });
    expect(hand()).toBe(withBolt);
    const land = toHand(game, "Mountain");
    const withLand = hand();
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(hand()).toBe(withLand);
  });

  it("Resolute Archangel asks only below the starting total, and then becomes it", () => {
    const { game } = table({ life: 40 });
    game.state.players[A].life = 39;
    enter(game, "Resolute Archangel");
    expect(life(game, A)).toBe(40);
    const atIt = table({ life: 40 });
    enter(atIt.game, "Resolute Archangel");
    expect(life(atIt.game, A)).toBe(40);
    expect(lifeChanges(atIt.game, A)).toEqual([]);
    const above = table({ life: 40 });
    above.game.state.players[A].life = 50;
    enter(above.game, "Resolute Archangel");
    expect(life(above.game, A)).toBe(50);
  });
});
