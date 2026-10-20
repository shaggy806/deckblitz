/**
 * The "exile … until this leaves the battlefield" cards that waited on the one-shot return of
 * rule 610.3 (`untilSourceLeaves`, built 2026-10-20): Static Net, Leyline Binding, Cast Out,
 * In the Trenches, Temporary Lockdown (`exile-all`'s `untilSourceLeaves`), Constricting Sliver and
 * Celebrate the Mountain-king.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  zone,
} from "./harness.js";

describe("the 610.3 O-Ring cards", () => {
  it("Static Net exiles, gains 2 life with a tapped Powerstone, and returns the card as it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const net = enter(game, "Static Net");
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(22);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    destroy(game, net);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Leyline Binding costs {1} less for each basic land type (flash, mana value 6)", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    // Three basic land types: {5}{W} becomes {2}{W}, paid by the three lands.
    const binding = toHand(game, "Leyline Binding");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, binding);
    expect(zone(game, binding)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
  });

  it("Cast Out cycles for {W}", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const out = toHand(game, "Cast Out");
    const before = hand(game).length;
    game.dispatch({ type: "cycle", player: A, card: out });
    settle(game);
    expect(zone(game, out)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("In the Trenches: +1/+1, and its exile activates only once", () => {
    const { game } = table();
    lands(game, "Plains", 12);
    const trenches = spawn(game, "In the Trenches");
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    activate(game, trenches, 0, { targets: [ref(first)] });
    expect(zone(game, first)).toBe("exile");
    expect(() => activate(game, trenches, 0, { targets: [ref(second)] })).toThrow(/refused/);
    destroy(game, trenches);
    settle(game);
    expect(zone(game, first)).toBe("battlefield");
  });

  it("Temporary Lockdown exiles every nonland permanent with mana value 2 or less, and returns them together", () => {
    const { game } = table();
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const forest = spawn(game, "Forest", B);
    const lockdown = enter(game, "Temporary Lockdown");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    destroy(game, lockdown);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("Temporary Lockdown gone before its trigger resolves exiles nothing (610.3a)", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const lockdown = enter(game, "Temporary Lockdown", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(lockdown)]);
    settle(game);
    expect(zone(game, lockdown)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("Constricting Sliver: each Sliver's own exile, returned as that Sliver leaves", () => {
    const { game, a } = table();
    const constricting = spawn(game, "Constricting Sliver");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const other = enter(game, "Galerider Sliver");
    expect(zone(game, bears)).toBe("exile");
    // The granting Sliver leaving changes nothing: the ability was the other's.
    destroy(game, constricting);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    destroy(game, other);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Celebrate the Mountain-king: up to one per opponent, then recruit", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    const discard = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [discard];
    pickTargets(a, bobs, carols);
    const celebrate = enter(game, "Celebrate the Mountain-king");
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    // Recruit: draw, then discard the Bears — nonland, so a Human Soldier.
    expect(zone(game, discard)).toBe("graveyard");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    destroy(game, celebrate);
    settle(game);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(zone(game, carols)).toBe("battlefield");
  });
});
