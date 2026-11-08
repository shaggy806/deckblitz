/**
 * Inti, Seneschal of the Sun: "whenever you attack, you may discard a card.
 * When you do, put a +1/+1 counter on target attacking creature. It gains
 * trample until end of turn" (a reflexive trigger, rule 603.12, its target
 * chosen as it goes on the stack — the ruling), and "whenever you discard one
 * or more cards, exile the top card of your library. You may play that card
 * until your next end step" — the `discards` trigger, once a batch.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  attack,
  counters,
  graveyard,
  hand,
  keywords,
  pickModes,
  pickTargets,
  spawn,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

const exiled = (game: Game): readonly ObjectId[] => game.state.zones.shared.exile;

describe("Inti, Seneschal of the Sun", () => {
  it("attacking: discards, the counter and trample go on the attacker chosen, and the discard exiles the top card to play", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const inti = spawn(game, "Inti, Seneschal of the Sun");
    const bears = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [inti, bears]);
    expect(hand(game)).toHaveLength(before - 1);
    expect(graveyard(game)).toHaveLength(1);
    // Only attacking creatures, chosen once the discard is done.
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([inti, bears]));
    expect(seen.offered[0]).not.toContain(idle);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(counters(game, inti)).toBe(0);
    // The top card (a Wastes) is exiled, and can be played this turn.
    const top = exiled(game).filter((id) => game.state.objects[id].owner === A);
    expect(top).toHaveLength(1);
    expect(game.state.objects[top[0]].playPermission).toBeDefined();
    game.dispatch({ type: "play-land", player: A, card: top[0] });
    expect(zone(game, top[0])).toBe("battlefield");
  });

  it("declining the discard: no counter, nothing exiled", () => {
    const { game, a } = table();
    const inti = spawn(game, "Inti, Seneschal of the Sun");
    const card = toHand(game, "Lightning Bolt");
    pickModes(a);
    pickTargets(a, inti);
    attack(game, a, [inti]);
    expect(hand(game)).toContain(card);
    expect(counters(game, inti)).toBe(0);
    expect(exiled(game)).toHaveLength(0);
  });

  it("discarding several cards at once is one trigger: one card exiled", () => {
    const { game } = table({ openingHandSize: 0 });
    spawn(game, "Inti, Seneschal of the Sun");
    toHand(game, "Lightning Bolt");
    toHand(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 }, []);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(exiled(game)).toHaveLength(1);
  });
});
