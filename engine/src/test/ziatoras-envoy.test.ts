/**
 * Ziatora's Envoy: on combat damage to a player, the top card of your library is played (a land —
 * `cast-now`'s `play` takes a land from the top of a library as well as from exile), cast free if
 * its mana value is at most the damage dealt, or else put into your hand.
 */
import { describe, expect, it } from "vitest";

import { A, attack, hand, spawn, table, toLibrary, zone } from "./harness.js";

describe("Ziatora's Envoy", () => {
  it("plays a land from the top of the library, using the land play", () => {
    const { game, a } = table();
    const envoy = spawn(game, "Ziatora's Envoy");
    const forest = toLibrary(game, "Forest");
    a.chooseCastNowFn = (_view, offer) => {
      const land = offer.lands?.find((l) => l.card === forest);
      return land === undefined ? null : { type: "play-land", player: A, card: forest };
    };
    const played = game.state.players[A].landsPlayedThisTurn;
    attack(game, a, [envoy]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.players[A].landsPlayedThisTurn).toBe(played + 1);
  });

  it("casts a spell with mana value up to the damage dealt, free", () => {
    const { game, a } = table();
    const envoy = spawn(game, "Ziatora's Envoy");
    const giant = toLibrary(game, "Hill Giant");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === giant);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: giant, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    attack(game, a, [envoy]);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("declined, the card goes to your hand", () => {
    const { game, a } = table();
    const envoy = spawn(game, "Ziatora's Envoy");
    const giant = toLibrary(game, "Hill Giant");
    a.chooseCastNowFn = () => null;
    const before = hand(game).length;
    attack(game, a, [envoy]);
    expect(zone(game, giant)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});
