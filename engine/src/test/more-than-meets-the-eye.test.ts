/**
 * More Than Meets the Eye (rule 702.162a): "you may cast this card converted
 * by paying [cost] rather than its mana cost" — an alternative cost that puts
 * the card on the stack with its back face up (712.11a), so it enters
 * converted, its mana value still its front face's (712.8c). Living metal
 * (702.161a) and convert (701.28) on Slicer, Hired Muscle // Slicer,
 * High-Speed Antagonist.
 */
import { describe, expect, it } from "vitest";

import { manaValueOfObject } from "../filter.js";
import { goadersOf } from "../goad.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

const FRONT = "Slicer, Hired Muscle";
const BACK = "Slicer, High-Speed Antagonist";
const VIA = "more-than-meets-the-eye";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === VIA);
const faceName = (game: Game, id: ObjectId): string => {
  const object = game.state.objects[id];
  return object.faces?.[object.face ?? 0] ?? object.cardName;
};

describe("More Than Meets the Eye", () => {
  it("offers Slicer converted for {2}{R}: its back face on the stack, mana value still 5", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const slicer = toHand(game, FRONT);
    const offered = offers(game, slicer);
    expect(offered).toHaveLength(1);
    expect(offered[0]).toMatchObject({ face: 1, cardName: BACK });
    cast(game, slicer, { via: VIA, face: 1, settle: false });
    expect(zone(game, slicer)).toBe("stack");
    expect(faceName(game, slicer)).toBe(BACK);
    expect(manaValueOfObject(registryOf(game), game.state.objects[slicer])).toBe(5);
    settle(game);
    expect(zone(game, slicer)).toBe("battlefield");
    expect(faceName(game, slicer)).toBe(BACK);
  });

  it("isn't offered, nor accepted, with only two lands: {2}{R} is the whole cost", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const slicer = toHand(game, FRONT);
    expect(offers(game, slicer)).toHaveLength(0);
    expect(() => cast(game, slicer, { via: VIA, face: 1 })).toThrow(/mana|pay|afford/i);
  });

  it("casts the back face only that way: not for nothing from the hand, nor from a graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const slicer = toHand(game, FRONT);
    expect(() => cast(game, slicer, { face: 1 })).toThrow(/back face/);
    const dead = toGraveyard(game, FRONT);
    expect(() => cast(game, dead, { via: VIA, face: 1 })).toThrow(/hand/);
    expect(() => cast(game, slicer, { via: VIA })).toThrow(/converted/);
  });

  it("a card without it isn't offered the cast", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const angler = toHand(game, "Baithook Angler");
    expect(offers(game, angler)).toHaveLength(0);
    expect(() => cast(game, angler, { via: VIA, face: 1 })).toThrow(/More Than Meets the Eye/);
  });
});

describe("Slicer, High-Speed Antagonist — living metal and convert", () => {
  it("is an artifact creature during its controller's turn only", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const slicer = toHand(game, FRONT);
    cast(game, slicer, { via: VIA, face: 1 });
    expect(types(game, slicer)).toContain("creature");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(types(game, slicer)).not.toContain("creature");
  });

  it("converts at end of combat after it deals combat damage to a player — haste lets it attack at once", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const slicer = toHand(game, FRONT);
    cast(game, slicer, { via: VIA, face: 1 });
    attack(game, a, [slicer]);
    expect(life(game, B)).toBe(17);
    expect(faceName(game, slicer)).toBe(FRONT);
    // Hired Muscle, a 3/4 double striker.
    expect(types(game, slicer)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });
});

describe("Slicer, Hired Muscle — the upkeep offer", () => {
  it("yes: that opponent controls it this turn, untapped, goaded by you, and it can't be sacrificed", () => {
    const { game, a } = table();
    const slicer = spawn(game, FRONT, A, { tapped: true });
    pickModes(a, 0);
    toStep(game, "upkeep", B);
    settle(game);
    expect(controller(game, slicer)).toBe(B);
    expect(game.state.objects[slicer].tapped).toBe(false);
    expect(goadersOf(game.state, registryOf(game), slicer)).toEqual([A]);
    game.debugApplyEffect(B, { kind: "sacrifice-target", target: 0 }, [ref(slicer)]);
    settle(game);
    expect(zone(game, slicer)).toBe("battlefield");
    expect(faceName(game, slicer)).toBe(FRONT);
    // Back to alice at end of turn.
    nextTurn(game);
    expect(controller(game, slicer)).toBe(A);
  });

  it("no: it converts", () => {
    const { game, a } = table();
    const slicer = spawn(game, FRONT);
    pickModes(a);
    toStep(game, "upkeep", B);
    settle(game);
    expect(controller(game, slicer)).toBe(A);
    expect(faceName(game, slicer)).toBe(BACK);
    // Bob's turn: a noncreature Vehicle.
    expect(types(game, slicer)).not.toContain("creature");
  });
});
