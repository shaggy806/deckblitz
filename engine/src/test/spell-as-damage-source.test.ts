/**
 * "Whenever a spell you control deals damage": a `deals-damage` trigger whose
 * source is a spell (`isSpell`), on the stack as it deals the damage — not a
 * permanent's ability, nor a permanent a spell became (Flame Channeler's
 * rulings). Flame Channeler transforms; Embodiment of Flame gets a flame
 * counter, and removes one to exile the top card of its library, playable
 * this turn.
 */
import { describe, expect, it } from "vitest";
import { B, activate, cast, counters, lands, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Flame Channeler", () => {
  it("transforms when a spell its controller controls deals damage", () => {
    const { game } = table();
    const channeler = spawn(game, "Flame Channeler");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    settle(game);
    expect(game.state.objects[channeler].face).toBe(1);
  });

  it("doesn't transform for damage a permanent's ability deals", () => {
    const { game } = table();
    const channeler = spawn(game, "Flame Channeler");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    settle(game);
    expect(game.state.players[B].life).toBe(19);
    expect(game.state.objects[channeler].face ?? 0).toBe(0);
  });
});

describe("Embodiment of Flame", () => {
  it("gets a flame counter for each spell's damage, and spends one to exile the top card, playable this turn", () => {
    const { game } = table();
    const channeler = spawn(game, "Flame Channeler");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    settle(game);
    expect(game.state.objects[channeler].face).toBe(1);
    expect(counters(game, channeler, "flame")).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    settle(game);
    expect(counters(game, channeler, "flame")).toBe(1);
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, channeler, 0);
    settle(game);
    expect(zone(game, top)).toBe("exile");
    expect(counters(game, channeler, "flame")).toBe(0);
  });
});
