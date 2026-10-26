/**
 * "This spell costs {N} less to cast if it targets …" — a card's
 * `targetCostReduction`. The total cost is fixed once targets are chosen
 * (rules 601.2c, 601.2f), so the reduction is the cast's when one of its
 * targets earns it. A cast the caster can afford only with the reduction is
 * offered with only the targets that earn it (Price of Fame, Magnificent
 * End, Thing Swing, Fantastic Bounce).
 */

import { describe, expect, it } from "vitest";

import { fitCastTargets } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { maxXForTargets } from "../target-count.js";
import { A, B, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

/** The objects offered for `card`'s target slot `slot`, or null when it isn't offered at all. */
const offeredTargets = (game: Game, card: ObjectId, slot = 0): ObjectId[] | null => {
  const offer = game
    .legalActions(A)
    .find((l): l is Extract<typeof l, { kind: "cast-spell" }> => l.kind === "cast-spell" && l.card === card);
  if (offer === undefined) return null;
  return (offer.targetOptions[slot] ?? []).flatMap((t) => (t.kind === "object" ? [t.object] : []));
};

const untappedLands = (game: Game): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === A && !o.tapped && game.registry.get(o.cardName).types.includes("land");
  }).length;

describe("targetCostReduction", () => {
  it("Price of Fame: with only {1}{B}, offered only at a legendary creature, and cast for it", () => {
    const { game } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const price = toHand(game, "Price of Fame");
    expect(offeredTargets(game, price)).toEqual([isamaru]);
    expect(() => cast(game, price, { targets: [ref(bears)] })).toThrow(/cannot pay/);
    cast(game, price, { targets: [ref(isamaru)] });
    expect(zone(game, isamaru)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Price of Fame: with the full {3}{B}, every creature offered, and the legendary one still costs less", () => {
    const { game } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const price = toHand(game, "Price of Fame");
    expect(offeredTargets(game, price)?.sort()).toEqual([isamaru, bears].sort());
    cast(game, price, { targets: [ref(isamaru)] });
    // {1}{B} paid: two of the four Swamps are still untapped.
    expect(untappedLands(game)).toBe(2);
  });

  it("Price of Fame: at a creature that doesn't earn it, the full price", () => {
    const { game } = table();
    spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Price of Fame"), { targets: [ref(bears)] });
    expect(untappedLands(game)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Magnificent End: {1}{W} at a tapped creature only", () => {
    const { game } = table();
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const end = toHand(game, "Magnificent End");
    expect(offeredTargets(game, end)).toEqual([tapped]);
    cast(game, end, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });

  it("Thing Swing: {1}{G} with a Hero you control as the first target, which deals twice its power", () => {
    const { game } = table();
    const hero = spawn(game, "Agent of Atlas");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    const swing = toHand(game, "Thing Swing");
    // Only the Hero earns it; the opponent's slot is untouched.
    expect(offeredTargets(game, swing, 0)).toEqual([hero]);
    expect(offeredTargets(game, swing, 1)).toEqual([giant]);
    void bears;
    cast(game, swing, { targets: [ref(hero), ref(giant)] });
    // Agent of Atlas is a 2/2: 4 damage kills the 3/3.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("not offered at all when no target would bring it within reach", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    expect(offeredTargets(game, toHand(game, "Price of Fame"))).toBeNull();
  });

  it("Torch Breath: an X paid for by the reduction is capped for a target that doesn't earn it", () => {
    const { game } = table();
    const drake = spawn(game, "Cloud Elemental", B); // blue
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    const torch = toHand(game, "Torch Breath");
    const offer = game
      .legalActions(A)
      .find((l): l is Extract<typeof l, { kind: "cast-spell" }> => l.kind === "cast-spell" && l.card === torch);
    // {X}{R} with three Mountains: X up to 4 at a blue target, 2 at any other.
    expect(offer?.xCost).toMatchObject({ maxX: 4, maxXUnreduced: 2, reducingTargets: [drake] });
    expect(maxXForTargets(offer!.xCost!, offer!.targetCount, [ref(bears)])).toBe(2);
    expect(maxXForTargets(offer!.xCost!, offer!.targetCount, [ref(drake)])).toBe(4);
    // canDispatch prices the cast from its targets, as the cast does (601.2f).
    const action = { type: "cast-spell", player: A, card: torch, xValue: 4 } as const;
    expect(game.canDispatch({ ...action, targets: [ref(bears)] })).toMatch(/cannot pay/);
    expect(game.canDispatch({ ...action, targets: [ref(drake)] })).toBeNull();
    cast(game, torch, { targets: [ref(drake)], x: 4 });
    expect(zone(game, drake)).toBe("graveyard");
  });

  it("This Town Ain't Big Enough: two optional slots, affordable only with the reduction — the offer names what earns it, and a driver keeps one", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const town = toHand(game, "This Town Ain't Big Enough");
    const offer = game
      .legalActions(A)
      .find((l): l is Extract<typeof l, { kind: "cast-spell" }> => l.kind === "cast-spell" && l.card === town)!;
    expect(offer.reducingTargets).toEqual([mine]);
    // Aimed at two of Bob's, it can't be paid (the fuzzer crash, batch 185).
    expect(game.canDispatch({ type: "cast-spell", player: A, card: town, targets: [ref(theirs), ref(other)] })).toMatch(/cannot pay/);
    const fitted = fitCastTargets(offer, [ref(theirs), ref(other)], offer.targetOptions, offer.targetSpecs)!;
    expect(fitted.some((t) => t?.kind === "object" && t.object === mine)).toBe(true);
    cast(game, town, { targets: fitted });
    expect(zone(game, mine)).toBe("hand");
  });
});
