/**
 * Counters put as a cost go through counter replacements, unless one is worded "if an **effect**
 * would put" (Doubling Season): Vizier of Remedies leaves Devoted Druid's untap costing no -1/-1
 * counter, so it untaps again and again; Doubling Season doesn't double the cost's counter. And
 * Vizier's "minus one" reaches persist's return.
 */
import { describe, expect, it } from "vitest";

import { activate, counters, destroy, settle, spawn, table, zone } from "./harness.js";

describe("counters put as a cost meet counter replacements", () => {
  it("Devoted Druid alone takes a -1/-1 counter for its untap", () => {
    const { game } = table();
    const druid = spawn(game, "Devoted Druid", undefined, { tapped: true });
    activate(game, druid, 1);
    expect(counters(game, druid, "-1/-1")).toBe(1);
    expect(game.state.objects[druid].tapped).toBe(false);
  });

  it("with Vizier of Remedies the untap puts no counter, over and over", () => {
    const { game } = table();
    spawn(game, "Vizier of Remedies");
    const druid = spawn(game, "Devoted Druid");
    for (let i = 0; i < 5; i += 1) {
      activate(game, druid, 0);
      activate(game, druid, 1);
    }
    expect(counters(game, druid, "-1/-1")).toBe(0);
    expect(zone(game, druid)).toBe("battlefield");
  });

  it("Doubling Season doesn't double a cost's counter", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    const druid = spawn(game, "Devoted Druid", undefined, { tapped: true });
    activate(game, druid, 1);
    expect(counters(game, druid, "-1/-1")).toBe(1);
  });

  it("Vizier of Remedies: a persisting Kitchen Finks returns with no -1/-1 counter", () => {
    const { game } = table();
    spawn(game, "Vizier of Remedies");
    const finks = spawn(game, "Kitchen Finks");
    destroy(game, finks);
    settle(game);
    expect(zone(game, finks)).toBe("battlefield");
    expect(counters(game, finks, "-1/-1")).toBe(0);
  });
});
