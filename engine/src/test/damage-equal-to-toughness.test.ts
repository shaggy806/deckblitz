/**
 * `deals-damage`'s `equalToToughness`: damage to a creature equal to its
 * toughness as it's dealt, whatever was already marked on it (Taii Wakeen,
 * Perfect Shot's ruling), never a player. Proved on Taii Wakeen, whose {X}
 * ability adds X to your sources' noncombat damage this turn.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, hand, lands, life, named, ref, spawn, table, toHand } from "./harness.js";

describe("Taii Wakeen, Perfect Shot", () => {
  it("draws when your noncombat damage to a creature equals its toughness, not more or less", () => {
    const { game } = table();
    spawn(game, "Taii Wakeen, Perfect Shot", A);
    lands(game, "Mountain", 2);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(spawn(game, "Hill Giant", B))] });
    expect(hand(game, A).length).toBe(before);
    cast(game, toHand(game, "Shock"), { targets: [ref(spawn(game, "Grizzly Bears", B))] });
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("doesn't care about damage already marked on the creature", () => {
    const { game } = table();
    spawn(game, "Taii Wakeen, Perfect Shot", A);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, spawn(game, "Prodigal Sorcerer", A), 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    lands(game, "Mountain", 1);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("{X}, {T}: your noncombat damage this turn is X more — to a player too — and the total is what's compared", () => {
    const { game } = table();
    const taii = spawn(game, "Taii Wakeen, Perfect Shot", A);
    lands(game, "Mountain", 3);
    activate(game, taii, 0, { x: 1 });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    const before = hand(game, A).length;
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(named(game, "Hill Giant", B)).toEqual([]);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("doesn't add to an opponent's source's damage", () => {
    const { game } = table();
    const taii = spawn(game, "Taii Wakeen, Perfect Shot", A);
    lands(game, "Mountain", 2);
    activate(game, taii, 0, { x: 2 });
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(A)]);
    expect(life(game, A)).toBe(19);
  });
});
