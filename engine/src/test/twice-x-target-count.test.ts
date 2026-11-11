/**
 * "Up to **twice X** target …" (Erebos's Intervention): a group's bound that
 * is a whole multiple of the spell's own X, `{ product: ["x", 2] }`. X is
 * announced before the targets (rule 601.2b–c), so the choice is judged at
 * twice the X cast with, and a count of targets needs an X of at least half
 * of it, rounded up.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { describeTargetSpec, groupReadsCastAmount, groupReadsX, specsAtX, xMultiple } from "../target.js";
import { fitModalXGroup } from "../target-count.js";
import type { TargetSpec } from "../target.js";
import { A, B, cast, lands, life, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const TWICE: TargetSpec[] = [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: { product: ["x", 2] } }];

describe("a group bound that is a multiple of X", () => {
  it("is read as X times a whole number, and nothing else is", () => {
    expect(xMultiple("x")).toBe(1);
    expect(xMultiple({ product: ["x", 2] })).toBe(2);
    expect(xMultiple({ product: [3, "x"] })).toBe(3);
    expect(xMultiple({ product: ["x", -1] })).toBeUndefined();
    expect(xMultiple({ product: ["x", "x"] })).toBeUndefined();
    expect(xMultiple({ sum: ["x", 1] })).toBeUndefined();
    expect(xMultiple(4)).toBeUndefined();
    expect(xMultiple(undefined)).toBeUndefined();
  });

  it("waits for the X, then is fixed at twice it", () => {
    expect(groupReadsX(TWICE)).toBe(true);
    expect(groupReadsCastAmount(TWICE)).toBe(false);
    expect(specsAtX(TWICE, 3)).toEqual([{ ...(TWICE[0] as object), max: 6 }]);
    expect(specsAtX(TWICE, 0)).toEqual([{ ...(TWICE[0] as object), max: 0 }]);
    expect(describeTargetSpec(TWICE[0])).toMatch(/^up to twice X /);
  });

  it("fits a driver's picks: two members an X — `fitModalXGroup`", () => {
    const picks = ["o1", "o2", "o3", "o4", "o5"].map((object) => ({ kind: "object" as const, object: object as never }));
    // Five picks, X at most 2: four kept.
    expect(fitModalXGroup(TWICE, picks, { maxX: 2 })).toEqual({ targets: picks.slice(0, 4), xValue: 2 });
    // Three picks need X 2, though the driver wanted 0.
    expect(fitModalXGroup(TWICE, picks.slice(0, 3), { maxX: 4 }, 0)).toEqual({ targets: picks.slice(0, 3), xValue: 2 });
    expect(fitModalXGroup(TWICE, picks.slice(0, 2), { maxX: 4 }, 0)).toEqual({ targets: picks.slice(0, 2), xValue: 1 });
  });
});

describe("Erebos's Intervention", () => {
  const yard = (game: Game): ObjectId[] => [
    toGraveyard(game, "Grizzly Bears", B),
    toGraveyard(game, "Hill Giant", B),
    toGraveyard(game, "Savannah Lions", B),
    toGraveyard(game, "Grizzly Bears"),
    toGraveyard(game, "Hill Giant"),
  ];

  it("exiles up to twice X cards from graveyards: four at X 2, not five", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const cards = yard(game);
    const spell = toHand(game, "Erebos's Intervention");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spell, xValue: 2, modes: [1], targets: cards.map(ref) }),
    ).toMatch(/at most 4/);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spell, xValue: 1, modes: [1], targets: cards.slice(0, 3).map(ref) }),
    ).toMatch(/at most 2/);
    cast(game, spell, { x: 2, modes: [1], targets: cards.slice(0, 4).map(ref) });
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile", "exile", "graveyard"]);
  });

  it("takes an odd number under twice X, or none at all", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const cards = yard(game);
    cast(game, toHand(game, "Erebos's Intervention"), { x: 2, modes: [1], targets: cards.slice(0, 3).map(ref) });
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile", "graveyard", "graveyard"]);
    cast(game, toHand(game, "Erebos's Intervention"), { x: 0, modes: [1], targets: [] });
    expect(zone(game, cards[3])).toBe("graveyard");
  });

  it("first mode: -X/-X until end of turn, and X life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Erebos's Intervention"), { x: 2, modes: [0], targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(life(game, A)).toBe(22);
  });
});

describe("a spell that is only the group: the cast offer", () => {
  const purge = defineCard({
    name: "Test Twice Purge",
    manaCost: "{X}{B}",
    colors: ["B"],
    types: ["instant"],
    text: "Exile up to twice X target cards from graveyards.",
    targets: TWICE,
    effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
  });
  const castOffer = (game: Game, card: ObjectId) =>
    game.legalActions(A).find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

  it("offers each count of targets with the least X it needs: half, rounded up", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(purge);
    lands(game, "Swamp", 3);
    const cards = [
      toGraveyard(game, "Grizzly Bears", B),
      toGraveyard(game, "Hill Giant", B),
      toGraveyard(game, "Savannah Lions", B),
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Hill Giant"),
    ];
    const spell = toHand(game, "Test Twice Purge");
    const offer = castOffer(game, spell);
    // Two Swamps left for X: at most four of the five cards.
    expect(offer?.xCost?.maxX).toBe(2);
    expect(offer?.targetCount).toMatchObject({ min: 0, max: 4 });
    expect(offer?.xCost?.minXByTargetCount).toEqual([0, 1, 1, 2, 2]);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, xValue: 1, targets: cards.slice(0, 3).map(ref) })).not.toBeNull();
    cast(game, spell, { x: 2, targets: cards.slice(0, 4).map(ref) });
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile", "exile", "graveyard"]);
  });
});
