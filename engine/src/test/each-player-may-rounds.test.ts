/**
 * `each-player-may`'s `rounds` — Rottenmouth Viper: "for each blight counter
 * on it, each opponent loses 4 life unless that player sacrifices a nonland
 * permanent of their choice or discards a card": every choice made first,
 * none twice, then all at once.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, enter, hand, life, pickModes, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Rottenmouth Viper", () => {
  it("two blight counters: two different cards discarded", () => {
    const seats = table();
    const { game } = seats;
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickModes(seats.b, 0);
    const viper = enter(game, "Rottenmouth Viper", A, { settle: false });
    game.state.objects[viper].counters = { blight: 1 };
    settle(game);
    expect(counters(game, viper, "blight")).toBe(2);
    expect(hand(game, B).length).toBe(before - 2);
    expect(life(game, B)).toBe(20);
  });

  it("a choice that can't be made again is a 'neither': 4 life each time", () => {
    const seats = table({ openingHandSize: 0 });
    const { game } = seats;
    const card = toHand(game, "Grizzly Bears", B);
    const altar = spawn(game, "Ornithopter", B);
    // Sacrifice when offered (index 0), else discard.
    seats.b.chooseModesFn = (_view, _min, _max, options) => (options.length > 0 ? [0] : []);
    const viper = enter(game, "Rottenmouth Viper", A, { settle: false });
    game.state.objects[viper].counters = { blight: 2 };
    settle(game);
    // Three rounds. Round 1 sacrificed the Ornithopter; round 2 discarded the card; round 3 had nothing.
    expect(zone(game, altar)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("neither, every time", () => {
    const seats = table();
    const { game } = seats;
    pickModes(seats.b);
    const viper = enter(game, "Rottenmouth Viper", A, { settle: false });
    game.state.objects[viper].counters = { blight: 1 };
    settle(game);
    expect(life(game, B)).toBe(12);
  });
});
