/**
 * "Becomes the target" for a spell on the stack (`orSpell`): a spell is an
 * object a spell or ability can target (rule 115.1), and "a creature you
 * control or a creature spell you control becomes the target of a spell or
 * ability an opponent controls" (Surrak, Elusive Hunter) watches both. A
 * trigger without the word still reads permanents only.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, nextTurn, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("a spell on the stack becoming a target", () => {
  it("Surrak draws when an opponent counters your creature spell, and when one targets your creature", () => {
    const { game } = table();
    spawn(game, "Surrak, Elusive Hunter");
    lands(game, "Forest", 2);
    lands(game, "Island", 4, B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const before = hand(game).length;
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(bears)] });
    // The trigger went on the stack above Counterspell and resolved first;
    // the Bears were still countered.
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, bears)).toBe("graveyard");

    // A creature on the battlefield, as before.
    const cub = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    lands(game, "Mountain", 1, B);
    const then = hand(game).length;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(cub)] });
    expect(hand(game).length).toBe(then + 1);
  });

  it("Surrak: not a noncreature spell of yours, and not your own spell at your creature spell or creature", () => {
    const { game } = table();
    const surrak = spawn(game, "Surrak, Elusive Hunter");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 3);
    lands(game, "Island", 4, B);
    // An opponent's Counterspell at your Shock: not a creature spell.
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const before = hand(game).length;
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(shock)] });
    expect(hand(game).length).toBe(before);
    expect(life(game, B)).toBe(20);
    // Your own Giant Growth at Surrak: not an opponent's.
    const growth = toHand(game, "Giant Growth");
    const then = hand(game).length;
    cast(game, growth, { targets: [ref(surrak)] });
    expect(hand(game).length).toBe(then - 1);
  });

  it("an opponent's creature spell being countered by you doesn't count", () => {
    const { game } = table();
    spawn(game, "Surrak, Elusive Hunter");
    lands(game, "Island", 2);
    nextTurn(game); // bob's
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    const counter = toHand(game, "Counterspell");
    const before = hand(game).length;
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, counter, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });

  it("a trigger without `orSpell` still reads permanents only: Thunderbreak Regent ignores a countered Dragon spell", () => {
    const { game } = table();
    spawn(game, "Thunderbreak Regent");
    lands(game, "Mountain", 6);
    lands(game, "Island", 2, B);
    const dragon = toHand(game, "Shivan Dragon");
    cast(game, dragon, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(dragon)] });
    settle(game);
    expect(zone(game, dragon)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});
