/**
 * "An opponent may gain control of a creature you control of their choice
 * for as long as this creature remains on the battlefield" (Infernal
 * Denizen): `choose-opponent` (you choose which, as it resolves), then a
 * `choose-permanents` with that player as `chooser`, `controlledByPlayer:
 * "you"`, `min: 0` (they may decline — the ruling), whose `gain-control` is
 * theirs with `whileSource`. "Sacrifice two Swamps. If you can't" sacrifices
 * as many as there are (rule 609.3) and reads fewer than two.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, controller, destroy, lands, nextTurn, pickModes, pickPermanents, ref, spawn, table, zone } from "./harness.js";

describe("Infernal Denizen", () => {
  it("sacrifices two Swamps at your upkeep and nothing else happens", () => {
    const { game } = table();
    const denizen = spawn(game, "Infernal Denizen");
    const swamps = lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    expect(swamps.map((s) => zone(game, s))).toEqual(["graveyard", "graveyard"]);
    expect(game.state.objects[denizen].tapped).toBe(false);
    expect(controller(game, bears)).toBe(A);
  });

  it("with one Swamp, sacrifices it, taps, and the opponent takes a creature while the Denizen remains", () => {
    const { game, b } = table();
    const denizen = spawn(game, "Infernal Denizen");
    const [swamp] = lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(b, bears);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, swamp)).toBe("graveyard");
    expect(game.state.objects[denizen].tapped).toBe(true);
    expect(seen.offered).toContain(denizen);
    expect(seen.offered).toContain(bears);
    expect(controller(game, bears)).toBe(B);
    destroy(game, denizen);
    expect(controller(game, bears)).toBe(A);
  });

  it("the opponent may take nothing", () => {
    const { game, b } = table();
    const denizen = spawn(game, "Infernal Denizen");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(b);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[denizen].tapped).toBe(true);
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, denizen)).toBe(A);
  });

  it("you choose which opponent, and only they choose", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Infernal Denizen");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    const offeredB = pickPermanents(b, bears);
    pickPermanents(c, bears);
    // Round the table back to alice's upkeep.
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bears)).toBe(C);
    expect(offeredB.offered).toEqual([]);
  });

  it("{T}: gains control of target creature for as long as it remains on the battlefield", () => {
    const { game } = table();
    const denizen = spawn(game, "Infernal Denizen");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, denizen, 0, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    destroy(game, denizen);
    expect(controller(game, giant)).toBe(B);
  });
});
