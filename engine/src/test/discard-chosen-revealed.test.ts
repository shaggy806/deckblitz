/**
 * "Target player reveals three cards from their hand and you choose one of
 * them. That player discards that card" — `discard-chosen`'s `reveals`
 * (Blackmail) and `picks` (Noggin Whack): the hand's owner picks which cards
 * to show, the choice is over those alone.
 */

import { describe, expect, it } from "vitest";

import type { ControllerView, PlayerController } from "../controller.js";
import { chooseFromZone } from "../decisions/choose-from-zone.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, graveyard, hand, lands, ref, spawn, table, toHand } from "./harness.js";

const awaitingChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, not ${awaiting?.kind}`);
  return awaiting;
};

/** Bob's hand: these cards alone, out of the seven he drew. */
const bobsHand = (game: Game, n: number): ObjectId[] => {
  for (const id of [...hand(game, B)]) game.debugMove(id, "library");
  return ["Lightning Bolt", "Grizzly Bears", "Forest", "Craw Wurm", "Shock"].slice(0, n).map((name) => toHand(game, name, B));
};

const revealedEvents = (game: Game) =>
  game.state.eventLog.filter((e) => e.type === "cards-revealed" && e.player === B);

describe("discard-chosen: reveals", () => {
  it("Blackmail: Bob picks three to show, Alice sees only those and chooses among them, Bob discards", () => {
    const { game } = table();
    const [bolt, bears, forest, wurm, shock] = bobsHand(game, 5);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Blackmail"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);

    // Bob's choice, over his whole hand, exactly three, nothing revealed yet.
    const showing = awaitingChoice(game);
    expect(showing.player).toBe(B);
    expect(showing.destination).toBe("reveal");
    expect(showing.forPlayer).toBeUndefined();
    expect([showing.min, showing.max]).toEqual([3, 3]);
    expect(new Set(showing.eligible)).toEqual(new Set([bolt, bears, forest, wurm, shock]));
    expect(revealedEvents(game)).toEqual([]);
    expect(game.viewFor(A).objects[bolt]).toBeUndefined();
    expect(() => game.dispatch({ type: "choose-from-zone", player: B, chosen: [bears, forest] })).toThrow();

    game.dispatch({ type: "choose-from-zone", player: B, chosen: [bears, forest, wurm] });

    // Alice's choice, over those three alone: Bob's bolt stays hidden.
    const choosing = awaitingChoice(game);
    expect(choosing.player).toBe(A);
    expect(choosing.forPlayer).toBe(B);
    expect(choosing.destination).toBe("discard");
    expect(choosing.ids).toEqual([bears, forest, wurm]);
    expect(choosing.eligible).toEqual([bears, forest, wurm]);
    expect([choosing.min, choosing.max]).toEqual([1, 1]);
    for (const id of [bears, forest, wurm]) expect(game.state.revealedThisTurn).toContain(id);
    expect(game.state.revealedThisTurn).not.toContain(bolt);
    expect(game.viewFor(A).objects[wurm]).toBeDefined();
    expect(game.viewFor(A).objects[bolt]).toBeUndefined();
    // Not a card she wasn't shown.
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt] })).toThrow();

    game.dispatch({ type: "choose-from-zone", player: A, chosen: [wurm] });
    expect(graveyard(game, B)).toContain(wurm);
    expect(hand(game, B)).toEqual(expect.arrayContaining([bolt, bears, forest, shock]));
    // A discard (rule 701.9a), by Bob.
    expect(
      game.state.eventLog.some((e) => e.type === "cards-discarded" && e.player === B && e.objects.includes(wurm)),
    ).toBe(true);
    // The spell finished resolving.
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.awaiting).toBeNull();
  });

  it("Blackmail on a hand of three or fewer: all are revealed, Bob isn't asked", () => {
    const { game } = table();
    const [bolt, bears] = bobsHand(game, 2);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Blackmail"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const choosing = awaitingChoice(game);
    expect(choosing.player).toBe(A);
    expect(choosing.ids).toEqual([bolt, bears]);
    expect(revealedEvents(game)).toHaveLength(1);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt] });
    expect(graveyard(game, B)).toContain(bolt);
  });

  it("Blackmail on an empty hand asks nobody", () => {
    const { game } = table();
    bobsHand(game, 0);
    lands(game, "Swamp", 1);
    const blackmail = toHand(game, "Blackmail");
    cast(game, blackmail, { targets: [ref(B)] });
    expect(game.state.awaiting).toBeNull();
    expect(graveyard(game, A)).toContain(blackmail);
    expect(revealedEvents(game)).toEqual([]);
  });

  it("Mire's Toll reads the number as it resolves: one Swamp shows one card, a Mountain doesn't count", () => {
    const { game } = table();
    const [bolt, bears, forest] = bobsHand(game, 3);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Mire's Toll"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const showing = awaitingChoice(game);
    expect(showing.player).toBe(B);
    expect([showing.min, showing.max]).toEqual([1, 1]);
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [forest] });
    const choosing = awaitingChoice(game);
    expect(choosing.ids).toEqual([forest]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [forest] });
    expect(graveyard(game, B)).toContain(forest);
    expect(hand(game, B)).toEqual(expect.arrayContaining([bolt, bears]));
  });

  it("Noggin Whack: three shown, two chosen, both discarded", () => {
    const { game } = table();
    const [bolt, bears, forest, wurm] = bobsHand(game, 4);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Noggin Whack"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [bolt, bears, forest] });
    const choosing = awaitingChoice(game);
    // "You choose two of them": exactly two, not up to two.
    expect([choosing.min, choosing.max]).toEqual([2, 2]);
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt] })).toThrow();
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, forest] });
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([bolt, forest]));
    expect(hand(game, B)).toEqual(expect.arrayContaining([bears, wurm]));
  });

  it("Noggin Whack against a single card chooses that one", () => {
    const { game } = table();
    const [bolt] = bobsHand(game, 1);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Noggin Whack"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const choosing = awaitingChoice(game);
    expect([choosing.min, choosing.max]).toEqual([1, 1]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt] });
    expect(graveyard(game, B)).toContain(bolt);
  });

  it("Cabal Interrogator: X read from the activation; X = 0 shows nothing and asks nobody", () => {
    const { game } = table();
    const [bolt, bears, forest] = bobsHand(game, 3);
    lands(game, "Swamp", 3);
    const zombie = spawn(game, "Cabal Interrogator");
    activate(game, zombie, 0, { targets: [ref(B)], x: 2, settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const showing = awaitingChoice(game);
    expect(showing.player).toBe(B);
    expect([showing.min, showing.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [bears, forest] });
    expect(awaitingChoice(game).ids).toEqual([bears, forest]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [forest] });
    expect(hand(game, B)).toEqual(expect.arrayContaining([bolt, bears]));

    const second = table();
    bobsHand(second.game, 3);
    lands(second.game, "Swamp", 1);
    activate(second.game, spawn(second.game, "Cabal Interrogator"), 0, { targets: [ref(B)], x: 0 });
    expect(second.game.state.awaiting).toBeNull();
    expect(revealedEvents(second.game)).toEqual([]);
    expect(hand(second.game, B)).toHaveLength(3);
  });

  it("the bots answer: a controller keeps its best back", () => {
    const { game } = table();
    const [bolt, bears, forest, wurm] = bobsHand(game, 4);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Blackmail"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const legal = game.legalActions(B).find((a) => a.kind === "choose-from-zone");
    expect(legal).toMatchObject({ destination: "reveal", min: 3, max: 3, revealForChoice: true });
    // A controller is asked what to keep, once, and the rest are shown.
    const awaiting = awaitingChoice(game);
    const asked: number[] = [];
    const answer = chooseFromZone.ask(
      {
        chooseFromZone: (_view: ControllerView, eligible: readonly ObjectId[], min: number) => {
          asked.push(min);
          return eligible.filter((id) => id === wurm);
        },
      } as unknown as PlayerController,
      { state: game.state, player: B, legalActions: [] } as unknown as ControllerView,
      awaiting,
      B,
    );
    expect(asked).toEqual([1]);
    expect(answer).toEqual({ type: "choose-from-zone", player: B, chosen: [bolt, bears, forest] });
  });
});
