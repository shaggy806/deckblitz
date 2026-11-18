/**
 * "Reverse the game's turn order" (Aeon Engine, the `reverse-turn-order`
 * effect): the turn order runs the other way — the next turn, priority, and
 * everything else done in turn order (rule 101.4) — until reversed again,
 * when it's the first order back (its rulings). The seating stays: "the
 * player to your left" is who it was (`seatingOf`). During an extra turn, the
 * next turn in the rotation goes on from the last player whose turn wasn't
 * an extra one; at two players nothing changes.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf, seatingOf } from "../state.js";
import { cardSource, legalTargets } from "../targeting.js";
import { A, B, C, D, activate, cast, enter, lands, nextTurn, spawn, table, toHand } from "./harness.js";

/** An untapped Aeon Engine of `player`'s. */
function engine(game: Game, player = A): ObjectId {
  const id = spawn(game, "Aeon Engine", player);
  game.state.objects[id].tapped = false;
  return id;
}

/** The players whose turns come next, `n` of them. */
function nextTurns(game: Game, n: number): string[] {
  const seen: string[] = [];
  for (let i = 0; i < n; i += 1) {
    nextTurn(game);
    seen.push(activePlayerOf(game.state));
  }
  return seen;
}

describe("Aeon Engine", () => {
  it("enters tapped", () => {
    const { game } = table();
    const id = enter(game, "Aeon Engine");
    expect(game.state.objects[id].tapped).toBe(true);
  });

  it("exiled as a cost, play goes the other way round the table", () => {
    const { game } = table({ players: 4 });
    const id = engine(game);
    activate(game, id, 0);
    expect(game.state.objects[id].zone).toBe("exile");
    expect(game.state.turnOrder).toEqual([D, C, B, A]);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(nextTurns(game, 4)).toEqual([D, C, B, A]);
  });

  it("priority goes the new way too", () => {
    const { game } = table({ players: 4 });
    activate(game, engine(game), 0);
    const before = game.eventsOfType("priority-received").length;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    const after = game.eventsOfType("priority-received").slice(before).map((e) => e.player);
    expect(after.filter((p) => p !== A).slice(0, 3)).toEqual([D, C, B]);
  });

  it("reversed again, it's the first order back", () => {
    const { game } = table({ players: 4 });
    activate(game, engine(game), 0);
    activate(game, engine(game), 0);
    expect(game.state.turnOrder).toEqual([A, B, C, D]);
    expect(nextTurns(game, 2)).toEqual([B, C]);
  });

  it("the player to your left is still who sits there", () => {
    const { game } = table({ players: 4 });
    activate(game, engine(game), 0);
    expect(seatingOf(game.state)).toEqual([A, B, C, D]);
    spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const daves = spawn(game, "Grizzly Bears", D);
    const card = toHand(game, "Barroom Brawl");
    const def = game.registry.get("Barroom Brawl");
    const offered = legalTargets(game.state, game.registry, def.targets[1], A, cardSource(def, card)).map((t) =>
      t.kind === "object" ? t.object : t.player,
    );
    expect(offered).toContain(bobs);
    expect(offered).not.toContain(daves);
  });

  it("during an extra turn, the rotation goes on from the last turn that wasn't one", () => {
    const { game } = table({ players: 4 });
    // Bob's turn, then an extra turn for Carol.
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    game.state.extraTurns.push(C);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(C);
    game.debugApplyEffect(C, { kind: "reverse-turn-order" }, []);
    // From Bob's seat the other way: Alice, then Dave.
    expect(nextTurns(game, 2)).toEqual([A, D]);
  });

  it("at two players, nothing changes", () => {
    const { game } = table({ players: 2 });
    activate(game, engine(game), 0);
    expect(nextTurns(game, 3)).toEqual([B, A, B]);
  });
});
