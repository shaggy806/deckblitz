/**
 * "Must be blocked by two or more creatures if able" (Gorm the Great): the
 * `must-be-blocked-if-able` record's `byAtLeast`, a requirement of its own
 * (rule 509.1c) beside Gorm's plain "must be blocked if able" — two blockers
 * obey both, one obeys one, none obeys neither.
 */
import { describe, expect, it } from "vitest";

import { blockingViolations, ifAblePlan, obeyingLure } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, grant, ref, spawn, table } from "./harness.js";

const declareBlocks = (game: Game, ...blocks: readonly (readonly [ObjectId, ObjectId])[]): void => {
  game.dispatch({
    type: "declare-blockers",
    player: B,
    blocks: blocks.map(([blocker, attacker]) => ({ blocker, attacker })),
  });
};

/** Gorm, ready to attack. */
function gorm(game: Game): ObjectId {
  const id = spawn(game, "Gorm the Great", A);
  game.state.objects[id].summoningSick = false;
  return id;
}

describe("Gorm the Great", () => {
  it("two able blockers: both must block it — one alone or none won't do", () => {
    const { game, a } = table();
    const giant = gorm(game);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [giant]);
    expect(offer.mustBeBlockedIfAble).toEqual([giant]);
    expect(offer.mustBeBlockedByAtLeast?.[giant]).toEqual([1, 2]);
    expect(ifAblePlan(offer).required).toBe(2);
    expect(blockingViolations([], offer)).not.toEqual([]);
    expect(blockingViolations([{ blocker: first, attacker: giant }], offer)).not.toEqual([]);
    expect(
      blockingViolations(
        [
          { blocker: first, attacker: giant },
          { blocker: second, attacker: giant },
        ],
        offer,
      ),
    ).toEqual([]);
    expect(() => declareBlocks(game, [first, giant])).toThrow(/must be blocked/);
    declareBlocks(game, [first, giant], [second, giant]);
    expect(game.state.objects[giant].blockedBy?.length).toBe(2);
  });

  it("a third creature may join, or stay home", () => {
    const { game, a } = table();
    const giant = gorm(game);
    const blockers = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const offer = blockOffer(game, a, [giant]);
    expect(ifAblePlan(offer).required).toBe(2);
    expect(blockingViolations(blockers.slice(0, 2).map((blocker) => ({ blocker, attacker: giant })), offer)).toEqual([]);
    expect(blockingViolations(blockers.map((blocker) => ({ blocker, attacker: giant })), offer)).toEqual([]);
  });

  it("only one able: it blocks Gorm alone (the ruling)", () => {
    const { game, a } = table();
    const giant = gorm(game);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    const offer = blockOffer(game, a, [giant]);
    expect(ifAblePlan(offer).required).toBe(1);
    expect(blockingViolations([], offer)).not.toEqual([]);
    expect(blockingViolations([{ blocker: bears, attacker: giant }], offer)).toEqual([]);
  });

  it("a driver that doesn't choose sends two", () => {
    const { game, a } = table();
    const giant = gorm(game);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [giant]);
    const fixed = obeyingLure([], offer);
    expect(fixed.filter((b) => b.attacker === giant).map((b) => b.blocker).sort()).toEqual([first, second].sort());
    expect(blockingViolations(fixed, offer)).toEqual([]);
  });

  it("menace on top: two obey both, as before", () => {
    const { game, a } = table();
    const giant = gorm(game);
    grant(game, giant, "menace");
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [giant]);
    expect(ifAblePlan(offer).required).toBe(2);
    expect(
      blockingViolations(
        [
          { blocker: first, attacker: giant },
          { blocker: second, attacker: giant },
        ],
        offer,
      ),
    ).toEqual([]);
  });

  it("can't be blocked by more than one: one blocker obeys the one requirement it can", () => {
    const { game, a } = table();
    const giant = gorm(game);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }] }, [ref(giant)]);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [giant]);
    expect(ifAblePlan(offer).required).toBe(1);
    expect(blockingViolations([{ blocker: bears, attacker: giant }], offer)).toEqual([]);
  });
});
