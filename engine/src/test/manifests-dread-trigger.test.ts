/**
 * "Whenever you manifest dread" (rule 701.62b) — the `manifests-dread` trigger
 * event, announced once the whole process is done, even when some or all of
 * it was impossible, with the cards it put into a graveyard as its batch —
 * Paranormal Analyst's "put a card you put into your graveyard this way into
 * your hand".
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";

const triggersOf = (game: Game, source: ObjectId): number =>
  game.state.eventLog.filter((e) => e.type === "ability-triggered" && e.source === source).length;

describe("whenever you manifest dread — Paranormal Analyst", () => {
  it("puts the card manifest dread put into your graveyard into your hand", () => {
    const { game, a } = table();
    const analyst = spawn(game, "Paranormal Analyst");
    const bolt = toLibrary(game, "Lightning Bolt");
    const giant = toLibrary(game, "Hill Giant");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      if (eligible.includes(giant)) return [giant];
      offered = eligible;
      return [eligible[0]];
    };
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Break Down the Door"), { modes: [2] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown?.kind).toBe("manifest");
    expect(triggersOf(game, analyst)).toBe(1);
    expect(offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(hand(game)).toContain(bolt);
  });

  it("triggers after the choice is made, once per manifest dread", () => {
    const { game, a } = table();
    const analyst = spawn(game, "Paranormal Analyst");
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    const before = graveyard(game).length;
    game.debugApplyEffect(A, { kind: "manifest-dread", count: 2 });
    settle(game);
    // Two manifest dreads, two triggers: each takes back its own card.
    expect(triggersOf(game, analyst)).toBe(2);
    expect(graveyard(game).length).toBe(before);
    expect(hand(game).length).toBeGreaterThanOrEqual(2);
  });

  it("still triggers with an empty library, and puts nothing into the hand", () => {
    const { game } = table();
    const analyst = spawn(game, "Paranormal Analyst");
    for (const id of [...game.state.zones.perPlayer[A].library]) game.debugMove(id, "exile");
    const held = hand(game).length;
    game.debugApplyEffect(A, { kind: "manifest-dread" });
    settle(game);
    expect(triggersOf(game, analyst)).toBe(1);
    expect(hand(game).length).toBe(held);
  });

  it("a card that left the graveyard before it resolves isn't put into the hand", () => {
    const { game, a } = table();
    spawn(game, "Paranormal Analyst");
    const bolt = toLibrary(game, "Lightning Bolt");
    const giant = toLibrary(game, "Hill Giant");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(giant) ? [giant] : [eligible[0]]);
    game.debugApplyEffect(A, { kind: "manifest-dread" });
    // The choice made, the trigger waits on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    expect(zone(game, bolt)).toBe("graveyard");
    // Before the trigger resolves, the card is exiled and comes back: a new
    // object (rule 400.7), not the one put there this way.
    game.debugMove(bolt, "exile");
    game.debugMove(bolt, "graveyard");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("only its controller's manifest dread", () => {
    const { game, b } = table();
    const analyst = spawn(game, "Paranormal Analyst");
    b.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    game.debugApplyEffect(B, { kind: "manifest-dread" });
    settle(game);
    expect(triggersOf(game, analyst)).toBe(0);
  });
});
