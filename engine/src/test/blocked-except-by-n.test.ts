/**
 * Blocking restrictions an attacker carries (rule 509.1b): "can't be blocked
 * except by N or more creatures" (`blockedByAtLeast` — menace's restriction,
 * 702.111b, with a larger N: Troll of Khazad-dûm, Sonorous Howlbonder),
 * "can't be blocked as long as / unless defending player …"
 * (`cantBeBlockedIfDefender` / `cantBeBlockedUnlessDefender` — Neurok Spy,
 * Hazy Homunculus, Graxiplon), "can't be blocked unless all creatures
 * defending player controls block it" (`blockedOnlyByAll` — Tromokratis),
 * and a block filter counting permanents (Kraken of the Straits).
 */

import { describe, expect, it } from "vitest";

import { objHasKeyword } from "../characteristics.js";
import { blockingViolations, obeyingLure } from "../combat/blocking.js";
import { A, B, C, blockOffer, lands, spawn, table } from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: string) =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("can't be blocked except by three or more creatures", () => {
  it("Troll of Khazad-dûm: none or three, never one or two", () => {
    const { game, a } = table();
    const troll = spawn(game, "Troll of Khazad-dûm", A);
    const [x, y, z] = [0, 1, 2].map(() => spawn(game, "Grizzly Bears", B));
    const offer = blockOffer(game, a, [troll]);
    expect(offer.menaceAttackers).toEqual([troll]);
    expect(offer.minBlockers).toEqual({ [troll]: 3 });
    const two = [x, y].map((blocker) => ({ blocker, attacker: troll }));
    expect(blockingViolations(two, offer)).toEqual([{ kind: "menace", attacker: troll, needs: 3 }]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: two })).toThrow(/3 or more creatures/);
    // A policy's pair is dropped rather than declared.
    expect(obeyingLure(two, offer)).toEqual([]);
    const three = [x, y, z].map((blocker) => ({ blocker, attacker: troll }));
    expect(blockingViolations(three, offer)).toEqual([]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: three });
    expect(game.state.objects[troll].blockedBy).toHaveLength(3);
  });

  it("Sonorous Howlbonder reaches each creature you control with menace, and only those", () => {
    const { game, a } = table();
    spawn(game, "Sonorous Howlbonder", A);
    const mauler = spawn(game, "Gloomfang Mauler", A); // menace
    const bears = spawn(game, "Grizzly Bears", A);
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [mauler, bears]);
    expect(offer.minBlockers).toEqual({ [mauler]: 3 });
    expect(offer.menaceAttackers).toEqual([mauler]);
  });

  it("a stack of three tokens is three blockers", () => {
    const { game, a } = table();
    const troll = spawn(game, "Troll of Khazad-dûm", A);
    const goblins = spawn(game, "Grizzly Bears", B);
    game.state.objects[goblins].isToken = true;
    game.state.objects[goblins].stackCount = 3;
    const offer = blockOffer(game, a, [troll]);
    expect(blockingViolations([{ blocker: goblins, attacker: troll }], offer)).toEqual([]);
    expect(blockingViolations([{ blocker: goblins, attacker: troll, count: 2 }], offer)).toHaveLength(1);
  });
});

describe("can't be blocked as long as / unless defending player …", () => {
  it("Neurok Spy is blockable only by a player without an artifact", () => {
    const { game, a } = table({ players: 3 });
    const spy = spawn(game, "Neurok Spy", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Sol Ring", C);
    expect(canBlock(blockOffer(game, a, [spy], B), bobBears)).toEqual([spy]);
    const { game: g2, a: a2 } = table({ players: 3 });
    const spy2 = spawn(g2, "Neurok Spy", A);
    const carol2 = spawn(g2, "Grizzly Bears", C);
    spawn(g2, "Sol Ring", C);
    const bears2 = spawn(g2, "Grizzly Bears", A);
    expect(canBlock(blockOffer(g2, a2, [spy2, bears2], C), carol2)).toEqual([bears2]);
  });

  it("Hazy Homunculus: an untapped land stops blocks, a tapped one doesn't", () => {
    const { game, a } = table();
    const homunculus = spawn(game, "Hazy Homunculus", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const [forest] = lands(game, "Forest", 1, B);
    game.state.objects[forest].tapped = true;
    expect(canBlock(blockOffer(game, a, [homunculus]), bears)).toEqual([homunculus]);
    const { game: g2, a: a2 } = table();
    const h2 = spawn(g2, "Hazy Homunculus", A);
    const b2 = spawn(g2, "Grizzly Bears", B);
    lands(g2, "Forest", 1, B);
    const other = spawn(g2, "Grizzly Bears", A);
    expect(canBlock(blockOffer(g2, a2, [h2, other]), b2)).toEqual([other]);
  });

  it("Graxiplon needs three of the defender's creatures sharing a type, a changeling counting for any", () => {
    const { game, a } = table();
    const graxiplon = spawn(game, "Graxiplon", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Grizzly Bears", A);
    expect(canBlock(blockOffer(game, a, [graxiplon, other]), bears)).toEqual([other]);

    const { game: g2, a: a2 } = table();
    const grax2 = spawn(g2, "Graxiplon", A);
    const b2 = spawn(g2, "Grizzly Bears", B);
    spawn(g2, "Grizzly Bears", B);
    spawn(g2, "Changeling Outcast", B);
    expect(canBlock(blockOffer(g2, a2, [grax2]), b2)).toEqual([grax2]);
  });
});

describe("can't be blocked unless all creatures defending player controls block it", () => {
  it("Tromokratis: all of them or none", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Tromokratis", A);
    const [x, y] = [0, 1].map(() => spawn(game, "Grizzly Bears", B));
    const offer = blockOffer(game, a, [kraken]);
    expect(offer.blockedByAll).toEqual([kraken]);
    const one = [{ blocker: x, attacker: kraken }];
    expect(blockingViolations(one, offer)).toEqual([{ kind: "blocked-by-all", attacker: kraken, blocker: y }]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: one })).toThrow(/all your creatures/);
    expect(obeyingLure(one, offer)).toEqual([]);
    game.dispatch({
      type: "declare-blockers",
      player: B,
      blocks: [x, y].map((blocker) => ({ blocker, attacker: kraken })),
    });
    expect(game.state.objects[kraken].blockedBy).toHaveLength(2);
  });

  it("one creature of theirs that can't block it — tapped — leaves it unblockable", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Tromokratis", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    const offer = blockOffer(game, a, [kraken, spawn(game, "Grizzly Bears", A)]);
    expect(canBlock(offer, bears)).not.toContain(kraken);
    expect(offer.blockedByAll).toBeUndefined();
  });

  it("it has hexproof unless it's attacking or blocking", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Tromokratis", A);
    expect(objHasKeyword(game.state, game.registry, kraken, "hexproof")).toBe(true);
    spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [kraken]);
    expect(objHasKeyword(game.state, game.registry, kraken, "hexproof")).toBe(false);
  });
});

describe("a block filter that counts", () => {
  it("Kraken of the Straits: creatures with power less than your Islands can't block it", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Kraken of the Straits", A);
    lands(game, "Island", 3, A);
    const bears = spawn(game, "Grizzly Bears", B); // power 2 < 3
    const giant = spawn(game, "Hill Giant", B); // power 3
    const offer = blockOffer(game, a, [kraken]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([kraken]);
  });
});
