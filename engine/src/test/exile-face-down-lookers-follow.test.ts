/**
 * `exile-from-library`'s `faceDown: "linked-controller"`: cards exiled face
 * down that the linked source's controller may look at — and whoever comes to
 * control it, each going on looking (rule 406.3) — Colfenor's Plans, with its
 * permission to play them, its skipped draw step and its one spell a turn.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, destroy, enter, hand, lands, ref, settle, table, toHand, toLibrary, toStep, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);
const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

describe("Colfenor's Plans", () => {
  it("exiles seven face down that only its controller sees, and lets them play those cards, one spell a turn", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    const plans = enter(game, "Colfenor's Plans");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, forest)).toBe("exile");
    expect(sees(game, A, bears)).toBe(true);
    expect(sees(game, B, bears)).toBe(false);
    expect(offers(game, forest).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: A, card: forest });
    lands(game, "Forest", 1);
    expect(offers(game, bears).length).toBeGreaterThan(0);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, plans)).toBe("battlefield");
    // A second spell this turn: no.
    const second = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(offers(game, second)).toEqual([]);
  });

  it("whoever gains control of it may look at and play the cards, and its first controller still looks", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const plans = enter(game, "Colfenor's Plans");
    expect(game.state.objects[bears].exiledFaceDown?.lookers).toEqual([A]);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(plans)]);
    settle(game);
    expect(sees(game, B, bears)).toBe(true);
    expect(sees(game, A, bears)).toBe(true);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    expect(offers(game, bears, B).length).toBeGreaterThan(0);
    expect(offers(game, bears, A)).toEqual([]);
  });

  it("once it has left, the cards can still be looked at but not played", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const plans = enter(game, "Colfenor's Plans");
    lands(game, "Forest", 2);
    destroy(game, plans);
    expect(sees(game, A, bears)).toBe(true);
    expect(offers(game, bears)).toEqual([]);
  });

  it("skips its controller's draw step", () => {
    const { game } = table();
    enter(game, "Colfenor's Plans");
    const before = hand(game, A).length;
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    expect(hand(game, A).length).toBe(before);
  });
});
