/**
 * Fuse (rule 702.102): a split card with fuse cast from its owner's hand may
 * be cast as both halves at once — the whole card (face 0), for both halves'
 * mana costs, with the left half's targets then the right's, following the
 * left half's instructions and then the right's (702.102d). From anywhere
 * else only one half may be cast (the rulings). Dragon's Maze's split cards.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** The faces `card` may be cast as from A's hand right now. */
const offers = (game: Game, card: ObjectId): (number | undefined)[] =>
  game.legalActions(A).flatMap((a) => (a.kind === "cast-spell" && a.card === card ? [a.face] : []));

describe("fuse", () => {
  it("offers each half and the fused whole from the hand, and resolves both halves for both costs", () => {
    const { game } = table();
    const paying = [...lands(game, "Mountain", 2), ...lands(game, "Plains", 1)];
    const relic = spawn(game, "Sol Ring", B);
    const aura = spawn(game, "Glorious Anthem", B);
    const card = toHand(game, "Wear // Tear");
    expect(offers(game, card).sort()).toEqual([0, 1, 2]);

    cast(game, card, { face: 0, targets: [ref(relic), ref(aura)] });
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    expect(paying.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("isn't offered fused without both costs, or when a half has no legal target", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const relic = spawn(game, "Sol Ring", B);
    const card = toHand(game, "Wear // Tear");
    expect(offers(game, card)).toEqual([1]);
    lands(game, "Plains", 1);
    // No enchantment for Tear: neither it nor the fused spell can be cast.
    expect(offers(game, card)).toEqual([1]);
    expect(() => cast(game, card, { face: 0, targets: [ref(relic), null] })).toThrow();
  });

  it("can't be cast fused from anywhere but a hand, and a split card without fuse never is", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Plains", 5);
    lands(game, "Island", 6);
    const relic = spawn(game, "Sol Ring", B);
    const aura = spawn(game, "Glorious Anthem", B);
    const dead = toGraveyard(game, "Wear // Tear");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: dead, face: 0, via: "graveyard-permission", targets: [ref(relic), ref(aura)] })).not.toBeNull();
    const plain = toHand(game, "Expansion // Explosion");
    expect(offers(game, plain)).not.toContain(0);
    expect(() => cast(game, plain, { face: 0 })).toThrow(/halves/);
  });

  it("follows the left half first: Turn makes the creature a 0/1 and Burn's 2 damage then kills it", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Turn // Burn");
    // The same object for each half's "target" (the ruling).
    cast(game, card, { face: 0, targets: [ref(giant), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("reads each half's own targets: Toil's player draws two, then Trouble counts that player's hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const card = toHand(game, "Toil // Trouble");
    const bobHand = hand(game, B).length;
    cast(game, card, { face: 0, targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20 - bobHand);
  });

  it("resolves a half on its own as before: Flesh's counters are the exiled card's power", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    const dead = toGraveyard(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Flesh // Blood"), { face: 1, targets: [ref(dead), ref(bears)] });
    expect(zone(game, dead)).toBe("exile");
    expect(counters(game, bears)).toBe(3);
  });

  it("Catch // Release fused: the permanent Catch took can be the one its new controller sacrifices", () => {
    const { game } = table();
    const mine = [...lands(game, "Island", 1), ...lands(game, "Mountain", 4), ...lands(game, "Plains", 4)];
    const relic = spawn(game, "Sol Ring");
    const bobLand = spawn(game, "Forest", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Catch // Release"), { face: 0, targets: [ref(giant)] });
    // Alice's only creature is now the Giant, so it goes with her artifact and a land.
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
    expect(mine.filter((id) => zone(game, id) === "graveyard").length).toBe(1);
    expect(zone(game, bobLand)).toBe("graveyard");
  });

  it("Beck // Call fused: Beck's trigger for this turn sees the four Birds Call then makes", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 3);
    lands(game, "Plains", 4);
    pickModes(a, 0);
    const before = hand(game, A).length;
    const card = toHand(game, "Beck // Call");
    cast(game, card, { face: 0 });
    expect(hand(game, A).length).toBe(before + 4);
  });

  it("Double Jump // Flying Kick fused: the creature is a 5/5 by the time it deals its damage", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Double Jump // Flying Kick"), { face: 0, targets: [ref(bears), ref(bears), ref(giant)] });
    expect(counters(game, bears, "flying")).toBe(1);
    // A 2/2 alone wouldn't kill the 6/4.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Gallifrey Falls // No More fused: an any-number group is the right half's own slot", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Plains", 3);
    const big = spawn(game, "Colossal Dreadmaw");
    const bigger = spawn(game, "Colossal Dreadmaw");
    const lost = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Gallifrey Falls // No More"), { face: 0, targets: [ref(big), ref(bigger)] });
    expect(zone(game, lost)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    // Both members of the group phase out — after the damage (left half first).
    expect(zone(game, big)).toBe("phased-out");
    expect(zone(game, bigger)).toBe("phased-out");
  });

  it("Breaking // Entering fused: mills eight, then puts a creature card from a graveyard onto the battlefield with haste", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const giant = toGraveyard(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, toHand(game, "Breaking // Entering"), { face: 0, targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(8);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(keywords(game, giant).has("haste")).toBe(true);
  });
});
