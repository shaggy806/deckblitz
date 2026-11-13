/**
 * `attacks-player`'s `orTheirPlaneswalkers` — Frontier Warmonger: "whenever
 * one or more creatures attack one of your opponents or a planeswalker they
 * control, those creatures gain menace until end of turn".
 */
import { describe, expect, it } from "vitest";

import { B, attack, keywords, spawn, table, toStep } from "./harness.js";

describe("Frontier Warmonger", () => {
  it("creatures attacking an opponent's planeswalker gain menace too", () => {
    const seats = table();
    const { game } = seats;
    spawn(game, "Frontier Warmonger");
    const walker = spawn(game, "Jace Beleren", B);
    const atWalker = spawn(game, "Grizzly Bears");
    const atPlayer = spawn(game, "Grizzly Bears");
    seats.a.declareAttackersFn = () => [
      { attacker: atWalker, defender: walker },
      { attacker: atPlayer, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(keywords(game, atWalker).has("menace")).toBe(true);
    expect(keywords(game, atPlayer).has("menace")).toBe(true);
  });

  it("an attack on the planeswalker alone still triggers it", () => {
    const seats = table();
    const { game } = seats;
    spawn(game, "Frontier Warmonger");
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, seats.a, [bears], walker);
    expect(keywords(game, bears).has("menace")).toBe(true);
  });

  it("Frenzied Gorespawn's plain wording still ignores a planeswalker attack", () => {
    const seats = table();
    const { game } = seats;
    spawn(game, "Frenzied Gorespawn");
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, seats.a, [bears], walker);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});
