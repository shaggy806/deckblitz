/**
 * A card in a graveyard "that was put there from the battlefield this turn"
 * (or from anywhere this turn) — `GameObject.putIntoGraveyardOn`, read by
 * `CardFilter.putIntoGraveyardThisTurn` — and the look-back history of lands
 * put into graveyards from the battlefield (`turn-history` `to-graveyard`
 * with a controller read as each land last existed, rule 603.10a).
 *
 * What each test pins down:
 *
 * - the marker: a creature that died is "from the battlefield", a discarded
 *   or milled card isn't but is "from anywhere", a card set into a graveyard
 *   by a test or put there on an earlier turn is neither, and a card that
 *   left the graveyard and came back is a new object marked by its new trip
 *   (rule 400.7);
 * - Grim Return: any graveyard's creature card that died this turn, not a
 *   discarded one, entering under the caster's control;
 * - Wreck Hunter: one tapped Powerstone per nonland card in the target
 *   player's graveyard put there from the battlefield this turn;
 * - Thrilling Encore: every graveyard's creature cards that died this turn,
 *   under your control, a milled one left behind;
 * - Night Nurse: "from anywhere" — a discarded permanent card is offered,
 *   one there since an earlier turn and a nonpermanent card aren't;
 * - The Lady of Otaria: its end-step "if" sees a land you controlled put into
 *   a graveyard from the battlefield, though it has left the graveyard since,
 *   and not an opponent's land; and its alternative cost taps three Dwarves.
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  destroy,
  graveyard,
  hand,
  nextTurn,
  pickFromZone,
  pickPermanents,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const FROM_BATTLEFIELD = { putIntoGraveyardThisTurn: { from: ["battlefield"] } } as const;
const FROM_ANYWHERE = { putIntoGraveyardThisTurn: {} } as const;

const matches = (game: Game, id: ObjectId, filter: typeof FROM_BATTLEFIELD | typeof FROM_ANYWHERE): boolean =>
  matchesFilter(game.state, registryOf(game), id, filter, { you: A });

const discard = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "discard", target: 0, amount }, [ref(player)]);
  settle(game);
};

const mill = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(A, { kind: "mill", target: 0, amount }, [ref(player)]);
  settle(game);
};

describe("a card put into a graveyard this turn", () => {
  it("is marked with where it came from, this turn only", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(matches(game, bears, FROM_BATTLEFIELD)).toBe(true);
    expect(matches(game, bears, FROM_ANYWHERE)).toBe(true);

    const discarded = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [discarded];
    discard(game, A, 1);
    expect(zone(game, discarded)).toBe("graveyard");
    expect(matches(game, discarded, FROM_BATTLEFIELD)).toBe(false);
    expect(matches(game, discarded, FROM_ANYWHERE)).toBe(true);

    const milled = toLibrary(game, "Llanowar Elves");
    mill(game, A, 1);
    expect(zone(game, milled)).toBe("graveyard");
    expect(matches(game, milled, FROM_BATTLEFIELD)).toBe(false);
    expect(matches(game, milled, FROM_ANYWHERE)).toBe(true);

    // Set there by the test, not put there by the game.
    const old = toGraveyard(game, "Grizzly Bears");
    expect(matches(game, old, FROM_ANYWHERE)).toBe(false);

    // Rule 400.7: back to the hand and discarded again, it came from the hand.
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(matches(game, bears, FROM_ANYWHERE)).toBe(false);
    a.chooseDiscardsFn = () => [bears];
    discard(game, A, 1);
    expect(matches(game, bears, FROM_BATTLEFIELD)).toBe(false);
    expect(matches(game, bears, FROM_ANYWHERE)).toBe(true);

    nextTurn(game);
    expect(matches(game, discarded, FROM_ANYWHERE)).toBe(false);
    expect(matches(game, milled, FROM_ANYWHERE)).toBe(false);
  });
});

describe("Grim Return", () => {
  it("returns any graveyard's creature card that died this turn, under your control", () => {
    const { game, b } = table({ deck: "Swamp" });
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    const discarded = toHand(game, "Hill Giant", B);
    b.chooseDiscardsFn = () => [discarded];
    discard(game, B, 1);
    const earlier = toGraveyard(game, "Llanowar Elves", B);
    const spell = toHand(game, "Grim Return");
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    spawn(game, "Swamp");

    for (const wrong of [discarded, earlier]) {
      expect(() => cast(game, spell, { targets: [ref(wrong)] })).toThrow(/refused/);
    }
    cast(game, spell, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(game.state.objects[theirs].owner).toBe(B);
  });
});

describe("Wreck Hunter", () => {
  it("makes a tapped Powerstone for each nonland card the target player lost from the battlefield", () => {
    const { game, a, b } = table();
    for (const name of ["Grizzly Bears", "Sol Ring", "Forest"]) destroy(game, spawn(game, name, B));
    const discarded = toHand(game, "Hill Giant", B);
    b.chooseDiscardsFn = () => [discarded];
    discard(game, B, 1);
    // Alice's own dead creature is in the wrong graveyard.
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(graveyard(game, B)).toHaveLength(4);

    pickTargets(a, B);
    const hunter = game.debugSpawn("Wreck Hunter", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(zone(game, hunter)).toBe("battlefield");
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
    const stones = Object.values(game.state.objects).filter((o) => o.cardName === "Powerstone Token");
    expect(stones.every((o) => o.tapped)).toBe(true);
  });
});

describe("Thrilling Encore", () => {
  it("puts every graveyard's creature cards that died this turn onto the battlefield under your control", () => {
    const { game } = table({ deck: "Swamp" });
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    destroy(game, mine);
    destroy(game, theirs);
    const milled = toLibrary(game, "Llanowar Elves", B);
    mill(game, B, 1);
    const spell = toHand(game, "Thrilling Encore");
    for (let i = 0; i < 5; i += 1) spawn(game, "Swamp");

    cast(game, spell);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(zone(game, milled)).toBe("graveyard");
  });
});

describe("Night Nurse, Healer of Heroes", () => {
  it("returns a permanent card put into your graveyard from anywhere this turn", () => {
    const { game, a } = table();
    const discarded = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [discarded];
    discard(game, A, 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    mill(game, A, 1);
    const earlier = toGraveyard(game, "Grizzly Bears");
    const died = spawn(game, "Sol Ring");
    destroy(game, died);

    const seen = watchTargets(a, (offered) => [offered[0]?.find((id) => id === discarded) ?? null]);
    game.debugSpawn("Night Nurse, Healer of Heroes", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([discarded, died].sort());
    expect(seen.offered[0]).not.toContain(bolt);
    expect(seen.offered[0]).not.toContain(earlier);
    expect(hand(game)).toContain(discarded);
  });
});

describe("The Lady of Otaria", () => {
  const LADY = "The Lady of Otaria";

  it("digs for Dwarves at each end step after a land you controlled went to a graveyard", () => {
    const { game, a } = table();
    spawn(game, LADY);
    const forest = spawn(game, "Forest");
    destroy(game, forest);
    // Gone from the graveyard since: it was still put there (603.10a).
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(forest)]);
    settle(game);
    const [dwarf, bears] = [toLibrary(game, "Grizzly Bears"), toLibrary(game, DWARF)].reverse();
    const seen = pickFromZone(a, dwarf);
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "cleanup");
    expect(seen.offered).toEqual([dwarf]);
    expect(hand(game)).toContain(dwarf);
    expect(zone(game, bears)).toBe("library");
  });

  it("doesn't see an opponent's land", () => {
    const { game, a } = table();
    spawn(game, LADY);
    destroy(game, spawn(game, "Forest", B));
    const dwarf = toLibrary(game, DWARF);
    const seen = pickFromZone(a, dwarf);
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "cleanup");
    expect(seen.offered).toEqual([]);
    expect(zone(game, dwarf)).toBe("library");
  });

  it("can be cast by tapping three untapped Dwarves", () => {
    const { game, a } = table();
    const dwarves = [spawn(game, DWARF), spawn(game, DWARF), spawn(game, DWARF, A, { sick: true })];
    const lady = toHand(game, LADY);
    pickPermanents(a, ...dwarves);
    cast(game, lady, { altCost: true });
    expect(zone(game, lady)).toBe("battlefield");
    expect(dwarves.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

const DWARF = "Dwarven Berserker";
