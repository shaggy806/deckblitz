/**
 * The live-game rules bugs taken off the backlog on 2026-10-16:
 *
 * - `canDispatch` judged only that an activated ability's target slots had
 *   *some* legal option, not that the chosen targets were legal, so a client
 *   or bot could be told an activation was fine that `dispatch` refused.
 * - Adeline, Resplendent Cathar made her Humans one opponent at a time, so a
 *   "whenever one or more tokens enter" trigger saw each as its own event.
 * - Archfiend of Depravity's "up to two" (`sacrifice-all-but`) — in
 *   `archfiend-deep-analysis.test.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { A, attack, hand, ref, spawn, table } from "./harness.js";

describe("canDispatch judges an activation's chosen targets", () => {
  it("refuses Hotfoot Gnome's 'another target creature' aimed at itself", () => {
    const { game } = table();
    const gnome = spawn(game, "Hotfoot Gnome");
    const bears = spawn(game, "Grizzly Bears");
    const at = (target: ObjectId) =>
      game.canDispatch({ type: "activate-ability", player: A, source: gnome, abilityIndex: 0, targets: [ref(target)] });
    expect(at(gnome)).not.toBeNull();
    expect(at(bears)).toBeNull();
  });
});

describe("Adeline, Resplendent Cathar", () => {
  it("makes her Humans as one event: 'one or more tokens enter' triggers once", () => {
    const { game, a } = table({ players: 4 });
    const adeline = spawn(game, "Adeline, Resplendent Cathar");
    spawn(game, "Marneus Calgar");
    const before = hand(game).length;
    attack(game, a, [adeline]);
    const humans = game.state.zones.shared.battlefield
      .map((id) => game.state.objects[id])
      .filter((o) => o.controller === A && o.cardName === "Human Token")
      .reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(humans).toBe(3);
    expect(hand(game)).toHaveLength(before + 1);
  });
});
