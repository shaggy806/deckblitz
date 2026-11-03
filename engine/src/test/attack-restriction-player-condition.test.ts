/**
 * Combat restrictions conditioned on the other player's board or state, asked
 * per attack (rules 506.2, 508.1c) or per block (509.1b): `PlayerTest.holds`,
 * any condition read as that player, and its neighbours — Monstrous Hound,
 * Branded Brawlers, Vantress Gargoyle, Lurking Green Dragon, Crown-Hunter
 * Hireling.
 *
 * A block offer needs a creature that may block, or the defender is never
 * asked: the tests give them a Grizzly Bears beside the one that can't.
 */

import { describe, expect, it } from "vitest";

import { defendersForAttacker } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  type BlockOffer,
  activate,
  blockOffer,
  enter,
  graveyard,
  hand,
  lands,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
} from "./harness.js";

/** The table's opening hand of Wastes, gone: only what a test puts there. */
const emptyHand = (game: Game, player: PlayerId): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "graveyard");
};

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly string[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("a restriction read as the defending or attacking player", () => {
  it("Vantress Gargoyle attacks only a player with seven cards in their graveyard, each graveyard its own", () => {
    const { game } = table({ players: 4 });
    const gargoyle = spawn(game, "Vantress Gargoyle", A);
    // Your own graveyard doesn't count: "their" is the defending player's.
    for (let i = 0; i < 9; i += 1) toGraveyard(game, "Grizzly Bears", A);
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Grizzly Bears", B);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Grizzly Bears", C);
    expect(defendersForAttacker(game.state, game.registry, A, gargoyle)).toEqual([C]);
    toGraveyard(game, "Grizzly Bears", B);
    expect(defendersForAttacker(game.state, game.registry, A, gargoyle)).toEqual([B, C]);
  });

  it("…and blocks only with four cards in your own hand, whoever's attacking", () => {
    const { game, a } = table();
    const gargoyle = spawn(game, "Vantress Gargoyle", B);
    const other = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    emptyHand(game, B);
    for (let i = 0; i < 3; i += 1) toHand(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, gargoyle)).toEqual([]);
    expect(canBlock(offer, other)).toEqual([attacker]);
  });

  it("…a fourth card lets it block", () => {
    const { game, a } = table();
    const gargoyle = spawn(game, "Vantress Gargoyle", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    emptyHand(game, B);
    for (let i = 0; i < 4; i += 1) toHand(game, "Grizzly Bears", B);
    expect(canBlock(blockOffer(game, a, [attacker]), gargoyle)).toEqual([attacker]);
  });

  it("…and its {T} mills each player one card", () => {
    const { game } = table({ players: 3 });
    const gargoyle = spawn(game, "Vantress Gargoyle", A);
    for (const p of [A, B, C]) toLibrary(game, "Grizzly Bears", p);
    const before = [A, B, C].map((p) => graveyard(game, p).length);
    activate(game, gargoyle);
    expect([A, B, C].map((p) => graveyard(game, p).length)).toEqual(before.map((n) => n + 1));
  });

  it("Crown-Hunter Hireling makes you the monarch, then can attack only a monarch: the condition is theirs, not yours", () => {
    const { game } = table({ players: 4 });
    const hireling = enter(game, "Crown-Hunter Hireling", A);
    expect(game.state.monarch).toBe(A);
    expect(defendersForAttacker(game.state, game.registry, A, hireling)).toEqual([]);
    // Dave's own Hireling takes the crown from Alice.
    enter(game, "Crown-Hunter Hireling", D);
    expect(game.state.monarch).toBe(D);
    expect(defendersForAttacker(game.state, game.registry, A, hireling)).toEqual([D]);
  });

  it("Monstrous Hound attacks and blocks only with more lands than that player", () => {
    const { game, a } = table({ players: 3 });
    const hound = spawn(game, "Monstrous Hound", A);
    lands(game, "Mountain", 2, A);
    lands(game, "Island", 2, B);
    lands(game, "Island", 1, C);
    expect(defendersForAttacker(game.state, game.registry, A, hound)).toEqual([C]);

    // Bob's Hound: two lands to Alice's two — not more, so it can't block.
    const bobHound = spawn(game, "Monstrous Hound", B);
    const other = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, bobHound)).toEqual([]);
    expect(canBlock(offer, other)).toEqual([attacker]);
  });

  it("…and a third land of its controller's lets Monstrous Hound block", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2, A);
    lands(game, "Island", 3, B);
    const hound = spawn(game, "Monstrous Hound", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    expect(canBlock(blockOffer(game, a, [attacker]), hound)).toEqual([attacker]);
  });

  it("Branded Brawlers: the defender's untapped land stops the attack, yours stops the block", () => {
    const { game, a } = table({ players: 3 });
    const brawlers = spawn(game, "Branded Brawlers", A);
    spawn(game, "Island", B);
    spawn(game, "Island", C, { tapped: true });
    expect(defendersForAttacker(game.state, game.registry, A, brawlers)).toEqual([C]);

    const bobBrawlers = spawn(game, "Branded Brawlers", B);
    const other = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, bobBrawlers)).toEqual([]);
    expect(canBlock(offer, other)).toEqual([attacker]);
  });

  it("…and with every land tapped, Branded Brawlers may block", () => {
    const { game, a } = table();
    spawn(game, "Island", B, { tapped: true });
    const brawlers = spawn(game, "Branded Brawlers", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    expect(canBlock(blockOffer(game, a, [attacker]), brawlers)).toEqual([attacker]);
  });

  it("Lurking Green Dragon attacks only a player with a flier", () => {
    const { game } = table({ players: 3 });
    const dragon = spawn(game, "Lurking Green Dragon", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Serra Angel", C);
    expect(defendersForAttacker(game.state, game.registry, A, dragon)).toEqual([C]);
  });
});
