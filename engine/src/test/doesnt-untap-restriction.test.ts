/**
 * "Doesn't untap during its controller's untap step" on what a static
 * reaches (rule 502.3 — the `"doesnt-untap"` restriction): an Aura's
 * enchanted permanent (Tractor Beam) or every permanent a filter matches
 * (Back to Basics).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("doesn't untap during its controller's untap step", () => {
  it("Tractor Beam: the stolen creature is tapped and stays tapped through its new controller's untap step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Tractor Beam"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    expect(game.state.turn.number).toBe(3);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Back to Basics: nonbasic lands stay tapped, basics untap", () => {
    const { game } = table();
    spawn(game, "Back to Basics", B);
    const [forest] = lands(game, "Forest", 1);
    const temple = spawn(game, "Temple Garden", A, { tapped: true });
    game.state.objects[forest].tapped = true;
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(game.state.objects[temple].tapped).toBe(true);
  });
});
