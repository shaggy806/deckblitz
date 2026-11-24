/**
 * A draw replaced by an effect that itself draws (Chains of Mephistopheles —
 * "that player discards a card instead. If the player discards a card this
 * way, they draw a card. If the player doesn't, they mill a card"), and how
 * draw replacements stack: the card drawn is a new draw event this
 * replacement can't replace again but another can (rule 614.5, 616.2), even
 * when its player stopped to choose the discard first; all of it is done
 * before the next card of a longer draw (614.11a); and a replacement that
 * changed the whole instruction ("that many plus one") doesn't apply again
 * to the card the effect draws.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, cast, graveyard, hand, lands, nextTurn, spawn, table, toHand, toLibrary } from "./harness.js";

const names = (game: Game, ids: readonly ObjectId[]): string[] => ids.map((id) => game.state.objects[id].cardName);
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** `player`'s hand emptied into exile, then these cards put in it. */
function handOf(game: Game, player: PlayerId, cards: readonly string[]): ObjectId[] {
  for (const id of [...hand(game, player)]) game.debugMove(id, "exile");
  return cards.map((name) => toHand(game, name, player));
}

describe("Chains of Mephistopheles", () => {
  it("each card of a draw of two is a discard then a draw, the discard answered before the next card", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Divination", "Plains", "Swamp"]);
    toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears"); // on top
    const offered: string[][] = [];
    a.chooseDiscardsFn = (cards) => {
      offered.push(names(game, cards.map((c) => c.id)).sort());
      // The first discard takes the Plains, the second the Bears it drew.
      const pick = cards.find((c) => c.cardName === (offered.length === 1 ? "Plains" : "Grizzly Bears"));
      return [pick!.id];
    };
    cast(game, spell);
    // The second discard saw the card the first one's draw brought: the whole
    // replacement was done before the second card (614.11a).
    expect(offered).toEqual([
      ["Plains", "Swamp"],
      ["Grizzly Bears", "Swamp"],
    ]);
    expect(names(game, hand(game)).sort()).toEqual(["Forest", "Swamp"]);
    expect(names(game, graveyard(game)).sort()).toEqual(["Divination", "Grizzly Bears", "Plains"]);
  });

  it("a draw of three, then the rest of the spell: each replacement is done before the next card, and the spell's rest after them all", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Brainstorm", "Plains", "Swamp", "Mountain"]);
    for (const name of ["Island", "Forest", "Grizzly Bears"]) toLibrary(game, name);
    const seen: string[][] = [];
    a.chooseDiscardsFn = (cards) => {
      seen.push(names(game, cards.map((c) => c.id)).sort());
      const pick = ["Plains", "Swamp", "Mountain"].map((n) => cards.find((c) => c.cardName === n)).find((c) => c !== undefined);
      return [pick!.id];
    };
    const putBack: string[][] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      putBack.push(names(game, eligible).sort());
      return eligible.slice(0, min);
    };
    cast(game, spell);
    expect(seen).toEqual([
      ["Mountain", "Plains", "Swamp"],
      ["Grizzly Bears", "Mountain", "Swamp"],
      ["Forest", "Grizzly Bears", "Mountain"],
    ]);
    // Brainstorm's "then put two cards from your hand on top" saw the three
    // drawn cards, after every discard.
    expect(putBack[0]).toEqual(["Forest", "Grizzly Bears", "Island"]);
    expect(hand(game).length).toBe(1);
  });

  it("with no card to discard, the player mills a card and doesn't draw", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Divination"]);
    toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    cast(game, spell);
    expect(hand(game)).toEqual([]);
    expect(names(game, graveyard(game)).sort()).toEqual(["Divination", "Forest", "Grizzly Bears"]);
  });

  it("reaches every player's draws, and the player drawing chooses their own discard", () => {
    const { game, a, b } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles", B);
    const [spell] = handOf(game, A, ["Divination", "Plains", "Swamp"]);
    toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    let asked = 0;
    a.chooseDiscardsFn = (cards, count) => {
      asked += 1;
      return cards.filter((c) => c.cardName !== "Grizzly Bears").slice(0, count).map((c) => c.id);
    };
    b.chooseDiscardsFn = () => {
      throw new Error("the Chains' controller doesn't choose");
    };
    cast(game, spell);
    expect(asked).toBe(2);
    expect(names(game, hand(game)).sort()).toEqual(["Forest", "Grizzly Bears"]);
    expect(names(game, graveyard(game)).sort()).toEqual(["Divination", "Plains", "Swamp"]);
  });

  it("passes by the first card of a player's own draw step", () => {
    const { game } = table();
    spawn(game, "Chains of Mephistopheles");
    handOf(game, B, ["Plains"]);
    nextTurn(game); // bob's turn: his draw step's draw is his own
    expect(hand(game, B).length).toBe(2);
    expect(graveyard(game, B)).toEqual([]);
  });

  it("two of them: each makes the player discard first, the second replacing the card the first has them draw", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Divination", "Plains", "Swamp", "Mountain", "Island"]);
    for (const name of ["Forest", "Grizzly Bears"]) toLibrary(game, name);
    a.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((c) => c.id);
    cast(game, spell);
    // Two cards drawn, each after two discards: four discards in all.
    expect(names(game, hand(game)).sort()).toEqual(["Forest", "Grizzly Bears"]);
    expect(graveyard(game).length).toBe(5);
  });

  it("two of them: once one mills, there's no draw left for the other (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Divination", "Plains"]);
    for (const name of ["Swamp", "Mountain", "Forest", "Grizzly Bears"]) toLibrary(game, name);
    cast(game, spell);
    // First card: discard the Plains; the draw it makes finds an empty hand,
    // so the other Chains mills the Bears instead. Second card: an empty hand,
    // a mill (the Forest) — and nothing drawn for the other to replace.
    expect(hand(game)).toEqual([]);
    expect(names(game, graveyard(game)).sort()).toEqual(["Divination", "Forest", "Grizzly Bears", "Plains"]);
    expect(names(game, library(game).slice(0, 2))).toEqual(["Mountain", "Swamp"]);
  });
});

describe("draw replacements stacking with it", () => {
  it("a draw a Notion Thief hands its controller is theirs for Chains to replace (rule 616.2)", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    spawn(game, "Notion Thief", B);
    const [spell] = handOf(game, A, ["Divination", "Plains"]);
    handOf(game, B, ["Swamp", "Mountain"]);
    for (const name of ["Forest", "Grizzly Bears"]) toLibrary(game, name, B);
    b.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((c) => c.id);
    cast(game, spell);
    // Alice's two draws were bob's, each a discard then a draw.
    expect(names(game, hand(game))).toEqual(["Plains"]);
    expect(hand(game, B).length).toBe(2);
    expect(graveyard(game, B).length).toBe(2);
    expect(names(game, hand(game, B))).toEqual(expect.arrayContaining(["Grizzly Bears"]));
  });

  it("no Notion Thief that handed the draw on gets the card Chains has its last player draw (rule 614.5)", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Island", 2);
    spawn(game, "Chains of Mephistopheles");
    for (const p of [B, C, D]) spawn(game, "Notion Thief", p);
    const [spell] = handOf(game, A, ["Think Twice"]);
    for (const p of [B, C, D]) handOf(game, p, ["Swamp"]);
    for (const p of [B, C, D]) toLibrary(game, "Grizzly Bears", p);
    const asked: PlayerId[] = [];
    for (const [seat, p] of [[a, A], [b, B], [c, C], [d, D]] as const) {
      seat.chooseReplacementOrderFn = () => {
        asked.push(p);
        return 0;
      };
      seat.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((x) => x.id);
    }
    cast(game, spell);
    // Alice's draw goes round the Thieves once, bob's, carol's and dave's,
    // and Chains replaces dave's: he discards and draws. That card is part of
    // the replaced event, so no Thief takes it again, and he's asked nothing.
    expect(game.eventsOfType("draw-redirected").map((e) => [e.from, e.to])).toEqual([
      [A, B],
      [B, C],
      [C, D],
    ]);
    expect(asked).toEqual([A]);
    expect(names(game, hand(game, D))).toEqual(["Grizzly Bears"]);
    expect(names(game, graveyard(game, D))).toEqual(["Swamp"]);
  });

  it("\"that many plus one\" isn't added again to the card the discard has them draw (rule 614.5)", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    spawn(game, "Quantum Riddler");
    const [spell] = handOf(game, A, ["Divination", "Plains"]);
    for (const name of ["Swamp", "Mountain", "Forest", "Grizzly Bears", "Island"]) toLibrary(game, name);
    a.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((c) => c.id);
    cast(game, spell);
    // One card in hand: the Riddler makes the draw of two three, and each of
    // those is a discard then one card — not two.
    expect(names(game, hand(game))).toEqual(["Forest"]);
    expect(names(game, library(game).slice(0, 2))).toEqual(["Mountain", "Swamp"]);
  });
});
