/**
 * "When you discard this card" (`on: "this-discarded"`) and "when a spell or
 * ability an opponent controls causes you to discard this card" (`byOpponent`)
 * — a trigger that can't fire from the battlefield, so it fires from the zone
 * the discard put the card in (rule 113.6k), with the discard's cause (the
 * `cards-discarded` event's `cause`: the controller of the spell or ability
 * whose effect or cost discarded it).
 *
 * What each test pins down:
 *
 * - Titanbones and Bartered Cow: any discard fires it — an effect's, an
 *   opponent's — and the Cow's "dies" half is its own trigger; a copy of the
 *   card already in the graveyard, or on the battlefield, doesn't see another
 *   card's discard;
 * - Psychic Purge: an opponent's spell (Mind Rot) — "that player", its
 *   caster, loses 5; your own Mind Rot, and a discard no spell caused, don't;
 * - Guerrilla Tactics: its own target, chosen as the trigger is put on the
 *   stack, takes 4;
 * - Metrognome: an opponent's Duress choosing it from your hand (the
 *   opponent chooses, you discard — rule 701.9b);
 * - a discard an opponent's spell queued behind another player's choice
 *   (Delirium Skeins in four players) still knows its cause;
 * - Rielle's "for the first time each turn" (`discards` `firstTimeEachTurn`):
 *   that many cards drawn for the turn's first discard, none for a second,
 *   and none after a discard made before she arrived.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameObject } from "../state.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** `player` discards `amount` cards, caused by nothing on the stack. */
const discard = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "discard", target: 0, amount }, [ref(player)]);
  settle(game);
};

/** A discard answer taking `ids` first, then whatever else fills the count. */
const prefer =
  (...ids: readonly ObjectId[]) =>
  (h: readonly GameObject[], n: number): ObjectId[] =>
    [...ids.filter((id) => h.some((o) => o.id === id)), ...h.map((o) => o.id).filter((id) => !ids.includes(id))].slice(0, n);

/** `caster` casts Mind Rot at `victim` (it's `caster`'s main phase). */
const mindRot = (game: Game, caster: PlayerId, victim: PlayerId): void => {
  lands(game, "Swamp", 3, caster);
  const spell = toHand(game, "Mind Rot", caster);
  cast(game, spell, { player: caster, targets: [ref(victim)] });
};

describe("when you discard this card", () => {
  it("Titanbones gains 3 life for any discard of it, and nothing for another card's", () => {
    const { game, a } = table();
    const bones = toHand(game, "Titanbones, Towering Heart");
    const other = toHand(game, "Grizzly Bears");
    toGraveyard(game, "Titanbones, Towering Heart");
    const onBoard = spawn(game, "Titanbones, Towering Heart");
    a.chooseDiscardsFn = () => [other];
    discard(game, A, 1);
    expect(life(game)).toBe(20);
    expect(counters(game, onBoard)).toBe(0);

    a.chooseDiscardsFn = () => [bones];
    discard(game, A, 1);
    expect(zone(game, bones)).toBe("graveyard");
    expect(life(game)).toBe(23);
    // The one on the battlefield saw the life gain, not the discard.
    expect(counters(game, onBoard)).toBe(2);
  });

  it("Bartered Cow makes a Food when discarded by an opponent's spell, and when it dies", () => {
    const { game, a } = table({ deck: "Swamp" });
    const cows = [toHand(game, "Bartered Cow"), toHand(game, "Bartered Cow")];
    nextTurn(game);
    a.chooseDiscardsFn = prefer(...cows);
    mindRot(game, B, A);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Bartered Cow")).toHaveLength(2);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    destroy(game, spawn(game, "Bartered Cow"));
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });
});

describe("when a spell or ability an opponent controls causes you to discard this card", () => {
  it("Psychic Purge: the opponent whose spell it was loses 5 life", () => {
    const { game, a } = table({ players: 3, deck: "Swamp" });
    const purge = toHand(game, "Psychic Purge");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(purge);
    mindRot(game, B, A);
    expect(zone(game, purge)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("Psychic Purge: not your own spell, and not a discard nothing caused", () => {
    const { game, a } = table({ deck: "Swamp" });
    const purges = [toHand(game, "Psychic Purge"), toHand(game, "Psychic Purge")];
    a.chooseDiscardsFn = prefer(...purges);
    mindRot(game, A, A);
    expect(purges.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);

    const third = toHand(game, "Psychic Purge");
    a.chooseDiscardsFn = prefer(third);
    discard(game, A, 1);
    expect(zone(game, third)).toBe("graveyard");
    expect(hand(game)).not.toContain(third);
    expect([life(game, A), life(game, B)]).toEqual([20, 20]);
  });

  it("Guerrilla Tactics deals 4 damage to the target chosen as it triggers", () => {
    const { game, a } = table({ deck: "Swamp" });
    const tactics = toHand(game, "Guerrilla Tactics");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(tactics);
    pickTargets(a, B);
    mindRot(game, B, A);
    expect(life(game, B)).toBe(16);
  });

  it("Metrognome: an opponent's Duress choosing it makes four Gnomes", () => {
    const { game, b } = table({ deck: "Swamp" });
    const gnome = toHand(game, "Metrognome");
    toHand(game, "Lightning Bolt");
    nextTurn(game);
    lands(game, "Swamp", 1, B);
    const duress = toHand(game, "Duress", B);
    pickFromZone(b, gnome);
    cast(game, duress, { player: B, targets: [ref(A)] });
    expect(zone(game, gnome)).toBe("graveyard");
    expect(tokensNamed(game, "Gnome Token", A)).toBe(4);
  });

  it("Rielle draws that many for the turn's first discard only — one before she arrived counts", () => {
    const { game, a } = table();
    spawn(game, "Rielle, the Everwise");
    const cards = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant"), toHand(game, "Grizzly Bears")];
    a.chooseDiscardsFn = prefer(cards[0], cards[1]);
    const before = hand(game).length;
    discard(game, A, 2);
    expect(hand(game).length).toBe(before - 2 + 2);
    a.chooseDiscardsFn = prefer(cards[2]);
    discard(game, A, 1);
    expect(hand(game).length).toBe(before - 1);

    nextTurn(game);
    nextTurn(game);
    // Alice's next turn: a discard first, then Rielle, then another.
    const early = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = prefer(early);
    discard(game, A, 1);
    spawn(game, "Rielle, the Everwise");
    const later = toHand(game, "Hill Giant");
    const now = hand(game).length;
    a.chooseDiscardsFn = prefer(later);
    discard(game, A, 1);
    expect(hand(game).length).toBe(now - 1);
  });

  it("knows its cause when the discard waits its turn behind another player's", () => {
    const { game, a, b, c } = table({ players: 4, deck: "Swamp" });
    const purge = toHand(game, "Psychic Purge");
    for (const p of [A, B, C]) for (let i = 0; i < 4; i += 1) toHand(game, "Grizzly Bears", p);
    nextTurn(game);
    nextTurn(game);
    // Carol's turn: each player discards three, her own spell.
    for (const seat of [b, c]) seat.chooseDiscardsFn = prefer();
    a.chooseDiscardsFn = prefer(purge);
    lands(game, "Swamp", 6, C);
    const skeins = toHand(game, "Delirium Skeins", C);
    cast(game, skeins, { player: C });
    expect(zone(game, purge)).toBe("graveyard");
    expect(life(game, C)).toBe(15);
    expect(life(game, B)).toBe(20);
  });
});
