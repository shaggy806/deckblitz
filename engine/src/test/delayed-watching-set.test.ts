/**
 * A delayed "whenever" watching every member of a set (`DelayedWhenever.
 * watching` given an `ObjectSetRef`), and the `"dealt-damage"` this-way kind:
 * Ghired's Belligerence's "whenever a creature dealt damage this way dies this
 * turn, populate" — once for each such creature that dies, for any reason
 * (its ruling), and never for one whose damage was prevented (rule 615.1).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, nextTurn, ref, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const elf = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Elf Warrior Token", count: 1 }, []);
};

const shield = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: "all" }, [ref(id)]);
};

describe("a delayed trigger watching what was dealt damage this way", () => {
  it("Ghired's Belligerence populates once for each creature it damaged that dies", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Mountain", 6);
    elf(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", B);
    cast(game, toHand(game, "Ghired's Belligerence"), {
      x: 4,
      targets: [ref(bears), ref(giant), ref(ogre)],
      division: [2, 1, 1],
    });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    // Dying another way this turn counts too (the ruling).
    destroy(game, giant);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(3);
    // Not after this turn.
    nextTurn(game);
    destroy(game, ogre);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(3);
  });

  it("doesn't watch a creature whose damage was prevented", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Mountain", 4);
    elf(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    shield(game, giant);
    cast(game, toHand(game, "Ghired's Belligerence"), { x: 2, targets: [ref(bears), ref(giant)], division: [1, 1] });
    destroy(game, giant);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(1);
    destroy(game, bears);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });

  it("a watched creature that leaves and returns is a new object, no longer watched (rule 400.7)", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Mountain", 3);
    elf(game);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ghired's Belligerence"), { x: 1, targets: [ref(bears)], division: [1] });
    game.debugApplyEffect(B, { kind: "flicker", target: 0 }, [ref(bears)]);
    destroy(game, bears);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(1);
  });
});
