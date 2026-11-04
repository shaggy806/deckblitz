/**
 * A spell's "any number of target …" group reading an amount as the spell is
 * cast: the kicks and X are announced first and the targets chosen next (rules
 * 601.2b–c), so Comet Storm's one target plus one a kick, and Aether Burst's
 * count of cards in graveyards, are fixed for that cast.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { describeTargetSpec } from "../target.js";

import { A, B, cast, counters, destroy, life, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** The cast offers for a card, one a kick count, by kicks. */
function offers(game: Game, card: ObjectId): Map<number, { readonly min: unknown; readonly max: unknown }> {
  const out = new Map<number, { readonly min: unknown; readonly max: unknown }>();
  for (const legal of game.legalActions(A)) {
    if (legal.kind !== "cast-spell" || legal.card !== card) continue;
    const spec = legal.targetSpecs[0];
    if (typeof spec !== "object" || spec.kind !== "any-number") continue;
    out.set(legal.kicked === true ? (legal.kickCount ?? 1) : 0, { min: spec.min, max: spec.max });
  }
  return out;
}

const pay = (game: Game, name: string, n: number): void => void lands(game, name, n);

/** Cast with `kicks` and X, naming `targets`, the way an offer's echoed. */
function castKicked(game: Game, card: ObjectId, kicks: number, x: number, targets: readonly (ObjectId | typeof A)[]): void {
  cast(game, card, {
    x,
    targets: targets.map(ref),
    ...(kicks > 0 ? { kicked: true, kickCount: kicks } : {}),
  });
}

describe("Comet Storm", () => {
  it("offers one target plus one a kick, each offer fixed at its count", () => {
    const { game } = table();
    pay(game, "Mountain", 5);
    spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Comet Storm");
    const seen = offers(game, card);
    expect(seen.get(0)).toEqual({ min: 1, max: 1 });
    expect(seen.get(1)).toEqual({ min: 2, max: 2 });
    expect(seen.get(2)).toEqual({ min: 3, max: 3 });
  });

  it("doesn't offer more kicks than there are targets to choose", () => {
    const { game } = table();
    pay(game, "Mountain", 8);
    const card = toHand(game, "Comet Storm");
    // Only the two players.
    const seen = offers(game, card);
    expect([...seen.keys()].sort()).toEqual([0, 1]);
  });

  it("deals X to each of the targets, X and the kicks paid for together", () => {
    const { game } = table();
    pay(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const card = toHand(game, "Comet Storm");

    castKicked(game, card, 2, 2, [B, bears, elves]);
    settle(game);

    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    expect(game.state.objects[card].timesKicked ?? 0).toBe(0);
  });

  it("keeps its count on a copy: the copy is kicked and has as many targets (the ruling)", () => {
    const { game, a } = table();
    pay(game, "Mountain", 5);
    pay(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Comet Storm");
    cast(game, card, { x: 1, targets: [ref(B), ref(bears)], kicked: true, kickCount: 1, settle: false });
    const stack = game.state.zones.shared.stack;
    const twincast = toHand(game, "Twincast");
    // Keep the copy's targets.
    a.chooseTargetsFn = () => [ref(B), ref(bears)];
    cast(game, twincast, { targets: [ref(stack[stack.length - 1])] });
    expect(zone(game, bears)).toBe("graveyard");
    // One from the copy and one from the original.
    expect(life(game, B)).toBe(18);
  });

  it("refuses too few or too many targets for the kicks", () => {
    const { game } = table();
    pay(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Comet Storm");
    expect(() => castKicked(game, card, 1, 1, [B])).toThrow();
    expect(() => castKicked(game, card, 0, 1, [B, bears])).toThrow();
    expect(zone(game, card)).toBe("hand");
  });

  it("refuses the same target twice (the ruling)", () => {
    const { game } = table();
    pay(game, "Mountain", 6);
    const card = toHand(game, "Comet Storm");
    expect(() => castKicked(game, card, 1, 1, [B, B])).toThrow();
  });

  it("still deals damage to the targets left when one is gone by resolution (the ruling)", () => {
    const { game } = table();
    pay(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Comet Storm");
    cast(game, card, { x: 2, targets: [ref(B), ref(bears)], kicked: true, kickCount: 1, settle: false });
    destroy(game, bears);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("what a group's prompt calls its targets", () => {
  it("says one target in the singular", () => {
    const group = (min: number, max: number) => ({ kind: "any-number", of: "any-target", min, max }) as const;
    expect(describeTargetSpec(group(1, 1))).toBe("1 target");
    expect(describeTargetSpec(group(0, 1))).toBe("up to 1 target");
    expect(describeTargetSpec(group(3, 3))).toBe("3 targets");
    expect(describeTargetSpec(group(0, 3))).toBe("up to 3 targets");
    expect(describeTargetSpec({ kind: "any-number", of: "any-target" })).toBe("any number of targets");
  });
});

describe("Strength of the Tajuru", () => {
  it("puts X counters on each of one creature plus one a kick", () => {
    const { game } = table();
    pay(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const card = toHand(game, "Strength of the Tajuru");
    castKicked(game, card, 1, 2, [bears, elves]);
    settle(game);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, elves)).toBe(2);
  });
});

describe("Aether Burst", () => {
  it("reads up to one plus the copies in all graveyards as it's cast", () => {
    const { game } = table();
    pay(game, "Island", 2);
    const [one, two, three] = [spawn(game, "Grizzly Bears", B), spawn(game, "Llanowar Elves", B), spawn(game, "Hill Giant", B)];
    toGraveyard(game, "Aether Burst", A);
    const card = toHand(game, "Aether Burst");
    expect(offers(game, card).get(0)).toEqual({ min: undefined, max: 2 });
    expect(() => cast(game, card, { targets: [one, two, three].map(ref) })).toThrow();

    toGraveyard(game, "Aether Burst", B);
    expect(offers(game, card).get(0)?.max).toBe(3);
    cast(game, card, { targets: [one, two, three].map(ref) });
    settle(game);
    for (const id of [one, two, three]) expect(zone(game, id)).toBe("hand");
  });

  it("may have fewer targets, or none", () => {
    const { game } = table();
    pay(game, "Island", 2);
    spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Aether Burst");
    cast(game, card, { targets: [] });
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
  });
});
