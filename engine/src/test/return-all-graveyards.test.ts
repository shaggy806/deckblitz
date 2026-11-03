/**
 * Returning cards from every graveyard at once: `return-from-graveyard`'s
 * `from: "each-graveyard"` (each under its owner's control) and
 * `from: "all-graveyards"` to hands, each card to its owner's (rule 400.3).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Open the Vaults: every graveyard, each card under its owner's control", () => {
  it("returns artifacts and enchantments and leaves the rest, in a 4-player game", () => {
    const { game } = table({ players: 4 });
    const mine = toGraveyard(game, "Sol Ring", A);
    const hers = toGraveyard(game, "Sol Ring", C);
    const his = toGraveyard(game, "Glorious Anthem", D);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Open the Vaults"));
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, hers)).toBe("battlefield");
    expect(zone(game, his)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(controller(game, hers)).toBe(C);
    expect(controller(game, his)).toBe(D);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("an Aura's owner chooses what it enchants, among what's already there", () => {
    const { game, b } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const aura = toGraveyard(game, "Pacifism", B);
    const returning = toGraveyard(game, "Ornithopter", A);
    const asked: (readonly ObjectId[])[] = [];
    b.chooseEnchantFn = (_view, _source, options) => {
      asked.push(options);
      return bear;
    };
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Open the Vaults"));
    // Its owner, once, and not over the Ornithopter entering with it.
    expect(asked).toEqual([[bear]]);
    expect(zone(game, aura)).toBe("battlefield");
    expect(controller(game, aura)).toBe(B);
    expect(game.state.objects[aura].attachedTo).toBe(bear);
    expect(zone(game, returning)).toBe("battlefield");
  });

  it("an Aura with nothing to enchant stays in its graveyard (rule 303.4g)", () => {
    const { game } = table();
    const aura = toGraveyard(game, "Pacifism", B);
    const ring = toGraveyard(game, "Sol Ring", A);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Open the Vaults"));
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Planar Birth: basics only, tapped", () => {
  it("returns every player's basic lands tapped, under their owners, and no other land", () => {
    const { game } = table();
    const plains = toGraveyard(game, "Plains", A);
    const swamp = toGraveyard(game, "Swamp", B);
    const nonbasic = toGraveyard(game, "Command Tower", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Planar Birth"));
    expect(zone(game, plains)).toBe("battlefield");
    expect(zone(game, swamp)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(controller(game, swamp)).toBe(B);
    expect(zone(game, nonbasic)).toBe("graveyard");
  });
});

describe("Pyrrhic Revival: each with a -1/-1 counter", () => {
  it("returns every creature card with the counter, and an X/1 dies again", () => {
    const { game } = table();
    const bear = toGraveyard(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", B);
    const thopter = toGraveyard(game, "Ornithopter", B);
    const ring = toGraveyard(game, "Sol Ring", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Pyrrhic Revival"));
    expect(counters(game, bear, "-1/-1")).toBe(1);
    expect(pt(game, bear)).toEqual({ power: 1, toughness: 1 });
    expect(controller(game, giant)).toBe(B);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    // Ornithopter is 0/2, so -1/1 with its counter, and still here.
    expect(zone(game, thopter)).toBe("battlefield");
    expect(controller(game, thopter)).toBe(B);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Bringer of the Last Gift: swaps every board for every graveyard", () => {
  it("what was sacrificed stays, what was there before returns, and Bringer stays", () => {
    const { game } = table();
    const onBoard = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const mineBefore = toGraveyard(game, "Ornithopter", A);
    const theirsBefore = toGraveyard(game, "Llanowar Elves", B);
    lands(game, "Swamp", 8);
    const bringer = toHand(game, "Bringer of the Last Gift");
    cast(game, bringer);
    settle(game);
    expect(zone(game, bringer)).toBe("battlefield");
    expect(zone(game, onBoard)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mineBefore)).toBe("battlefield");
    expect(zone(game, theirsBefore)).toBe("battlefield");
    expect(controller(game, theirsBefore)).toBe(B);
  });

  it("does nothing if it wasn't cast", () => {
    const { game } = table();
    const onBoard = spawn(game, "Grizzly Bears", A);
    const before = toGraveyard(game, "Ornithopter", A);
    enter(game, "Bringer of the Last Gift");
    expect(zone(game, onBoard)).toBe("battlefield");
    expect(zone(game, before)).toBe("graveyard");
  });
});

describe("to their owners' hands, from all graveyards", () => {
  it("Infernal Caretaker: every player's Zombie cards to that player's hand as it's turned up", () => {
    const { game } = table();
    const mine = toGraveyard(game, "Gravedigger", A);
    const theirs = toGraveyard(game, "Gravedigger", B);
    const notOne = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 7);
    const caretaker = toHand(game, "Infernal Caretaker");
    cast(game, caretaker, { via: "face-down" });
    expect(game.state.objects[caretaker].faceDown).toBeDefined();
    expect(graveyard(game, A)).toContain(mine);
    game.dispatch({ type: "turn-face-up", player: A, permanent: caretaker, morph: true });
    settle(game);
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
    expect(graveyard(game, B)).toContain(notOne);
  });

  it("Saprazzan Bailiff: exiles them as it enters, and returns those that came after as it leaves", () => {
    const { game } = table();
    const early = toGraveyard(game, "Sol Ring", B);
    const bailiff = enter(game, "Saprazzan Bailiff");
    expect(zone(game, early)).toBe("exile");
    const mine = toGraveyard(game, "Sol Ring", A);
    const theirs = toGraveyard(game, "Glorious Anthem", B);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    destroy(game, bailiff);
    settle(game);
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, early)).toBe("exile");
  });
});
