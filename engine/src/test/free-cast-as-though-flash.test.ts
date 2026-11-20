/**
 * A conditional free cast that is also "as though it had flash"
 * (`freeCastIf.flash`) — Qasali Ambusher: "If a creature is attacking you and
 * you control a Forest and a Plains, you may cast this creature without
 * paying its mana cost and as though it had flash." The flash belongs to the
 * free cast alone (rule 601.3c, 601.3d): a paid cast keeps a creature's
 * timing, and neither is offered once the condition fails.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, settle, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const offers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

/** Bob attacks `defender` with a Grizzly Bears; the game stops at alice's
 * priority in the declare attackers step. */
function bobAttacks(defender: ObjectId | typeof A, opts: { forest?: boolean; plains?: boolean; savannah?: boolean } = {}) {
  const t = table();
  const { game, b } = t;
  if (opts.forest !== false) lands(game, "Forest", 1);
  if (opts.plains !== false) lands(game, "Plains", 2);
  if (opts.savannah === true) lands(game, "Savannah", 1);
  const amb = toHand(game, "Qasali Ambusher");
  const bears = spawn(game, "Grizzly Bears", B);
  b.declareAttackersFn = () => [{ attacker: bears, defender }];
  game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A);
  return { ...t, amb, bears };
}

describe("Qasali Ambusher", () => {
  it("is cast free at instant speed while a creature attacks you", () => {
    const { game, amb } = bobAttacks(A);
    const ways = offers(game, amb);
    expect(ways.some((w) => w.free === true)).toBe(true);
    expect(ways.some((w) => w.free !== true)).toBe(false);
    cast(game, amb, { free: true });
    expect(zone(game, amb)).toBe("battlefield");
    // Every land still untapped: nothing was paid.
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === A && game.state.objects[id].tapped)).toEqual([]);
  });

  it("a paid cast is refused at instant speed", () => {
    const { game, amb } = bobAttacks(A);
    expect(() => cast(game, amb, { settle: false })).toThrow(/sorcery|main phase|timing|stack|turn/i);
  });

  it("isn't offered without a Plains", () => {
    const { game, amb } = bobAttacks(A, { plains: false });
    expect(offers(game, amb)).toEqual([]);
  });

  it("a land with both subtypes is enough", () => {
    const { game, amb } = bobAttacks(A, { plains: false, forest: false, savannah: true });
    expect(offers(game, amb).some((w) => w.free === true)).toBe(true);
  });

  it("isn't offered when the creature attacks only a planeswalker of yours", () => {
    const t = table();
    const walker = spawn(t.game, "Ajani Goldmane", A);
    settle(t.game);
    expect(zone(t.game, walker)).toBe("battlefield");
    const { game, amb } = (() => {
      const { game, b } = t;
      lands(game, "Forest", 1);
      lands(game, "Plains", 2);
      const amb = toHand(game, "Qasali Ambusher");
      const bears = spawn(game, "Grizzly Bears", B);
      b.declareAttackersFn = () => [{ attacker: bears, defender: walker }];
      game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A);
      return { game, amb };
    })();
    expect(offers(game, amb)).toEqual([]);
  });

  it("in your own main phase it may still be cast, paying for it", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    const amb = toHand(game, "Qasali Ambusher");
    const ways = offers(game, amb);
    expect(ways.some((w) => w.free !== true)).toBe(true);
    expect(ways.some((w) => w.free === true)).toBe(false);
  });
});
