/**
 * "Any number of target … with different controllers" — the `any-number`
 * group's `differentControllers`: each member past the first an `other` slot
 * with `differentController`, so no two share a controller as they're chosen
 * (rule 601.2c) and two that do by the time it resolves are both illegal
 * (rule 608.2b). Cloud's Limit Break's Blade Beam.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { concreteTargetSpecs, slotOptions } from "../target.js";
import type { TargetFacts, TargetRef, TargetSpec } from "../target.js";
import { A, B, C, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("an any-number group with different controllers", () => {
  const specs: TargetSpec[] = [{ kind: "any-number", of: "creature", differentControllers: true }];
  const obj = (object: string): TargetRef => ({ kind: "object", object: object as ObjectId });
  const owners: Record<string, string> = { a1: "alice", b1: "bob", b2: "bob", c1: "carol" };
  const facts = {
    controllerOf: (r: TargetRef) => (r.kind === "object" ? owners[r.object] : undefined),
    powerOf: () => 0,
  } as unknown as TargetFacts;

  it("makes each member past the first a slot controlled by none of the earlier members' controllers", () => {
    expect(concreteTargetSpecs(specs, 3)).toEqual([
      "creature",
      { kind: "other", of: "creature", than: { slots: [0] }, differentController: true },
      { kind: "other", of: "creature", than: { slots: [0, 1] }, differentController: true },
    ]);
  });

  it("offers the next pick only what no member's controller controls", () => {
    const options = [[obj("a1"), obj("b1"), obj("b2"), obj("c1")]];
    expect(slotOptions(specs, options, 1, [obj("b1")], facts)).toEqual([obj("a1"), obj("c1")]);
    expect(slotOptions(specs, options, 2, [obj("b1"), obj("c1")], facts)).toEqual([obj("a1")]);
  });
});

describe("Cloud's Limit Break", () => {
  const board = () => {
    const t = table({ players: 3 });
    const { game } = t;
    lands(game, "Plains", 6);
    return {
      ...t,
      spell: toHand(game, "Cloud's Limit Break"),
      mine: spawn(game, "Grizzly Bears", A, { tapped: true }),
      bobs: spawn(game, "Grizzly Bears", B, { tapped: true }),
      bobsOther: spawn(game, "Hill Giant", B, { tapped: true }),
      carols: spawn(game, "Grizzly Bears", C, { tapped: true }),
      untapped: spawn(game, "Hill Giant", C),
    };
  };
  const tappedLands = (game: ReturnType<typeof table>["game"]): number =>
    game.state.zones.shared.battlefield.filter((id) => {
      const o = game.state.objects[id];
      return o.cardName === "Plains" && o.tapped;
    }).length;

  it("Blade Beam destroys tapped creatures with different controllers, for {1} more", () => {
    const { game, spell, mine, bobs, bobsOther, carols, untapped } = board();
    cast(game, spell, { modes: [1], targets: [ref(mine), ref(bobs), ref(carols)] });
    expect([mine, bobs, carols].map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect([bobsOther, untapped].map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    expect(tappedLands(game)).toBe(3);
  });

  it("refuses two creatures one player controls, and an untapped one; no targets at all is a legal cast", () => {
    const { game, spell, bobs, bobsOther, carols, untapped } = board();
    const beam = (...ids: ObjectId[]): string | null =>
      game.canDispatch({ type: "cast-spell", player: A, card: spell, modes: [1], targets: ids.map(ref) });
    expect(beam(bobs, bobsOther)).not.toBeNull();
    expect(beam(carols, bobs, bobsOther)).not.toBeNull();
    expect(beam(untapped)).not.toBeNull();
    expect(beam(bobs, carols)).toBeNull();
    expect(beam()).toBeNull();
  });

  it("two targets one player controls as it resolves are both illegal (rule 608.2b)", () => {
    const { game, spell, mine, bobs, carols } = board();
    cast(game, spell, { modes: [1], targets: [ref(mine), ref(bobs), ref(carols)], settle: false });
    // Bob takes Carol's creature in response: his two are no longer legal
    // targets, Alice's still is.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(carols)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, mine)).toBe("graveyard");
    expect([bobs, carols].map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
  });

  it("Cross-Slash destroys one tapped creature for nothing more; Omnislash all of them for {3}{W}", () => {
    const first = board();
    cast(first.game, first.spell, { modes: [0], targets: [ref(first.bobsOther)] });
    expect(zone(first.game, first.bobsOther)).toBe("graveyard");
    expect(zone(first.game, first.bobs)).toBe("battlefield");
    expect(tappedLands(first.game)).toBe(2);

    const { game, spell, mine, bobs, bobsOther, carols, untapped } = board();
    cast(game, spell, { modes: [2] });
    expect([mine, bobs, bobsOther, carols].every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(zone(game, untapped)).toBe("battlefield");
    expect(tappedLands(game)).toBe(6);
  });
});
