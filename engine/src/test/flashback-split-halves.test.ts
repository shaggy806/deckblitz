/**
 * A split card with flashback from Snapcaster Mage or Past in Flames (rule
 * 702.34a) may be cast as either half for that half's cost: only the half
 * being cast is evaluated (rule 709.3a), so "equal to its mana cost" is the
 * half's. The same for a static's grant (Return the Past, Lier).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  cast,
  enter,
  lands,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
} from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
const flashbackCastsOf = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

describe("flashback and a split card's halves", () => {
  it("Snapcaster Mage: each half is offered for its own cost", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Fire // Ice");
    pickTargets(a, card);
    enter(game, "Snapcaster Mage");
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const faces = flashbackCastsOf(game, card).map((c) => c.face);
    expect(faces.sort()).toEqual([1, 2]);
  });

  it("casting Tear for {W} alone: Wear ({1}{R}) isn't affordable, Tear resolves and is exiled", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Wear // Tear");
    pickTargets(a, card);
    enter(game, "Snapcaster Mage");
    lands(game, "Plains", 1);
    const anthem = spawn(game, "Glorious Anthem");
    const offered = flashbackCastsOf(game, card);
    expect(offered.map((c) => c.face)).toEqual([2]);
    cast(game, card, { via: "flashback", face: 2, targets: [ref(anthem)] });
    settle(game);
    expect(game.state.objects[anthem].zone).toBe("graveyard");
    expect(game.state.objects[card].zone).toBe("exile");
  });

  it("Past in Flames offers each half for its own mana cost", () => {
    const { game } = table();
    const card = toGraveyard(game, "Wear // Tear");
    spawn(game, "Sol Ring");
    spawn(game, "Glorious Anthem");
    lands(game, "Mountain", 8);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Past in Flames"));
    lands(game, "Plains", 1);
    const offered = flashbackCastsOf(game, card);
    expect(offered.map((c) => c.face).sort()).toEqual([1, 2]);
  });

  it("Return the Past (a static's grant, during your turn): each half for its own cost, and not on another's turn", () => {
    const { game } = table();
    const card = toGraveyard(game, "Wear // Tear");
    spawn(game, "Return the Past");
    spawn(game, "Sol Ring");
    lands(game, "Plains", 1);
    // {W} pays Tear alone; neither Wear's {1}{R} nor the whole card's
    // {1}{R}{W} is asked.
    expect(flashbackCastsOf(game, card).map((c) => c.face)).toEqual([2]);
    lands(game, "Mountain", 1);
    expect(flashbackCastsOf(game, card).map((c) => c.face).sort()).toEqual([1, 2]);
  });

  it("Return the Past grants nothing during an opponent's turn", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    spawn(game, "Return the Past");
    lands(game, "Mountain", 1);
    expect(flashbackCastsOf(game, bolt)).toHaveLength(1);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.priority.holder === A);
    expect(flashbackCastsOf(game, bolt)).toHaveLength(0);
  });

  it("the whole card isn't offered", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Wear // Tear");
    pickTargets(a, card);
    enter(game, "Snapcaster Mage");
    spawn(game, "Sol Ring");
    spawn(game, "Glorious Anthem");
    lands(game, "Plains", 5);
    expect(flashbackCastsOf(game, card).some((c) => c.face === undefined || c.face === 0)).toBe(false);
  });
});
