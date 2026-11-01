/**
 * "Return all [cards] in your graveyard that were put there from the
 * battlefield this turn" — the `return-from-graveyard` sweep over
 * `CardFilter.putIntoGraveyardThisTurn`.
 *
 * What each test pins down:
 *
 * - Faith's Reward: permanent cards of any type that left the battlefield this
 *   turn, a noncreature among them; not one discarded, milled or there since an
 *   earlier turn; not another player's;
 * - Second Sunrise: every player's own come back, each under its owner's
 *   control, and a planeswalker card stays;
 * - Gleancrawler: at your end step, to hand, creature cards only; and nothing
 *   at an opponent's end step;
 * - a card that left the graveyard and was put back is a new object, put there
 *   from elsewhere (rule 400.7).
 */

import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  controller,
  destroy,
  graveyard,
  hand,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const mill = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(A, { kind: "mill", target: 0, amount }, [ref(player)]);
  settle(game);
};

const discard = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "discard", target: 0, amount }, [ref(player)]);
  settle(game);
};

describe("Faith's Reward", () => {
  it("returns your permanent cards that left the battlefield this turn, whatever their type", () => {
    const { game } = table({ deck: "Plains" });
    const creature = spawn(game, "Grizzly Bears");
    const artifact = spawn(game, "Sol Ring");
    const land = spawn(game, "Forest");
    const theirs = spawn(game, "Hill Giant", B);
    destroy(game, creature);
    destroy(game, artifact);
    destroy(game, land);
    destroy(game, theirs);
    const spell = toHand(game, "Faith's Reward");
    for (let i = 0; i < 4; i += 1) spawn(game, "Plains");

    cast(game, spell);
    expect(zone(game, creature)).toBe("battlefield");
    expect(zone(game, artifact)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
    expect(controller(game, creature)).toBe(A);
    // Your graveyard only.
    expect(zone(game, theirs)).toBe("graveyard");
    // The spell itself is an instant: it isn't a permanent card, and it was
    // never on the battlefield.
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("leaves a discarded, a milled and an earlier turn's card where they are", () => {
    const { game } = table({ deck: "Plains" });
    const earlier = spawn(game, "Grizzly Bears");
    destroy(game, earlier);
    nextTurn(game);
    nextTurn(game);
    const discarded = toHand(game, "Llanowar Elves");
    discard(game, A, hand(game).length);
    const milled = toLibrary(game, "Hill Giant");
    mill(game, A, 1);
    const died = spawn(game, "Elvish Mystic");
    destroy(game, died);
    const spell = toHand(game, "Faith's Reward");
    for (let i = 0; i < 4; i += 1) spawn(game, "Plains");

    cast(game, spell);
    expect(zone(game, died)).toBe("battlefield");
    expect(zone(game, discarded)).toBe("graveyard");
    expect(zone(game, milled)).toBe("graveyard");
    expect(zone(game, earlier)).toBe("graveyard");
  });

  it("a card that left the graveyard and was put back wasn't put there from the battlefield", () => {
    const { game } = table({ deck: "Plains" });
    const creature = spawn(game, "Grizzly Bears");
    destroy(game, creature);
    expect(graveyard(game)).toContain(creature);
    // Back to the hand, then discarded: a new object, put there from a hand.
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(creature)]);
    settle(game);
    expect(hand(game)).toContain(creature);
    discard(game, A, hand(game).length);
    expect(zone(game, creature)).toBe("graveyard");
    const spell = toHand(game, "Faith's Reward");
    for (let i = 0; i < 4; i += 1) spawn(game, "Plains");

    cast(game, spell);
    expect(zone(game, creature)).toBe("graveyard");
  });

  it("a token never comes back: it ceased to exist (rule 111.7)", () => {
    const { game } = table({ deck: "Plains" });
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken);
    if (token === undefined) throw new Error("no token");
    destroy(game, token);
    settle(game);
    const spell = toHand(game, "Faith's Reward");
    for (let i = 0; i < 4; i += 1) spawn(game, "Plains");
    cast(game, spell);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken)).toEqual([]);
  });
});

describe("Second Sunrise", () => {
  it("returns each player's own, each under its owner's control", () => {
    const { game } = table({ deck: "Plains" });
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const theirLand = spawn(game, "Forest", B);
    const walker = spawn(game, "Jace Beleren", B);
    destroy(game, mine);
    destroy(game, theirs);
    destroy(game, theirLand);
    destroy(game, walker);
    const milled = toLibrary(game, "Llanowar Elves", B);
    mill(game, B, 1);
    const earlier = toGraveyard(game, "Elvish Mystic", B);
    const spell = toHand(game, "Second Sunrise");
    for (let i = 0; i < 3; i += 1) spawn(game, "Plains");

    cast(game, spell);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(zone(game, theirLand)).toBe("battlefield");
    expect(zone(game, walker)).toBe("graveyard");
    expect(zone(game, milled)).toBe("graveyard");
    expect(zone(game, earlier)).toBe("graveyard");
  });
});

describe("Gleancrawler", () => {
  it("returns your creature cards to hand at your end step, leaving the rest", () => {
    const { game } = table({ deck: "Swamp" });
    spawn(game, "Gleancrawler");
    const creature = spawn(game, "Grizzly Bears");
    const artifact = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Hill Giant", B);
    destroy(game, creature);
    destroy(game, artifact);
    destroy(game, theirs);

    toStep(game, "end");
    settle(game);
    expect(hand(game)).toContain(creature);
    expect(zone(game, artifact)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("does nothing at an opponent's end step", () => {
    const { game } = table({ deck: "Swamp" });
    spawn(game, "Gleancrawler");
    nextTurn(game);
    expect(game.activePlayer).toBe(B);
    const creature = spawn(game, "Grizzly Bears");
    destroy(game, creature);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, creature)).toBe("graveyard");
  });
});
