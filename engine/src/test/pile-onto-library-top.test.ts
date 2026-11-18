/**
 * A face-down pile put back on top of the library — `cloak-exiled-pile` with
 * `onto: "library-top"`, `source` read from the graveyard and `whole`:
 * Triumph of Saint Katherine's "when this creature is put into your graveyard
 * from the battlefield, exile it and the top six cards of your library in a
 * face-down pile. If you do, shuffle that pile and put it back on top of your
 * library" (rules 400.7, 406.3), all or nothing (its ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, destroy, graveyard, ref, settle, spawn, table, toLibrary } from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Triumph of Saint Katherine", () => {
  it("dying, it and the top six cards go back on top of the library in a random order", () => {
    const { game } = table();
    const triumph = spawn(game, "Triumph of Saint Katherine");
    const before = [...library(game)];
    expect(before.length).toBeGreaterThanOrEqual(6);
    const topSix = before.slice(0, 6);
    destroy(game, triumph);
    expect(graveyard(game)).not.toContain(triumph);
    expect(library(game)).toHaveLength(before.length + 1);
    // The top seven are the pile; the rest of the library is untouched.
    expect([...library(game).slice(0, 7)].sort()).toEqual([...topSix, triumph].sort());
    expect(library(game).slice(7)).toEqual(before.slice(6));
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });

  it("the pile is shuffled: across seeds it doesn't always land in one place", () => {
    const places = new Set<number>();
    for (let seed = 1; seed <= 8; seed += 1) {
      const { game } = table({ seed });
      const triumph = spawn(game, "Triumph of Saint Katherine");
      destroy(game, triumph);
      places.add(library(game).indexOf(triumph));
    }
    expect(places.size).toBeGreaterThan(1);
    for (const place of places) expect(place).toBeLessThan(7);
  });

  it("with fewer than six cards in the library, nothing is exiled and it stays in the graveyard", () => {
    const { game } = table();
    for (const id of library(game).slice(5)) game.debugMove(id, "exile");
    const before = [...library(game)];
    expect(before).toHaveLength(5);
    const exiledBefore = game.state.zones.shared.exile.length;
    const triumph = spawn(game, "Triumph of Saint Katherine");
    destroy(game, triumph);
    expect(graveyard(game)).toContain(triumph);
    expect(library(game)).toEqual(before);
    expect(game.state.zones.shared.exile).toHaveLength(exiledBefore);
  });

  it("gone from the graveyard before the ability resolves, nothing is exiled", () => {
    const { game } = table();
    const triumph = spawn(game, "Triumph of Saint Katherine");
    const before = [...library(game)];
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(triumph)]);
    expect(graveyard(game)).toContain(triumph);
    game.debugMove(triumph, "exile");
    settle(game);
    expect(library(game)).toEqual(before);
    expect(game.state.objects[triumph].zone).toBe("exile");
  });

  it("put into its owner's graveyard while another player controls it, it doesn't trigger", () => {
    const { game } = table();
    const triumph = spawn(game, "Triumph of Saint Katherine", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(triumph)]);
    expect(game.state.objects[triumph].controller).toBe(A);
    const before = [...library(game, B)];
    destroy(game, triumph, A);
    expect(graveyard(game, B)).toContain(triumph);
    expect(library(game, B)).toEqual(before);
    expect(library(game, A).includes(triumph)).toBe(false);
  });

  it("an extra card on top is part of the pile: it's somewhere in the top seven", () => {
    const { game } = table();
    const marked = toLibrary(game, "Lightning Bolt");
    const triumph = spawn(game, "Triumph of Saint Katherine");
    destroy(game, triumph);
    expect(library(game).indexOf(marked)).toBeLessThan(7);
    expect(library(game).indexOf(triumph)).toBeLessThan(7);
  });
});
