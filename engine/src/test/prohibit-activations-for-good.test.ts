/**
 * "Its activated abilities can't be activated", for good (Xathrid Gorgon): a
 * one-shot `prohibit` of `activate` on a target with `duration: "permanent"`
 * — bound to that permanent in this stint (rule 400.7), mana abilities
 * included (rule 605.1a: they're activated abilities), and lasting after the
 * source is gone (rule 611.2a). Beside it, the creature permanently gains
 * defender and becomes a colorless artifact in addition to its other types
 * (one `become`), none of which hangs on the petrification counter (the
 * card's ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, counters, destroy, keywords, lands, nextTurn, ref, spawn, table, types } from "./harness.js";

const canActivate = (game: Game, source: ObjectId, player = A): boolean =>
  game.canDispatch({ type: "activate-ability", player, source, abilityIndex: 0, targets: [] }) === null;
const canActivateAny = (game: Game, source: ObjectId, player = A): boolean =>
  game.legalActions(player).some((l) => l.kind === "activate-ability" && l.source === source);

/** Alice's Gorgon, with the mana for one activation, petrifying `target`. */
function petrify(game: Game, target: ObjectId): ObjectId {
  const gorgon = spawn(game, "Xathrid Gorgon");
  lands(game, "Swamp", 3);
  activate(game, gorgon, 0, { targets: [ref(target)] });
  return gorgon;
}

describe("Xathrid Gorgon", () => {
  it("puts a petrification counter on the creature, which gains defender and becomes a colorless artifact for good", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    petrify(game, dragon);
    expect(counters(game, dragon, "petrification")).toBe(1);
    expect(keywords(game, dragon).has("defender")).toBe(true);
    expect(keywords(game, dragon).has("flying")).toBe(true);
    expect(types(game, dragon)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(game.characteristics(dragon).colors.size).toBe(0);
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, dragon).has("defender")).toBe(true);
    expect(types(game, dragon)).toContain("artifact");
    expect(game.characteristics(dragon).colors.size).toBe(0);
  });

  it("its activated abilities can't be activated, past this turn", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    expect(canActivateAny(game, sorcerer)).toBe(true);
    petrify(game, sorcerer);
    expect(canActivateAny(game, sorcerer)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[sorcerer].tapped).toBe(false);
    expect(canActivateAny(game, sorcerer)).toBe(false);
  });

  it("mana abilities too", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves");
    expect(canActivate(game, elves)).toBe(true);
    petrify(game, elves);
    expect(canActivate(game, elves)).toBe(false);
  });

  it("doesn't hang on the counter or on the Gorgon", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    const gorgon = petrify(game, sorcerer);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "petrification", amount: 1 }, [ref(sorcerer)]);
    expect(counters(game, sorcerer, "petrification")).toBe(0);
    destroy(game, gorgon);
    expect(canActivateAny(game, sorcerer)).toBe(false);
    expect(keywords(game, sorcerer).has("defender")).toBe(true);
    expect(types(game, sorcerer)).toContain("artifact");
  });

  it("the creature that leaves and comes back is a new object, free of it", () => {
    const { game } = table();
    // "{R}: +1/+0 until end of turn" asks no tapping, so a dragon fresh on
    // the battlefield can still activate it.
    const dragon = spawn(game, "Shivan Dragon");
    petrify(game, dragon);
    lands(game, "Mountain", 1);
    expect(canActivateAny(game, dragon)).toBe(false);
    game.debugMove(dragon, "hand");
    game.debugMove(dragon, "battlefield");
    expect(canActivateAny(game, dragon)).toBe(true);
    expect(keywords(game, dragon).has("defender")).toBe(false);
    expect(types(game, dragon)).not.toContain("artifact");
  });
});
