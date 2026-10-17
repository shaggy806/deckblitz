/**
 * Celebration (Wilds of Eldraine) — an ability word, so no rules meaning of
 * its own (rule 207.2c): "if / as long as two or more nonland permanents
 * entered the battlefield under your control this turn" is
 * `CELEBRATION_CONDITION`, a `turn-history` `entered` condition with
 * `atLeast: 2` and `notTypes: ["land"]`. The rulings: the permanents "don't
 * need to remain on the battlefield or under your control" — it checks past
 * events, not the current game state. Each entry is recorded against its
 * controller as it entered and read as it entered; a token stack entering is
 * every token in it; a permanent that left and came back is a new object
 * (rule 400.7), so it counts again.
 */
import { describe, expect, it } from "vitest";

import { CELEBRATION_CONDITION } from "../cards/helpers.js";
import { staticConditionMet } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, destroy, enter, nextTurn, pt, ref, settle, spawn, subtypes, table, zone } from "./harness.js";

/** Whether celebration holds for `source`'s controller. */
const celebrating = (game: Game, source: ObjectId): boolean =>
  staticConditionMet(game.state, game.registry, game.state.objects[source], CELEBRATION_CONDITION);

const bounce = (game: Game, id: ObjectId, by: PlayerId = A): void => {
  game.debugApplyEffect(by, { kind: "return-to-hand", target: 0 }, [ref(id)]);
  settle(game);
};

describe("celebration — two or more nonland permanents entered under your control this turn", () => {
  it("needs two: one isn't enough, and a land never counts", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    // `spawn` announces nothing: the source itself didn't "enter" this turn.
    expect(celebrating(game, source)).toBe(false);
    enter(game, "Sol Ring");
    expect(celebrating(game, source)).toBe(false);
    enter(game, "Wastes");
    enter(game, "Forest");
    expect(celebrating(game, source)).toBe(false);
    // A land creature is a land: not a nonland permanent.
    enter(game, "Dryad Arbor");
    expect(celebrating(game, source)).toBe(false);
    enter(game, "Hill Giant");
    expect(celebrating(game, source)).toBe(true);
  });

  it("counts permanents that have left the battlefield or changed control since (the rulings)", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    const ring = enter(game, "Sol Ring");
    const bears = enter(game, "Grizzly Bears");
    bounce(game, ring);
    expect(zone(game, ring)).toBe("hand");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].controller).toBe(B);
    expect(celebrating(game, source)).toBe(true);
  });

  it("is about what entered under your control: an opponent's entry, or one you took after it entered, doesn't count", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Hill Giant", B);
    enter(game, "Sol Ring");
    const theirs = enter(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(theirs)]);
    settle(game);
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(celebrating(game, mine)).toBe(false);
    // Bob's side: only one entered under his control.
    expect(celebrating(game, bobs)).toBe(false);
    enter(game, "Sol Ring", B);
    expect(celebrating(game, bobs)).toBe(true);
    expect(celebrating(game, mine)).toBe(false);
  });

  it("counts a token stack entering at once as every token in it", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    // Enough at once to be minted as one stack (`STACK_ORIGIN_THRESHOLD`):
    // one object, one entry.
    game.debugApplyEffect(A, { kind: "create-token", token: "Servo Token", count: 8 });
    settle(game);
    const servos = game.battlefield.filter((id) => game.state.objects[id].cardName === "Servo Token");
    expect(servos).toHaveLength(1);
    expect(game.state.objects[servos[0]].stackCount).toBe(8);
    expect(celebrating(game, source)).toBe(true);
  });

  it("counts one permanent that left and came back twice: two objects entered (rule 400.7)", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    const ring = enter(game, "Sol Ring");
    bounce(game, ring);
    expect(celebrating(game, source)).toBe(false);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(ring)]);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(celebrating(game, source)).toBe(true);
  });

  it("is this turn's: forgotten as the next turn begins, and counts entries on an opponent's turn during it", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    enter(game, "Sol Ring");
    enter(game, "Hill Giant");
    expect(celebrating(game, source)).toBe(true);
    nextTurn(game);
    expect(celebrating(game, source)).toBe(false);
    // Bob's turn: two of Alice's enter (flash, say) — it's "this turn" for her too.
    enter(game, "Sol Ring");
    enter(game, "Hill Giant");
    expect(celebrating(game, source)).toBe(true);
    nextTurn(game);
    expect(celebrating(game, source)).toBe(false);
  });

  // The intervening ifs (rule 603.4) — Pests of Honor, Ash, Lady of
  // Laughter — are tested card by card in `set-woe-batch-1f.test.ts`.
  it("switches a static on and off: Goddric is a 4/4 Dragon only while it holds", () => {
    const { game } = table();
    const goddric = spawn(game, "Goddric, Cloaked Reveler");
    expect(pt(game, goddric)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Sol Ring");
    expect(pt(game, goddric)).toEqual({ power: 3, toughness: 3 });
    const giant = enter(game, "Hill Giant");
    expect(pt(game, goddric)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, goddric)).toEqual(["Dragon"]);
    destroy(game, giant);
    expect(pt(game, goddric)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(pt(game, goddric)).toEqual({ power: 3, toughness: 3 });
  });
});
