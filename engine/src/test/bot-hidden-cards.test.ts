import { describe, expect, it } from "vitest";

import { withHiddenCards } from "../bot/determinize.js";
import { EvalBotController } from "../bot/eval-bot.js";
import type { EvalBotOptions } from "../bot/eval-bot.js";
import { knownEnds, observe, publiclyKnown, seatMemory } from "../bot/seat-memory.js";
import { unknownCards } from "../bot/turn-plan.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, C, destroy, lands, ref, registryOf, settle, spawn, table, toHand, toLibrary } from "./harness.js";

/**
 * What a bot's simulations may know of the cards its seat can't see
 * (`withHiddenCards`): a library's cards and not how they lie, how many cards
 * another player holds and not which, and what the seat was shown or put
 * somewhere itself (`seat-memory.ts`). A live game's turn changed with the
 * hidden order of the bot's own library (`docs/bot-misplays.md`, 2026-11-17).
 */
const libraryOf = (state: GameState, player: PlayerId = A): readonly ObjectId[] => state.zones.perPlayer[player].library;
const handOf = (state: GameState, player: PlayerId): readonly ObjectId[] => state.zones.perPlayer[player].hand;
const sorted = (ids: readonly ObjectId[]): ObjectId[] => [...ids].sort();
const asked = (game: Game, kind: string): void => game.advanceUntil((s) => s.awaiting?.kind === kind);
const castNow = (game: Game, card: ObjectId, player: PlayerId = A, targets: readonly (PlayerId | ObjectId)[] = []): void => {
  game.dispatch({ type: "cast-spell", player, card, targets: targets.map(ref) });
};

describe("a library's order, hidden from the bot", () => {
  it("is the same whichever way the real library lies", () => {
    const { game } = table();
    const registry = registryOf(game);
    for (const name of ["Shivan Dragon", "Opt", "Murder", "Grizzly Bears"]) toLibrary(game, name);
    const asItLies = withHiddenCards(game.state, registry, A);
    const real = [...libraryOf(game.state)];
    game.state.zones.perPlayer[A].library = [...real].reverse();
    const upsideDown = withHiddenCards(game.state, registry, A);
    expect(libraryOf(upsideDown)).toEqual(libraryOf(asItLies));
    // The same cards, and not in the order they really lie in.
    expect(sorted(libraryOf(asItLies))).toEqual(sorted(real));
    expect(libraryOf(asItLies)).not.toEqual(real);
  });

  it("leaves the game's own state as it was, sharing everything but the lists it deals", () => {
    const { game } = table();
    const before = [...libraryOf(game.state)];
    const rng = game.state.rngState;
    const hidden = withHiddenCards(game.state, registryOf(game), A, { hands: "real" });
    expect(libraryOf(game.state)).toEqual(before);
    expect(game.state.rngState).toBe(rng);
    expect(hidden).not.toBe(game.state);
    // With the hands left alone no card changes zone, so no object is new.
    expect(hidden.objects).toBe(game.state.objects);
    expect(handOf(hidden, A)).toBe(handOf(game.state, A));
    expect(handOf(hidden, B)).toBe(handOf(game.state, B));
    // A simulation's shuffles and coin flips aren't the real game's either.
    expect(hidden.rngState).not.toBe(rng);
  });

  it("hides the opponents' libraries too", () => {
    const { game } = table();
    const hidden = withHiddenCards(game.state, registryOf(game), A, { hands: "real" });
    expect(sorted(libraryOf(hidden, B))).toEqual(sorted(libraryOf(game.state, B)));
    expect(libraryOf(hidden, B)).not.toEqual(libraryOf(game.state, B));
  });

  it("keeps a top card the seat can see on top", () => {
    // Oracle of Mul Daya: "Play with the top card of your library revealed."
    const { game } = table();
    spawn(game, "Oracle of Mul Daya");
    const top = toLibrary(game, "Shivan Dragon");
    game.state.zones.perPlayer[A].library = [top, ...libraryOf(game.state).filter((id) => id !== top)];
    const hidden = withHiddenCards(game.state, registryOf(game), A);
    expect(libraryOf(hidden)[0]).toBe(top);
    expect(libraryOf(hidden).slice(1)).not.toEqual(libraryOf(game.state).slice(1));
  });

  it("keeps one deal through a turn, and makes another for the next", () => {
    const { game } = table();
    const registry = registryOf(game);
    const first = withHiddenCards(game.state, registry, A);
    // A later window of the same turn: the same deal, so a plan still reads
    // the same and a window already passed on is known again.
    game.state.eventSeq += 7;
    const later = withHiddenCards(game.state, registry, A);
    expect(libraryOf(later)).toEqual(libraryOf(first));
    expect(handOf(later, B)).toEqual(handOf(first, B));
    game.state.turn.number += 1;
    expect(libraryOf(withHiddenCards(game.state, registry, A))).not.toEqual(libraryOf(first));
  });

  it("keeps the cards a decision is showing where they are", () => {
    // Serum Visions: "Draw a card. Scry 2." The two cards being looked at are
    // the top two; everything under them is still dealt.
    const { game } = table();
    lands(game, "Island", 1);
    castNow(game, toHand(game, "Serum Visions"));
    asked(game, "scry");
    const real = libraryOf(game.state);
    const hidden = withHiddenCards(game.state, registryOf(game), A);
    expect(libraryOf(hidden).slice(0, 2)).toEqual(real.slice(0, 2));
    expect(libraryOf(hidden).slice(2)).not.toEqual(real.slice(2));
    expect(sorted(libraryOf(hidden))).toEqual(sorted(real));
  });
});

describe("the other players' hands, hidden from the bot", () => {
  /** Bob holding Murder and Counterspell over a library with a Dragon in it. */
  const bobHolding = (): { game: Game; held: ObjectId[]; dragon: ObjectId } => {
    const { game } = table({ openingHandSize: 0 });
    const held = [toHand(game, "Murder", B), toHand(game, "Counterspell", B)];
    return { game, held, dragon: toLibrary(game, "Shivan Dragon", B) };
  };

  it("deals a hand of the same size from the cards the seat can't place", () => {
    const { game, held } = bobHolding();
    const hidden = withHiddenCards(game.state, registryOf(game), A);
    expect(handOf(hidden, B)).toHaveLength(2);
    // The same cards between hand and library, none lost and none made.
    expect(sorted([...handOf(hidden, B), ...libraryOf(hidden, B)])).toEqual(
      sorted([...handOf(game.state, B), ...libraryOf(game.state, B)]),
    );
    // Two of forty-three, by the cards' own keys: not the two really held.
    expect(sorted(handOf(hidden, B))).not.toEqual(sorted(held));
    // The seat's own hand is its own.
    expect(handOf(hidden, A)).toBe(handOf(game.state, A));
  });

  it("is the same whichever of those cards the player really holds", () => {
    const { game, held } = bobHolding();
    const registry = registryOf(game);
    const first = withHiddenCards(game.state, registry, A);
    // The same cards, with two others in hand and those two in the library.
    const zones = game.state.zones.perPlayer[B];
    const others = zones.library.slice(5, 7);
    zones.library = [...zones.library.filter((id) => !others.includes(id)), ...held];
    zones.hand = [...others];
    for (const id of others) game.state.objects[id].zone = "hand";
    for (const id of held) game.state.objects[id].zone = "library";
    const second = withHiddenCards(game.state, registry, A);
    expect(handOf(second, B)).toEqual(handOf(first, B));
    expect(libraryOf(second, B)).toEqual(libraryOf(first, B));
  });

  it("says of each card dealt across which zone the deal put it in, and plays on", () => {
    const { game } = bobHolding();
    const registry = registryOf(game);
    const hidden = withHiddenCards(game.state, registry, A);
    for (const id of handOf(hidden, B)) expect(hidden.objects[id].zone).toBe("hand");
    for (const id of libraryOf(hidden, B)) expect(hidden.objects[id].zone).toBe("library");
    // The game's own records are untouched.
    for (const id of handOf(game.state, B)) expect(game.state.objects[id].zone).toBe("hand");
    for (const id of libraryOf(game.state, B)) expect(game.state.objects[id].zone).toBe("library");
    // A simulation plays the dealt hand: the turn passes to Bob, who draws.
    const copy = Game.fromSnapshot({ ...hidden, eventLog: [] }, { registry });
    copy.advanceUntil((s) => s.turnOrder[s.turn.activePlayerIndex] === B && s.turn.step === "precombat-main");
    expect(handOf(copy.state, B)).toHaveLength(3);
  });

  it("leaves a card everyone saw go to that hand", () => {
    // Unsummon: "Return target creature to its owner's hand."
    const { game, held } = bobHolding();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    castNow(game, toHand(game, "Unsummon"), A, [bears]);
    settle(game);
    expect(handOf(game.state, B)).toContain(bears);
    expect(publiclyKnown(game.state, bears)).toBe(true);
    const hidden = withHiddenCards(game.state, registryOf(game), A);
    expect(handOf(hidden, B)).toContain(bears);
    expect(handOf(hidden, B)).toHaveLength(3);
    expect(sorted(handOf(hidden, B))).not.toEqual(sorted([...held, bears]));
  });

  it("leaves a hand played revealed, and one the seat is shown", () => {
    // Telepathy: "Your opponents play with their hands revealed."
    const { game, held } = bobHolding();
    const registry = registryOf(game);
    const telepathy = spawn(game, "Telepathy");
    expect(sorted(handOf(withHiddenCards(game.state, registry, A), B))).toEqual(sorted(held));
    // Once it's gone the hand is hidden again from a seat that never saw it,
    const memory = seatMemory();
    observe(memory, game.state, registry, A);
    destroy(game, telepathy);
    observe(memory, game.state, registry, A);
    expect(sorted(handOf(withHiddenCards(game.state, registry, A), B))).not.toEqual(sorted(held));
    // and still known to the one that did.
    expect(sorted(handOf(withHiddenCards(game.state, registry, A, { memory }), B))).toEqual(sorted(held));
  });

  it("never deals into a hand a library card everyone knows is in the library", () => {
    // Time Ebb: "Put target creature on top of its owner's library." A seat
    // with no memory of where it went still knows it isn't in the hand.
    const { game, held } = bobHolding();
    const registry = registryOf(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    castNow(game, toHand(game, "Time Ebb"), A, [bears]);
    settle(game);
    game.state.zones.perPlayer[B].library = [bears];
    expect(publiclyKnown(game.state, bears)).toBe(true);
    for (let turn = 1; turn <= 20; turn += 1) {
      game.state.turn.number = turn;
      const hidden = withHiddenCards(game.state, registry, C);
      expect(sorted(handOf(hidden, B))).toEqual(sorted(held));
      expect(libraryOf(hidden, B)).toEqual([bears]);
    }
  });
});

describe("what a seat remembers of the cards it can't see", () => {
  it("knows the cards it left on top and on the bottom with a scry", () => {
    const { game } = table();
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Island", 1);
    observe(memory, game.state, registry, A);
    castNow(game, toHand(game, "Serum Visions"));
    asked(game, "scry");
    const [keep, away] = libraryOf(game.state);
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "scry", player: A, away: [away] });
    settle(game);
    observe(memory, game.state, registry, A);
    const real = libraryOf(game.state);
    expect(real[0]).toBe(keep);
    expect(real[real.length - 1]).toBe(away);
    expect(knownEnds(real, memory.placed[A])).toEqual({ top: 1, bottom: 1 });
    // Its plans read those two where they are, and nothing else.
    const hidden = libraryOf(withHiddenCards(game.state, registry, A, { memory }));
    expect(hidden[0]).toBe(keep);
    expect(hidden[hidden.length - 1]).toBe(away);
    expect(hidden.slice(1, -1)).not.toEqual(real.slice(1, -1));
    // A seat without the memory knows neither.
    expect(knownEnds(real, seatMemory().placed[A])).toEqual({ top: 0, bottom: 0 });
  });

  it("forgets them when the library is shuffled", () => {
    // Rampant Growth: "Search your library for a basic land card, put that
    // card onto the battlefield tapped, then shuffle."
    const { game } = table();
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Island", 1);
    lands(game, "Forest", 2);
    castNow(game, toHand(game, "Serum Visions"));
    asked(game, "scry");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "scry", player: A, away: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    expect(knownEnds(libraryOf(game.state), memory.placed[A]).top).toBe(2);
    castNow(game, toHand(game, "Rampant Growth"));
    asked(game, "choose-from-zone");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    expect(knownEnds(libraryOf(game.state), memory.placed[A])).toEqual({ top: 0, bottom: 0 });
  });

  it("knows the cards it put back from its hand", () => {
    // Brainstorm: "Draw three cards, then put two cards from your hand on
    // top of your library in any order."
    const { game } = table({ openingHandSize: 0 });
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Island", 1);
    const first = toHand(game, "Murder");
    const second = toHand(game, "Shivan Dragon");
    castNow(game, toHand(game, "Brainstorm"));
    game.advanceUntil((s) => s.awaiting !== null);
    observe(memory, game.state, registry, A);
    while (game.state.awaiting !== null) {
      const awaiting = game.state.awaiting;
      if (awaiting.kind !== "choose-from-zone") throw new Error(`asked ${awaiting.kind}`);
      const chosen = awaiting.ids.filter((id) => id === first || id === second).slice(0, awaiting.max ?? 2);
      game.dispatch({ type: "choose-from-zone", player: A, chosen });
      observe(memory, game.state, registry, A);
    }
    settle(game);
    observe(memory, game.state, registry, A);
    const real = libraryOf(game.state);
    expect(sorted(real.slice(0, 2))).toEqual(sorted([first, second]));
    expect(knownEnds(real, memory.placed[A]).top).toBe(2);
    expect(libraryOf(withHiddenCards(game.state, registry, A, { memory })).slice(0, 2)).toEqual(real.slice(0, 2));
  });

  it("knows the card its own tutor put on top, after the shuffle", () => {
    // Vampiric Tutor: "Search your library for a card, then shuffle and put
    // that card on top. You lose 2 life."
    const { game } = table();
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Swamp", 1);
    const dragon = toLibrary(game, "Shivan Dragon");
    observe(memory, game.state, registry, A);
    castNow(game, toHand(game, "Vampiric Tutor"));
    asked(game, "choose-from-zone");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [dragon] });
    settle(game);
    observe(memory, game.state, registry, A);
    expect(libraryOf(game.state)[0]).toBe(dragon);
    expect(knownEnds(libraryOf(game.state), memory.placed[A])).toEqual({ top: 1, bottom: 0 });
    // The player across the table saw a search and a shuffle, and no card.
    const theirs = seatMemory();
    observe(theirs, game.state, registry, B);
    expect(knownEnds(libraryOf(game.state), theirs.placed[A]).top).toBe(0);
  });

  it("knows a card everyone saw put on a library, and that its owner drew it", () => {
    const { game } = table({ openingHandSize: 0 });
    const registry = registryOf(game);
    const memory = seatMemory();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    observe(memory, game.state, registry, A);
    castNow(game, toHand(game, "Time Ebb"), A, [bears]);
    settle(game);
    observe(memory, game.state, registry, A);
    expect(libraryOf(game.state, B)[0]).toBe(bears);
    expect(knownEnds(libraryOf(game.state, B), memory.placed[B]).top).toBe(1);
    expect(libraryOf(withHiddenCards(game.state, registry, A, { memory }), B)[0]).toBe(bears);
    // Bob's draw step: the card everyone knew was on top is in his hand now,
    // which the game's public record doesn't say and the seat remembers.
    game.advanceUntil((s) => s.turnOrder[s.turn.activePlayerIndex] === B && s.turn.step === "precombat-main");
    observe(memory, game.state, registry, A);
    expect(handOf(game.state, B)).toEqual([bears]);
    expect(publiclyKnown(game.state, bears)).toBe(false);
    expect(memory.hands.has(bears)).toBe(true);
    expect(handOf(withHiddenCards(game.state, registry, A, { memory }), B)).toEqual([bears]);
  });

  it("forgets a library's top when its owner looks at it and may have moved it", () => {
    // Opt: "Scry 1. Draw a card." Bob keeps the card or bottoms it, and only
    // Bob knows which.
    const { game } = table({ openingHandSize: 0 });
    const registry = registryOf(game);
    const memory = seatMemory();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    lands(game, "Island", 1, B);
    const opt = toHand(game, "Opt", B);
    observe(memory, game.state, registry, A);
    castNow(game, toHand(game, "Time Ebb"), A, [bears]);
    settle(game);
    observe(memory, game.state, registry, A);
    expect(knownEnds(libraryOf(game.state, B), memory.placed[B]).top).toBe(1);
    game.dispatch({ type: "pass-priority", player: A });
    castNow(game, opt, B);
    asked(game, "scry");
    game.dispatch({ type: "scry", player: B, away: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    // Bob kept it and drew it; the seat can't know that.
    expect(handOf(game.state, B)).toContain(bears);
    expect(memory.hands.has(bears)).toBe(false);
    expect(knownEnds(libraryOf(game.state, B), memory.placed[B]).top).toBe(0);
  });

  it("knows a hand it looked at, for as long as the cards stay there", () => {
    // Peek: "Look at target player's hand. Draw a card."
    const { game } = table({ openingHandSize: 0 });
    const registry = registryOf(game);
    const memory = seatMemory();
    const held = [toHand(game, "Murder", B), toHand(game, "Counterspell", B)];
    lands(game, "Island", 1);
    castNow(game, toHand(game, "Peek"), A, [B]);
    asked(game, "choose-from-zone");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    expect(sorted([...memory.hands])).toEqual(sorted(held));
    expect(sorted(handOf(withHiddenCards(game.state, registry, A, { memory }), B))).toEqual(sorted(held));
    // A card that leaves the hand is no longer remembered there.
    game.state.zones.perPlayer[B].hand = [held[1]];
    game.state.zones.perPlayer[B].graveyard.push(held[0]);
    game.state.objects[held[0]].zone = "graveyard";
    observe(memory, game.state, registry, A);
    expect([...memory.hands]).toEqual([held[1]]);
  });

  it("lets a plan use the cards it knows are on top of its own library, and none under them", () => {
    const { game } = table();
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Island", 1);
    castNow(game, toHand(game, "Serum Visions"));
    asked(game, "scry");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "scry", player: A, away: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    const library = libraryOf(game.state);
    const unknown = unknownCards(game.state, registry, A, memory.placed[A]);
    expect(unknown.has(library[0])).toBe(false);
    expect(unknown.has(library[1])).toBe(false);
    expect(unknown.has(library[2])).toBe(true);
    // Without the memory every card of the library is one a plan may not use.
    expect(unknownCards(game.state, registry, A).size).toBe(library.length);
  });

  it("starts again on a game it hasn't been following", () => {
    const { game } = table();
    const registry = registryOf(game);
    const memory = seatMemory();
    lands(game, "Island", 1);
    castNow(game, toHand(game, "Serum Visions"));
    asked(game, "scry");
    observe(memory, game.state, registry, A);
    game.dispatch({ type: "scry", player: A, away: [] });
    settle(game);
    observe(memory, game.state, registry, A);
    expect(knownEnds(libraryOf(game.state), memory.placed[A]).top).toBe(2);
    // A copy of the game with its log emptied (a simulation), or another game.
    observe(memory, { ...game.state, eventLog: [] }, registry, A);
    expect(knownEnds(libraryOf(game.state), memory.placed[A]).top).toBe(0);
  });
});

describe("the bot's own search", () => {
  /** A v2 seat for alice, and the state each line it weighs ended in. */
  const watched = (game: Game, options: EvalBotOptions = {}): { bot: EvalBotController; ends: GameState[] } => {
    const ends: GameState[] = [];
    const trace = (_action: unknown, after: GameState | null): void => {
      if (after !== null) ends.push(after);
    };
    return { bot: new EvalBotController(A, game.registry, { maxSimulations: 8, ...options, trace }), ends };
  };
  /** Alice with a creature to cast; Bob holding Murder and Counterspell. */
  const position = (): { game: Game; held: ObjectId[] } => {
    const { game } = table({ openingHandSize: 0 });
    // The card she drew for the turn is a land: played, so the search starts
    // at her spells.
    for (const card of [...handOf(game.state, A)]) game.dispatch({ type: "play-land", player: A, card });
    const held = [toHand(game, "Murder", B), toHand(game, "Counterspell", B)];
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    toHand(game, "Grizzly Bears");
    toHand(game, "Llanowar Elves");
    toHand(game, "Opt");
    return { game, held };
  };

  it("plays on a hand dealt for the other player, not the one they hold", () => {
    const { game, held } = position();
    const hidden = watched(game);
    hidden.bot.act(game.controllerView(A));
    expect(hidden.ends.length).toBeGreaterThan(0);
    for (const end of hidden.ends) expect(sorted(handOf(end, B))).not.toEqual(sorted(held));
    // What it read until 2026-11-17, kept as an option to measure against.
    const real = watched(game, { opponentHands: "real" });
    real.bot.act(game.controllerView(A));
    expect(real.ends.length).toBeGreaterThan(0);
    for (const end of real.ends) expect(sorted(handOf(end, B))).toEqual(sorted(held));
  });

  it("remembers a hand it looked at, in the decisions that follow", () => {
    const { game, held } = position();
    const { bot, ends } = watched(game);
    castNow(game, toHand(game, "Peek"), A, [B]);
    asked(game, "choose-from-zone");
    // The bot is shown the hand as it is asked to close the look.
    game.dispatch(bot.act(game.controllerView(A)));
    settle(game);
    ends.length = 0;
    // Peek drew her a land, which she plays without a search; then her spells.
    for (let action = bot.act(game.controllerView(A)); action.type === "play-land"; action = bot.act(game.controllerView(A))) {
      game.dispatch(action);
    }
    expect(ends.length).toBeGreaterThan(0);
    for (const end of ends) expect(sorted(handOf(end, B))).toEqual(sorted(held));
  });
});
