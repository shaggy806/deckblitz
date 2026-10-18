/**
 * When `spell-resolved` and `ability-resolved` are emitted: as the spell or
 * ability leaves the stack (rule 608.2n), so after any decision its
 * resolution waits on — not as it starts resolving. A client plays the
 * entry's exit off that event: announced early, the entry dissolved while
 * still on the stack, then stayed drawn there while the next one resolved
 * under it (a bug report, 2026-10-18: Sarkhan, Soul Aflame's "you may" over
 * Ureni of the Unwritten's enters trigger).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, enter, lands, ref, settle, spawn, table, toHand, toLibrary } from "./harness.js";

const resolvedOf = (game: Game, id: ObjectId, from = 0): number =>
  game.events
    .slice(from)
    .filter((e) => (e.type === "ability-resolved" || e.type === "spell-resolved") && e.object === id).length;

describe("the resolved events", () => {
  it("come as an ability leaves the stack, after the decision it waited on", () => {
    const { game } = table();
    spawn(game, "Sarkhan, Soul Aflame");
    toLibrary(game, "Shivan Dragon");
    const from = game.events.length;
    enter(game, "Ureni of the Unwritten", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    const [ureni, sarkhan] = game.state.zones.shared.stack;
    expect(game.state.objects[sarkhan].sourceObjectId).toBe(game.state.decisionSource?.object);
    // Sarkhan's trigger is asking its "you may": still on the stack, and
    // not resolved yet.
    expect(resolvedOf(game, sarkhan, from)).toBe(0);

    settle(game);
    expect(resolvedOf(game, sarkhan, from)).toBe(1);
    expect(resolvedOf(game, ureni, from)).toBe(1);
    // In the order they left.
    const order = game.events
      .slice(from)
      .filter((e) => e.type === "ability-resolved")
      .map((e) => (e as { object: ObjectId }).object);
    expect(order).toEqual([sarkhan, ureni]);
  });

  it("come as an instant or sorcery leaves the stack, after the decision it waited on", () => {
    const { game } = table();
    spawn(game, "Raging Goblin", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const edict = toHand(game, "Diabolic Edict");
    const from = game.events.length;
    cast(game, edict, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "sacrifice");
    expect(game.state.objects[edict].zone).toBe("stack");
    expect(resolvedOf(game, edict, from)).toBe(0);

    settle(game);
    expect(resolvedOf(game, edict, from)).toBe(1);
    const at = game.events.findIndex((e, i) => i >= from && e.type === "spell-resolved");
    const sacrificed = game.events.findIndex((e, i) => i >= from && e.type === "permanent-left-battlefield");
    expect(sacrificed).toBeGreaterThan(-1);
    expect(at).toBeGreaterThan(sacrificed);
  });
});
