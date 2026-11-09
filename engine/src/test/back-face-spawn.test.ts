/** A transforming card's back face spawned by name for a test board: its
 * triggered abilities are its own (Final Iteration, Docent of Perfection's
 * back). */
import { describe, expect, it } from "vitest";

import { A, cast, lands, spawn, table, toHand } from "./harness.js";

describe("a back face spawned by name", () => {
  it("has its own triggered ability", () => {
    const { game } = table();
    spawn(game, "Final Iteration");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    const tokens = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].isToken === true && game.state.objects[id].controller === A,
    );
    expect(tokens).toHaveLength(1);
  });
});
