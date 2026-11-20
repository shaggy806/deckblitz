/**
 * A trigger's target chosen by another player, its filter read from that
 * chooser's side (`targetsChosenBy` with `controlledBy: "chooser-opponent"`,
 * and the stack object's `otherChooser` as it resolves) — Necrotic Plague's
 * "its controller chooses target creature one of their opponents controls",
 * the dead creature's controller as it last existed.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, destroy, lands, nextTurn, spawn, table, toHand, watchTargets, zone } from "./harness.js";
import { activePlayerOf } from "../state.js";

describe("Necrotic Plague", () => {
  it("has the dead creature's controller choose among their opponents' creatures, and returns attached to it", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Swamp", 4);
    const plague = toHand(game, "Necrotic Plague");
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsOther = spawn(game, "Hill Giant", B);
    const alices = spawn(game, "Grizzly Bears", A);
    const carols = spawn(game, "Hill Giant", C);
    cast(game, plague, { targets: [{ kind: "object", object: bobs }] });
    expect(game.state.objects[plague].attachedTo).toBe(bobs);
    const seen = watchTargets(b, () => [carols]);
    destroy(game, bobs, A);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([alices, carols].sort());
    expect(seen.offered[0]).not.toContain(bobsOther);
    expect(zone(game, plague)).toBe("battlefield");
    expect(game.state.objects[plague].attachedTo).toBe(carols);
    expect(game.state.objects[plague].controller).toBe(A);
  });

  it("can be put on its own controller's creature by an opponent's choice", () => {
    const { game, b } = table({ players: 2 });
    lands(game, "Swamp", 4);
    const plague = toHand(game, "Necrotic Plague");
    const bobs = spawn(game, "Grizzly Bears", B);
    const alices = spawn(game, "Hill Giant", A);
    spawn(game, "Grizzly Bears", B);
    cast(game, plague, { targets: [{ kind: "object", object: bobs }] });
    watchTargets(b, () => [alices]);
    destroy(game, bobs, A);
    expect(game.state.objects[plague].attachedTo).toBe(alices);
  });

  it("makes the enchanted creature's controller sacrifice it in their upkeep", () => {
    const { game } = table({ players: 2 });
    lands(game, "Swamp", 4);
    const plague = toHand(game, "Necrotic Plague");
    const bobs = spawn(game, "Grizzly Bears", B);
    cast(game, plague, { targets: [{ kind: "object", object: bobs }] });
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(zone(game, bobs)).toBe("graveyard");
    // Nothing of alice's to attach to: it stays in the graveyard.
    expect(zone(game, plague)).toBe("graveyard");
  });
});
