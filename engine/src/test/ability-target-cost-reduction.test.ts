/**
 * "This ability costs {N} less to activate if it targets …" — an activated
 * ability's `targetCostReduction` (rules 602.2b, 601.2c, 601.2f): the cost is
 * fixed once the targets are chosen, so the activation pays less when they
 * earn it, a target that stops earning it later changes nothing, and an
 * offer only affordable with it offers only the targets that do. Raft
 * Security Officer here ("a creature with power 3 or less"); Wayta, Trainer
 * Prodigy's "two creatures you control" is in `commanders-ready-4`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, lands, ref, settle, spawn, table } from "./harness.js";

const officerOffer = (game: Game, officer: ObjectId) =>
  game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === officer);
const offeredTargets = (game: Game, officer: ObjectId): readonly unknown[] => {
  const offer = officerOffer(game, officer);
  return offer?.kind === "activate-ability" ? (offer.targetOptions?.[0] ?? []) : [];
};

describe("Raft Security Officer", () => {
  it("taps a creature with power 3 or less for {1}", () => {
    const { game } = table();
    const officer = spawn(game, "Raft Security Officer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    activate(game, officer, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("with only {1}, offers only creatures with power 3 or less, and refuses a bigger one", () => {
    const { game } = table();
    const officer = spawn(game, "Raft Security Officer");
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    lands(game, "Plains", 1);
    expect(offeredTargets(game, officer)).toContainEqual(ref(bears));
    expect(offeredTargets(game, officer)).not.toContainEqual(ref(wurm));
    expect(game.canDispatch({ type: "activate-ability", player: A, source: officer, abilityIndex: 0, targets: [ref(wurm)] })).not.toBeNull();
  });

  it("with {2}, taps the bigger one too, paying both", () => {
    const { game } = table();
    const officer = spawn(game, "Raft Security Officer");
    const wurm = spawn(game, "Craw Wurm", B);
    const plains = lands(game, "Plains", 2);
    expect(offeredTargets(game, officer)).toContainEqual(ref(wurm));
    activate(game, officer, 0, { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].tapped).toBe(true);
    expect(plains.every((p) => game.state.objects[p].tapped)).toBe(true);
  });

  it("pays {1} for a small target and leaves the other land untapped", () => {
    const { game } = table();
    const officer = spawn(game, "Raft Security Officer");
    const bears = spawn(game, "Grizzly Bears", B);
    const plains = lands(game, "Plains", 2);
    activate(game, officer, 0, { targets: [ref(bears)] });
    expect(plains.filter((p) => game.state.objects[p].tapped)).toHaveLength(1);
  });

  it("still taps a creature pumped past power 3 in response — the cost was already fixed", () => {
    const { game } = table();
    const officer = spawn(game, "Raft Security Officer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    activate(game, officer, 0, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(game.characteristics(bears).power).toBe(4);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
