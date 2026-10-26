/**
 * Theros and Commander 2013 (THS, C13; B167), group B. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  named,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Curse of Shallow Graves", () => {
  it("lets the player attacking the enchanted player create a tapped Zombie, once however many attack", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Curse of Shallow Graves"), { targets: [ref(B)] });
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickModes(a, 0);
    attack(game, a, bears);
    const zombies = named(game, "Zombie Token", A);
    expect(zombies.length).toBe(1);
    expect(game.state.objects[zombies[0]].tapped).toBe(true);
  });
});

describe("Curse of Chaos", () => {
  it("lets the attacking player rummage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Curse of Chaos"), { targets: [ref(B)] });
    const bears = spawn(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    const yardBefore = graveyard(game).length;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(yardBefore + 1);
  });
});

describe("Tempt with Glory", () => {
  it("gives you an extra round of counters for each opponent who accepts", () => {
    const { game, b } = table();
    lands(game, "Plains", 6);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    cast(game, toHand(game, "Tempt with Glory"));
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Fate Foretold", () => {
  it("draws for you as it enters, and for the creature's controller when it dies", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = toHand(game, "Fate Foretold");
    const mineBefore = hand(game).length; // the aura leaves, the draw replaces it
    cast(game, aura, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(mineBefore);
    const theirsBefore = hand(game, B).length;
    destroy(game, bears);
    expect(hand(game, B).length).toBe(theirsBefore + 1);
    expect(hand(game).length).toBe(mineBefore);
  });
});

describe("Nylea's Presence", () => {
  it("makes the enchanted land every basic land type", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const wastes = spawn(game, "Wastes");
    cast(game, toHand(game, "Nylea's Presence"), { targets: [ref(wastes)] });
    expect(subtypes(game, wastes)).toEqual(expect.arrayContaining(["Plains", "Island", "Swamp", "Mountain", "Forest"]));
  });
});

describe("Tymaret, the Murder King", () => {
  it("returns from the graveyard to hand by sacrificing a creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const tymaret = toGraveyard(game, "Tymaret, the Murder King");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: tymaret, abilityIndex: 1, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, tymaret)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Polis Crusher", () => {
  it("destroys an enchantment of the player it hits only while monstrous", () => {
    const plain = table();
    const small = spawn(plain.game, "Polis Crusher");
    const kept = spawn(plain.game, "Prismatic Omen", B);
    attack(plain.game, plain.a, [small]);
    expect(zone(plain.game, kept)).toBe("battlefield");

    const { game, a } = table();
    lands(game, "Forest", 5);
    lands(game, "Mountain", 1);
    const crusher = spawn(game, "Polis Crusher");
    const ench = spawn(game, "Prismatic Omen", B);
    game.dispatch({ type: "activate-ability", player: A, source: crusher, abilityIndex: 0, targets: [] });
    settle(game);
    expect(counters(game, crusher)).toBe(3);
    pickTargets(a, ench);
    attack(game, a, [crusher]);
    expect(zone(game, ench)).toBe("graveyard");
  });
});
