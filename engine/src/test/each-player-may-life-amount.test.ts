/**
 * An `each-player-may`'s life option in an amount of each asked player's own
 * — "any player may pay half their life, rounded up. If a player does,
 * counter Temporal Extortion" (rules 101.4, 107.1a, 119.4).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, life, pickModes, table, toHand, zone } from "./harness.js";

describe("Temporal Extortion", () => {
  it("is countered when an opponent pays half their own life, rounded up", () => {
    const { game, a, b } = table();
    game.state.players[A].life = 20;
    game.state.players[B].life = 13;
    lands(game, "Swamp", 4);
    const offers: string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offers.push(`a:${texts.join("|")}`);
      return [];
    };
    b.chooseModesFn = (_view, _min, _max, texts) => {
      offers.push(`b:${texts.join("|")}`);
      return [0];
    };
    const spell = toHand(game, "Temporal Extortion");
    cast(game, spell);
    // Each is offered their own half: 10 of 20, 7 of 13.
    expect(offers).toEqual(["a:Pay 10 life", "b:Pay 7 life"]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(6);
    expect(zone(game, spell)).toBe("graveyard");
    expect(game.state.extraTurns ?? []).toEqual([]);
  });

  it("resolves when nobody pays: an extra turn", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    pickModes(a);
    pickModes(b);
    cast(game, toHand(game, "Temporal Extortion"));
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(game.state.extraTurns).toEqual([A]);
  });

  it("still asks the players after one who paid, each for their own half", () => {
    const { game, a, b, c } = table({ players: 3 });
    game.state.players[A].life = 9;
    game.state.players[B].life = 1;
    game.state.players[C].life = 40;
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    pickModes(b);
    pickModes(c, 0);
    const spell = toHand(game, "Temporal Extortion");
    cast(game, spell);
    expect(life(game, A)).toBe(4);
    expect(life(game, B)).toBe(1);
    expect(life(game, C)).toBe(20);
    expect(zone(game, spell)).toBe("graveyard");
    expect(game.state.extraTurns ?? []).toEqual([]);
  });
});
