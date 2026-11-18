/**
 * A spell exiled off the stack with delay counters, and put back onto it as a
 * copy of the original spell once they're gone — Ertai's Meddling: `exile`'s
 * `withCounters` taking an amount (X), a delayed "whenever" watching one
 * player's upkeeps (`byPlayer` on a `step-begins` trigger) while the card stays
 * exiled, and `put-on-stack-as-spell` (rule 707.10's choices kept, not cast).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, counters, hand, keywords, lands, life, pt, ref, settle, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

const MEDDLING = "Ertai's Meddling";

/** Alice casts `spell` (holding priority), then Ertai's Meddling on it for `x`. */
function meddle(game: Game, spell: ObjectId, x: number, targets: readonly TargetRef[] = []): ObjectId {
  cast(game, spell, { targets, settle: false });
  const meddling = toHand(game, MEDDLING);
  cast(game, meddling, { targets: [ref(spell)], x, settle: false });
  settle(game);
  return meddling;
}

/** On to alice's next upkeep, and let what triggers there resolve. */
function aliceUpkeep(game: Game): void {
  toStep(game, "upkeep", A);
  settle(game);
}

describe("Ertai's Meddling", () => {
  it("exiles the spell with X delay counters on it", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const giant = toHand(game, "Hill Giant");
    meddle(game, giant, 2);
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, giant, "delay")).toBe(2);
  });

  it("can't be cast with X = 0", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { settle: false });
    const meddling = toHand(game, MEDDLING);
    expect(() => cast(game, meddling, { targets: [ref(giant)], x: 0, settle: false })).toThrow(/X/);
  });

  it("remembers a flashback cast: exiled again as it resolves (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const thinkTwice = toGraveyard(game, "Think Twice");
    cast(game, thinkTwice, { via: "flashback", settle: false });
    const meddling = toHand(game, MEDDLING);
    cast(game, meddling, { targets: [ref(thinkTwice)], x: 1, settle: false });
    settle(game);
    expect(zone(game, thinkTwice)).toBe("exile");
    const handBefore = hand(game).length;
    aliceUpkeep(game);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(zone(game, thinkTwice)).toBe("exile");
    expect(counters(game, thinkTwice, "delay")).toBe(0);
  });

  it("removes one at each of that player's upkeeps, and puts the spell back as the last comes off", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const giant = toHand(game, "Hill Giant");
    meddle(game, giant, 2);
    aliceUpkeep(game);
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, giant, "delay")).toBe(1);
    const since = game.state.eventLog.length;
    aliceUpkeep(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    // Put onto the stack, not cast (the ruling).
    expect(game.state.eventLog.slice(since).some((e) => e.type === "spell-cast")).toBe(false);
    expect(game.state.objects[giant].entry?.cast).toBeUndefined();
  });

  it("doesn't count down on another player's upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const giant = toHand(game, "Hill Giant");
    meddle(game, giant, 1);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, giant, "delay")).toBe(1);
  });

  it("puts the spell back with its original targets", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const bolt = toHand(game, "Lightning Bolt");
    meddle(game, bolt, 1, [ref(B)]);
    expect(life(game, B)).toBe(20);
    aliceUpkeep(game);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("puts a face-down spell back as a face-up 2/2 with no name or text, and it stays one (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const angel = toHand(game, "Exalted Angel");
    cast(game, angel, { via: "face-down", settle: false });
    const meddling = toHand(game, MEDDLING);
    cast(game, meddling, { targets: [ref(angel)], x: 1, settle: false });
    settle(game);
    expect(zone(game, angel)).toBe("exile");
    aliceUpkeep(game);
    expect(zone(game, angel)).toBe("battlefield");
    const object = game.state.objects[angel];
    expect(object.faceDown).toBeUndefined();
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, angel).has("flying")).toBe(false);
  });

  it("does nothing more once the card has left exile", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const giant = toHand(game, "Hill Giant");
    meddle(game, giant, 1);
    game.debugMove(giant, "graveyard");
    aliceUpkeep(game);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
