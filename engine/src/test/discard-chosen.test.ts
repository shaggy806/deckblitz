/**
 * "Target opponent reveals their hand. You choose a [kind of] card from it.
 * That player discards that card" — the `discard-chosen` effect (Duress,
 * Thoughtseize, Inquisition of Kozilek, Coercion, Temporal Intervention,
 * Gastal Raider, Stinging Vitriol, Solve for Disappointment), and its
 * look-only, optional form (Oildeep Gearhulk's "look at target player's
 * hand. You may choose a card from it. If you do, that player discards that
 * card, then draws a card").
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, enter, graveyard, hand, lands, life, pickTargets, ref, table, toHand } from "./harness.js";

const awaitingChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, not ${awaiting?.kind}`);
  return awaiting;
};

/** Bob's hand: a Lightning Bolt, a Grizzly Bears, a Forest and a Craw Wurm. */
const bobsHand = (game: Game): { bolt: ObjectId; bears: ObjectId; forest: ObjectId; wurm: ObjectId } => ({
  bolt: toHand(game, "Lightning Bolt", B),
  bears: toHand(game, "Grizzly Bears", B),
  forest: toHand(game, "Forest", B),
  wurm: toHand(game, "Craw Wurm", B),
});

describe("discard-chosen", () => {
  it("Duress: Bob reveals his hand, Alice chooses a noncreature, nonland card, Bob discards it", () => {
    const { game } = table();
    const { bolt, bears, forest } = bobsHand(game);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Duress"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const awaiting = awaitingChoice(game);
    expect(awaiting.player).toBe(A);
    expect(awaiting.eligible).toEqual([bolt]);
    // Revealed to everyone (rule 701.20): Bob's whole hand.
    for (const id of [bolt, bears, forest]) expect(game.state.revealedThisTurn).toContain(id);
    expect(game.viewFor(A).objects[bears]).toBeDefined();
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt] });
    expect(graveyard(game, B)).toContain(bolt);
    expect(hand(game, B)).not.toContain(bolt);
    // Bob discarded it (rule 701.9a).
    expect(game.state.eventLog.some((e) => e.type === "cards-discarded" && e.player === B && e.objects.includes(bolt))).toBe(true);
  });

  it("Duress with nothing it could take: the hand is revealed and nothing is asked", () => {
    const { game } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Duress"), { targets: [ref(B)] });
    expect(game.state.awaiting).toBeNull();
    expect(game.state.revealedThisTurn).toContain(bears);
    expect(hand(game, B)).toContain(bears);
  });

  it("'you choose' isn't optional: Alice must take a card when one matches", () => {
    const { game } = table();
    bobsHand(game);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Duress"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(awaitingChoice(game).min).toBe(1);
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [] })).toThrow();
  });

  it("Thoughtseize: any nonland card, then Alice loses 2 life", () => {
    const { game, a } = table();
    const { bears } = bobsHand(game);
    lands(game, "Swamp", 1);
    a.chooseFromZoneFn = () => [bears];
    cast(game, toHand(game, "Thoughtseize"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toContain(bears);
    expect(life(game, A)).toBe(18);
  });

  it("Inquisition of Kozilek: mana value 3 or less only", () => {
    const { game } = table();
    const { bolt, bears, wurm } = bobsHand(game);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Inquisition of Kozilek"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect([...awaitingChoice(game).eligible].sort()).toEqual([bolt, bears].sort());
    expect(awaitingChoice(game).eligible).not.toContain(wurm);
  });

  it("Oildeep Gearhulk: only Alice looks; declining discards nothing and draws nothing", () => {
    const { game, a } = table({ players: 3 });
    const { bolt } = bobsHand(game);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [];
    const before = hand(game, B).length;
    enter(game, "Oildeep Gearhulk", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone" || (s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null));
    const awaiting = awaitingChoice(game);
    expect(awaiting.min).toBe(0);
    expect(game.state.revealedThisTurn).not.toContain(bolt);
    expect(game.viewFor(A).objects[bolt]).toBeDefined();
    expect(game.viewFor(C).objects[bolt]).toBeUndefined();
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(hand(game, B).length).toBe(before);
  });

  it("Oildeep Gearhulk: a card chosen is discarded, and then its owner draws", () => {
    const { game, a } = table();
    const { wurm } = bobsHand(game);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [wurm];
    const before = hand(game, B).length;
    enter(game, "Oildeep Gearhulk");
    expect(graveyard(game, B)).toContain(wurm);
    expect(hand(game, B).length).toBe(before);
  });

  it("Stinging Vitriol: 2 damage, then the reveal and discard", () => {
    const { game, a } = table();
    const { bolt } = bobsHand(game);
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    a.chooseFromZoneFn = () => [bolt];
    cast(game, toHand(game, "Stinging Vitriol"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(graveyard(game, B)).toContain(bolt);
  });
});

describe("Mathemagics", () => {
  it("target player draws 2ˣ cards: 1 at X = 0, 8 at X = 3", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Mathemagics"), { targets: [ref(B)], x: 0 });
    expect(hand(game, B).length).toBe(before + 1);
    lands(game, "Island", 8);
    const mine = hand(game).length;
    cast(game, toHand(game, "Mathemagics"), { targets: [ref(A)], x: 3 });
    // The card cast left the hand, eight came in.
    expect(hand(game).length).toBe(mine + 8);
  });
});

describe("Down, Down to Goblin-town", () => {
  it("chapter I: target opponent reveals their hand and discards the nonland card Alice chooses", () => {
    const { game, a } = table();
    const { bolt } = bobsHand(game);
    pickTargets(a, B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bolt);
    enter(game, "Down, Down to Goblin-town");
    expect(graveyard(game, B)).toContain(bolt);
  });
});
