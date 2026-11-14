/**
 * A copy's exception granting a triggered ability that reads its own name
 * (Pirated Copy): "except it's a Pirate in addition to its other types and it
 * has 'Whenever this creature or another creature with the same name deals
 * combat damage to a player, you draw a card'" — copiable values (rule
 * 707.9a), and "the same name" read live from the copy (rule 201.2a).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, hand, lands, nextTurn, spawn, subtypes, table, toHand, types } from "./harness.js";
import { nameOf } from "../state.js";

describe("Pirated Copy", () => {
  it("copies a creature as a Pirate, and draws for each creature with its name dealing combat damage", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    spawn(game, "Serra Angel");
    const copy = toHand(game, "Pirated Copy");
    a.chooseCopyFn = () => theirs;
    cast(game, copy);
    expect(nameOf(game.state.objects[copy])).toBe("Grizzly Bears");
    expect(subtypes(game, copy)).toEqual(expect.arrayContaining(["Bear", "Pirate"]));
    // Next turn it can attack: it and the other Grizzly Bears connect.
    nextTurn(game);
    nextTurn(game);
    const before = hand(game, A).length;
    attack(game, a, [copy, mine]);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("an opponent's creature with the same name triggers it too, and a differently named one doesn't", () => {
    const { game, a, b } = table();
    lands(game, "Island", 5);
    const theirs = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const copy = toHand(game, "Pirated Copy");
    a.chooseCopyFn = () => theirs;
    cast(game, copy);
    nextTurn(game);
    const before = hand(game, A).length;
    attack(game, b, [theirs, angel], A);
    // Bob's Bears share the copy's name; the Angel doesn't. Alice draws one.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("copying a creature that's a land underneath, it's no creature, so no Pirate (rule 205.3d)", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const vault = spawn(game, "Mutavault");
    activate(game, vault, 1);
    expect(types(game, vault)).toContain("creature");
    const copy = toHand(game, "Pirated Copy");
    a.chooseCopyFn = () => vault;
    cast(game, copy);
    expect(nameOf(game.state.objects[copy])).toBe("Mutavault");
    expect(types(game, copy)).toEqual(["land"]);
    expect(subtypes(game, copy)).not.toContain("Pirate");
  });

  it("declining, it's a 0/0 with no ability", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    spawn(game, "Grizzly Bears", B);
    const copy = toHand(game, "Pirated Copy");
    a.chooseCopyFn = () => null;
    cast(game, copy);
    expect(game.state.objects[copy].zone).toBe("graveyard");
  });
});
