/**
 * "Exile a Fungus card from a graveyard" as a cost (Thelon of Havenwood):
 * `exileFromGraveyard`'s `singleGraveyard` at a count of one — any player's
 * graveyard, the card chosen as the cost is paid (rules 602.2b, 601.2h), with
 * nothing to keep together. And Thelon's "Each Fungus creature gets +1/+1 for
 * each spore counter on it", everyone's Fungi.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, counters, lands, pt, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const addSpores = (game: Game, id: ObjectId, n: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "spore", amount: n }, [ref(id)]);
  settle(game);
};

const can = (game: Game, thelon: ObjectId): string | null =>
  game.canDispatch({ type: "activate-ability", player: A, source: thelon, abilityIndex: 0, targets: [] });

describe("Thelon of Havenwood", () => {
  it("gives each Fungus creature, anyone's, +1/+1 for each spore counter on it", () => {
    const { game } = table();
    spawn(game, "Thelon of Havenwood", A);
    const theirs = spawn(game, "Feral Thallid", B);
    const bears = spawn(game, "Grizzly Bears", A);
    addSpores(game, theirs, 2);
    addSpores(game, bears, 2);
    expect(pt(game, theirs)).toEqual({ power: 8, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("exiles the one Fungus card there is, from an opponent's graveyard, and spores every Fungus", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const thelon = spawn(game, "Thelon of Havenwood", A);
    const mine = spawn(game, "Feral Thallid", A);
    const theirs = spawn(game, "Feral Thallid", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const fungusCard = toGraveyard(game, "Feral Thallid", B);
    const other = toGraveyard(game, "Grizzly Bears", A);
    activate(game, thelon, 0);
    expect(zone(game, fungusCard)).toBe("exile");
    expect(zone(game, other)).toBe("graveyard");
    expect(counters(game, mine, "spore")).toBe(1);
    expect(counters(game, theirs, "spore")).toBe(1);
    expect(counters(game, bears, "spore")).toBe(0);
    expect(pt(game, theirs)).toEqual({ power: 7, toughness: 4 });
  });

  it("asks which, across every graveyard, with nothing to keep together", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const thelon = spawn(game, "Thelon of Havenwood", A);
    const mine = toGraveyard(game, "Feral Thallid", A);
    const theirs = toGraveyard(game, "Feral Thallid", B);
    activate(game, thelon, 0, { settle: false });
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("choose-from-zone");
    if (asked?.kind !== "choose-from-zone") return;
    expect([...asked.eligible].sort()).toEqual([mine, theirs].sort());
    expect(asked.together).toBeUndefined();
    expect(asked.min).toBe(1);
    expect(asked.max).toBe(1);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [theirs] });
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("can't be activated with no Fungus card in any graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const thelon = spawn(game, "Thelon of Havenwood", A);
    spawn(game, "Feral Thallid", A);
    toGraveyard(game, "Grizzly Bears", B);
    expect(can(game, thelon)).toMatch(/graveyard/);
    toGraveyard(game, "Feral Thallid", B);
    expect(can(game, thelon)).toBeNull();
  });
});
