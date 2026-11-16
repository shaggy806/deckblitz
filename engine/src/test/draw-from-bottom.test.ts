/**
 * The `drawsFromBottom` static: its controller draws the bottom card of
 * their library rather than the top one (rule 121.1), by every draw. River
 * Song's Meet in Reverse, and its Spoilers trigger on an opponent's scry,
 * surveil or search. Written from the Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, counters, destroy, hand, life, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("River Song: Meet in Reverse", () => {
  it("its controller draws the bottom card of their library, by an effect", () => {
    const { game } = table();
    spawn(game, "River Song");
    const top = toLibrary(game, "Island");
    const bottom = library(game, A).at(-1)!;
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    expect(zone(game, bottom)).toBe("hand");
    expect(zone(game, top)).toBe("library");
    expect(library(game, A)[0]).toBe(top);
  });

  it("in the draw step too, and an opponent still draws from the top", () => {
    const { game } = table();
    spawn(game, "River Song");
    const top = toLibrary(game, "Island");
    const bottom = library(game, A).at(-1)!;
    const bobsTop = toLibrary(game, "Forest", B);
    toStep(game, "precombat-main");
    expect(game.state.turn.number).toBe(3);
    expect(hand(game)).toContain(bottom);
    expect(zone(game, top)).toBe("library");
    expect(hand(game, B)).toContain(bobsTop);
  });

  it("gone from the battlefield, its controller draws from the top again", () => {
    const { game } = table();
    const river = spawn(game, "River Song");
    const top = toLibrary(game, "Island");
    destroy(game, river);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    expect(zone(game, top)).toBe("hand");
  });

  it("drawing from an empty library is still an attempt to draw", () => {
    const { game } = table();
    spawn(game, "River Song");
    for (const id of [...library(game, A)]) game.debugMove(id, "exile");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).toBe(true);
  });
});

describe("River Song: Spoilers", () => {
  it("an opponent scries: a +1/+1 counter, then damage to them equal to its power", () => {
    const { game } = table();
    const river = spawn(game, "River Song");
    game.debugApplyEffect(B, { kind: "scry", amount: 1 }, []);
    settle(game);
    expect(counters(game, river)).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("an opponent surveils", () => {
    const { game } = table();
    const river = spawn(game, "River Song");
    game.debugApplyEffect(B, { kind: "surveil", amount: 2 }, []);
    settle(game);
    expect(counters(game, river)).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("an opponent searches their library", () => {
    const { game } = table();
    const river = spawn(game, "River Song");
    game.debugApplyEffect(B, { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 1 }, []);
    settle(game);
    expect(counters(game, river)).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("not its controller's own scry or search", () => {
    const { game } = table();
    const river = spawn(game, "River Song");
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    game.debugApplyEffect(A, { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 1 }, []);
    settle(game);
    expect(counters(game, river)).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});
