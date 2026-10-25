/**
 * Parley (an ability word): "each player reveals the top card of their
 * library. For each nonland card revealed this way, … Then each player draws
 * a card" — `reveal-top` with `who` and the `{ thisWay: "revealed" }` amount,
 * through the `parley` helper.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pt,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
} from "./harness.js";

describe("parley", () => {
  it("counts the nonland cards every player revealed, then each draws the card revealed", () => {
    const { game } = table({ players: 4 });
    const tops = [toLibrary(game, "Grizzly Bears", A), toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Grizzly Bears", D)];
    const forest = toLibrary(game, "Forest", C);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Selvala's Charge"));
    expect(tokensNamed(game, "Elephant Token", A)).toBe(3);
    expect(hand(game, A)).toContain(tops[0]);
    expect(hand(game, B)).toContain(tops[1]);
    expect(hand(game, D)).toContain(tops[2]);
    expect(hand(game, C)).toContain(forest);
  });

  it("a player with an empty library reveals nothing", () => {
    const { game } = table();
    game.state.zones.perPlayer[B].library.length = 0;
    toLibrary(game, "Grizzly Bears", A);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Rousing of Souls"));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("a land revealed counts for Phabine's Citizens, a nonland for its pump", () => {
    const { game } = table();
    const phabine = spawn(game, "Phabine, Boss's Confidant");
    toLibrary(game, "Grizzly Bears", A); // the deck below is Wastes: bob reveals a land
    toStep(game, "declare-attackers");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
    expect(pt(game, phabine)).toEqual({ power: 4, toughness: 7 });
  });

  it("Selvala's Enforcer gets a counter per nonland card", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Grizzly Bears", B);
    const enforcer = enter(game, "Selvala's Enforcer");
    expect(counters(game, enforcer)).toBe(2);
  });

  it("Woodvine Elemental pumps every attacker", () => {
    const { game, a } = table();
    const woodvine = spawn(game, "Woodvine Elemental");
    const bears = spawn(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [woodvine, bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, woodvine)).toEqual({ power: 5, toughness: 5 });
  });

  it("Selvala adds {G} and gains 1 life per nonland card, on the stack", () => {
    const { game } = table();
    const selvala = spawn(game, "Selvala, Explorer Returned");
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Grizzly Bears", B);
    activate(game, selvala);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "G")).toHaveLength(2);
    expect(life(game, A)).toBe(22);
  });
});
