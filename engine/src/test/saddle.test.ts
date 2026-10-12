/**
 * Saddle (rule 702.171): "Saddle N" means "Tap any number of other untapped
 * creatures you control with total power N or greater: This permanent
 * becomes saddled until end of turn. Activate only as a sorcery." — the
 * `saddle(n)` helper (crew's `tapOthers.totalPower` cost at sorcery speed),
 * the saddled designation (`GameObject.saddled`, 702.171b), the creatures
 * that saddled it (`GameObject.saddledThisTurn`, 702.171c, read by
 * `CardFilter.saddledSource`), "attacks while saddled" (a `whileCondition`)
 * and `becomes-saddled` triggers. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";

import {
  A,
  B,
  attack,
  counters,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  watchTargets,
} from "./harness.js";

/** Activate `mount`'s saddle ability (index `index`) tapping `tap`; the
 * engine's refusal, or null once it has resolved. */
function saddleWith(game: Game, mount: ObjectId, tap: readonly ObjectId[], index = 0): string | null {
  const action: Action = { type: "activate-ability", player: A, source: mount, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why === null) {
    game.dispatch(action);
    settle(game);
  }
  return why;
}

const saddled = (game: Game, id: ObjectId): boolean => game.state.objects[id].saddled === true;

describe("saddle", () => {
  it("taps other creatures with enough total power — summoning sick ones too — and the Mount is saddled until end of turn", () => {
    const { game } = table();
    const jaguar = spawn(game, "Alacrian Jaguar");
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === jaguar);
    expect(offer?.kind === "activate-ability" ? offer.tapCost?.totalPower : undefined).toBe(1);
    // Never the Mount itself ("other").
    expect(offer?.kind === "activate-ability" ? offer.tapCost?.choices : []).not.toContain(jaguar);
    expect(saddleWith(game, jaguar, [fresh])).toBeNull();
    expect(saddled(game, jaguar)).toBe(true);
    expect(game.state.objects[fresh].tapped).toBe(true);
    expect(viewFor(game.state, game.registry, A).objects[jaguar]?.saddled).toBe(true);
    // Until end of turn (rule 702.171b): gone in the cleanup step, and so is
    // the Bears' record of having saddled it.
    toStep(game, "upkeep", B);
    expect(saddled(game, jaguar)).toBe(false);
    expect(game.state.objects[fresh].saddledThisTurn).toBeUndefined();
  });

  it("is activated only as a sorcery", () => {
    const { game } = table();
    const jaguar = spawn(game, "Alacrian Jaguar");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    expect(saddleWith(game, jaguar, [bears])).not.toBeNull();
    // Nor on another player's turn.
    toStep(game, "precombat-main", B);
    expect(saddled(game, jaguar)).toBe(false);
  });

  it("isn't offered without enough power, and can be activated again while saddled (the rulings)", () => {
    const { game } = table();
    const sloth = spawn(game, "Unswerving Sloth");
    const bears = spawn(game, "Grizzly Bears");
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === sloth)).toBe(false);
    const giant = spawn(game, "Hill Giant");
    expect(saddleWith(game, sloth, [bears, giant])).toBeNull();
    expect(saddled(game, sloth)).toBe(true);
    const jaguar = spawn(game, "Alacrian Jaguar");
    const elves = spawn(game, "Llanowar Elves");
    expect(saddleWith(game, jaguar, [elves])).toBeNull();
    const more = spawn(game, "Llanowar Elves");
    expect(saddleWith(game, jaguar, [more])).toBeNull();
    expect(saddled(game, jaguar)).toBe(true);
  });

  it("ends when the permanent leaves the battlefield (a new object, rule 400.7)", () => {
    const { game } = table();
    const jaguar = spawn(game, "Alacrian Jaguar");
    const bears = spawn(game, "Grizzly Bears");
    saddleWith(game, jaguar, [bears]);
    game.debugMove(jaguar, "hand");
    expect(game.state.objects[jaguar].saddled).toBeUndefined();
  });

  it("'attacks while saddled' triggers only for a Mount saddled as it's declared an attacker", () => {
    const { game, a } = table();
    const jaguar = spawn(game, "Alacrian Jaguar");
    attack(game, a, [jaguar]);
    expect(pt(game, jaguar)).toEqual({ power: 4, toughness: 4 });

    const { game: g2, a: a2 } = table();
    const j2 = spawn(g2, "Alacrian Jaguar");
    const bears = spawn(g2, "Grizzly Bears");
    saddleWith(g2, j2, [bears]);
    attack(g2, a2, [j2]);
    expect(pt(g2, j2)).toEqual({ power: 6, toughness: 6 });
  });

  it("a creature saddles the Mount as it's tapped for the cost (702.171c), and one that leaves no longer has", () => {
    const { game, a } = table();
    const beaver = spawn(game, "Giant Beaver");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    saddleWith(game, beaver, [giant]);
    expect(game.state.objects[giant].saddledThisTurn).toEqual([
      { mount: beaver, stint: game.state.objects[beaver].zoneChangeCount ?? 0 },
    ]);
    // Only the Giant can be the target: the Bears didn't saddle it.
    watchTargets(a, (offered) => [offered[0]?.[0] ?? null]);
    attack(game, a, [beaver]);
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("offers every creature that saddled it, and not one that has since left and come back", () => {
    const { game, a } = table();
    const beaver = spawn(game, "Giant Beaver");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    expect(saddleWith(game, beaver, [elves, bears])).toBeNull();
    expect(saddleWith(game, beaver, [giant])).toBeNull();
    const seen = watchTargets(a, (offered) => [offered[0]?.[0] ?? null]);
    // Flickered: a new object, which saddled nothing (rule 400.7).
    game.debugMove(elves, "exile");
    game.debugMove(elves, "battlefield");
    attack(game, a, [beaver]);
    // Both activations' creatures, the Elves no longer.
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([bears, giant].sort());
    expect(counters(game, elves)).toBe(0);
  });

  it("Stubborn Burrowfiend's trigger fires the first time each turn only", () => {
    const { game } = table();
    const fiend = spawn(game, "Stubborn Burrowfiend");
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    const giant = spawn(game, "Hill Giant");
    expect(saddleWith(game, fiend, [giant])).toBeNull();
    // Milled two Bears: three creature cards in the graveyard.
    expect(pt(game, fiend)).toEqual({ power: 5, toughness: 5 });
    const other = spawn(game, "Hill Giant");
    expect(saddleWith(game, fiend, [other])).toBeNull();
    expect(pt(game, fiend)).toEqual({ power: 5, toughness: 5 });
    // A new turn, a first time again.
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    const third = spawn(game, "Hill Giant");
    expect(saddleWith(game, fiend, [third])).toBeNull();
    expect(pt(game, fiend).power).toBeGreaterThan(2);
  });

  it("the creatures saddle it as the cost is paid, before the ability resolves", () => {
    const { game } = table();
    const beaver = spawn(game, "Giant Beaver");
    const giant = spawn(game, "Hill Giant");
    const action: Action = { type: "activate-ability", player: A, source: beaver, abilityIndex: 0, targets: [], tap: [giant] };
    game.dispatch(action);
    // On the stack, not resolved: the cost was paid.
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].saddledThisTurn?.length).toBe(1);
    expect(saddled(game, beaver)).toBe(false);
    settle(game);
    expect(saddled(game, beaver)).toBe(true);
  });
});
