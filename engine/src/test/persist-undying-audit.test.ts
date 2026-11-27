import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { destroy, settle, spawn, table } from "./harness.js";

/**
 * A rules audit (2026-11-26): persist and undying on one creature (rules
 * 702.79a, 702.93a) — both trigger as it dies without counters, the first
 * to resolve returns it, and the second finds a new object and does nothing
 * (400.7).
 */
const finks = (game: Game) => game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Kitchen Finks");

describe("persist and undying together, audited", () => {
  it("Kitchen Finks with Mikaeus's undying comes back once, with one counter", () => {
    const { game } = table();
    spawn(game, "Mikaeus, the Unhallowed");
    const f = spawn(game, "Kitchen Finks");
    destroy(game, f);
    settle(game);
    const back = finks(game);
    expect(back).toHaveLength(1);
    const counters = game.state.objects[back[0]].counters;
    expect((counters["+1/+1"] ?? 0) + (counters["-1/-1"] ?? 0)).toBe(1);
  });

  it("dying again with that counter, the other one brings it back", () => {
    const { game } = table();
    spawn(game, "Mikaeus, the Unhallowed");
    const f = spawn(game, "Kitchen Finks");
    destroy(game, f);
    settle(game);
    const first = { ...game.state.objects[finks(game)[0]].counters };
    destroy(game, finks(game)[0]);
    settle(game);
    const back = finks(game);
    expect(back).toHaveLength(1);
    const now = game.state.objects[back[0]].counters;
    if ((first["+1/+1"] ?? 0) === 1) expect(now["-1/-1"]).toBe(1);
    else expect(now["+1/+1"]).toBe(1);
  });
});
