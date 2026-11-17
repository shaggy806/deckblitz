/**
 * "Each opponent reveals the top card of their library. If any of those cards
 * shares a card type with that spell, …" (Gandalf, Westward Voyager): a
 * `reveal-top` over each opponent (rule 701.20a), its `then` counting the
 * revealed cards that share a card type with the spell that triggered it —
 * `{ thisWay: "revealed", filter: { sharesCardTypeWith: "trigger-object" } }`
 * — against 1. One copy however many share (the rulings), made on the stack
 * and not cast (rule 707.10); a copy of a permanent spell becomes a token
 * (rule 608.3f).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, lands, life, named, pickTargets, spawn, table, toHand, toLibrary } from "./harness.js";

describe("Gandalf, Westward Voyager", () => {
  it("a revealed creature card shares a type with a creature spell: the copy becomes a token, and each opponent draws", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Gandalf, Westward Voyager", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Forest", 5);
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    cast(game, toHand(game, "Thragtusk"));
    const tusks = named(game, "Thragtusk", A).filter((id) => game.state.objects[id].zone === "battlefield");
    expect(tusks).toHaveLength(2);
    expect(tusks.filter((id) => game.state.objects[id].isToken === true)).toHaveLength(1);
    expect(life(game, A)).toBe(30);
    // Each opponent draws — Bob the revealed Bears — and Alice doesn't.
    expect(hand(game, B)).toContain(bears);
    expect(hand(game, B).length).toBe(before.b + 1);
    expect(hand(game, C).length).toBe(before.c + 1);
    expect(hand(game, A).length).toBe(before.a);
  });

  it("nothing revealed shares a type: no copy, and you draw a card", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Gandalf, Westward Voyager", A);
    // Both opponents' libraries are Wastes: lands, which a creature spell doesn't share.
    lands(game, "Forest", 5);
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    cast(game, toHand(game, "Thragtusk"));
    const tusks = named(game, "Thragtusk", A).filter((id) => game.state.objects[id].zone === "battlefield");
    expect(tusks).toHaveLength(1);
    expect(life(game, A)).toBe(25);
    expect(hand(game, A).length).toBe(before.a + 1);
    expect(hand(game, B).length).toBe(before.b);
    expect(hand(game, C).length).toBe(before.c);
  });

  it("any one of the cards is enough, and the copy may take a new target", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Gandalf, Westward Voyager", A);
    toLibrary(game, "Lightning Bolt", B); // an instant: no type in common with a sorcery
    toLibrary(game, "Divination", C); // a sorcery
    lands(game, "Mountain", 5);
    pickTargets(a, C);
    cast(game, toHand(game, "Lava Axe"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(15);
  });

  it("a spell of mana value 4 or less doesn't trigger it", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Gandalf, Westward Voyager", A);
    toLibrary(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield")).toHaveLength(1);
    expect(hand(game, A).length).toBe(before.a);
    expect(hand(game, B).length).toBe(before.b);
  });
});
