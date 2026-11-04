/**
 * Chainer, Nightmare Adept: a `player-effect`'s `castFromGraveyard` with `once`,
 * one creature spell per activation (its ruling), and a trigger for a nontoken
 * creature you control you didn't cast from your hand.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, cast, destroy, enter, graveyard, hand, keywords, lands, named, nextTurn, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const graveyardOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");

describe("Chainer, Nightmare Adept's permission", () => {
  it("costs a discard, and lets one creature spell be cast from your graveyard this turn", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const chainer = spawn(game, "Chainer, Nightmare Adept");
    const first = toGraveyard(game, "Grizzly Bears");
    const second = toGraveyard(game, "Grizzly Bears");
    const spell = toGraveyard(game, "Giant Growth");
    expect(graveyardOffers(game, first)).toHaveLength(0);

    const size = hand(game).length;
    activate(game, chainer, 0);
    expect(hand(game)).toHaveLength(size - 1);
    expect(graveyard(game, A)).toHaveLength(4);
    expect(graveyardOffers(game, first)).toHaveLength(1);
    expect(graveyardOffers(game, spell)).toHaveLength(0);

    cast(game, first, { via: "graveyard-permission" });
    expect(zone(game, first)).toBe("battlefield");
    // Used up, by the one spell.
    expect(graveyardOffers(game, second)).toHaveLength(0);
  });

  it("only once each turn, and the permission ends with the turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const chainer = spawn(game, "Chainer, Nightmare Adept");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, chainer, 0);
    expect(() => activate(game, chainer, 0)).toThrow();
    nextTurn(game);
    nextTurn(game);
    expect(graveyardOffers(game, bears)).toHaveLength(0);
  });

  it("left and back, a second activation is a second cast", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const first = toGraveyard(game, "Grizzly Bears");
    const second = toGraveyard(game, "Grizzly Bears");
    const chainer = spawn(game, "Chainer, Nightmare Adept");
    activate(game, chainer, 0);
    destroy(game, chainer);
    const again = spawn(game, "Chainer, Nightmare Adept");
    activate(game, again, 0);
    cast(game, first, { via: "graveyard-permission" });
    expect(graveyardOffers(game, second)).toHaveLength(1);
    cast(game, second, { via: "graveyard-permission" });
    expect(zone(game, second)).toBe("battlefield");
  });

  it("follows the spell's own timing: not on an opponent's turn without flash", () => {
    const { game } = table();
    const chainer = spawn(game, "Chainer, Nightmare Adept");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, chainer, 0);
    nextTurn(game);
    expect(graveyardOffers(game, bears)).toHaveLength(0);
  });
});

describe("Chainer, Nightmare Adept's haste", () => {
  it("a creature cast from your graveyard has it until your next turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const chainer = spawn(game, "Chainer, Nightmare Adept");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, chainer, 0);
    cast(game, bears, { via: "graveyard-permission" });
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("not one cast from your hand", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Chainer, Nightmare Adept");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("one put onto the battlefield without being cast, Chainer included, and not a token or another's", () => {
    const { game } = table();
    const chainer = enter(game, "Chainer, Nightmare Adept");
    expect(keywords(game, chainer).has("haste")).toBe(true);
    const bears = enter(game, "Grizzly Bears");
    settle(game);
    expect(keywords(game, bears).has("haste")).toBe(true);
    const theirs = enter(game, "Hill Giant", B);
    settle(game);
    expect(keywords(game, theirs).has("haste")).toBe(false);
    game.debugApplyEffect(A, { kind: "create-token", token: "Gnome Soldier Token", count: 1 }, []);
    settle(game);
    const [token] = named(game, "Gnome Soldier Token", A);
    expect(keywords(game, token).has("haste")).toBe(false);
  });
});
