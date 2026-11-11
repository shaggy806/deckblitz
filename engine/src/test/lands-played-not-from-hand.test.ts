/**
 * Where a played land came from: the journal's `land-played` entry keeps the
 * zone (`from`), so a `turn-history` read of `lands-played` takes `from` /
 * `notFrom` as a graveyard arrival's does — "if you've played a land … this
 * turn from anywhere other than your hand" (Spider-Man 2099). A land an effect
 * puts onto the battlefield isn't played (rule 305.4).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ZoneType } from "../state.js";

import { A, B, cast, lands, life, pickTargets, spawn, table, toGraveyard, toHand, toStep } from "./harness.js";

/** Whether the `turn-history` read holds for alice, asked through a conditional. */
const played = (game: Game, origin: { from?: readonly ZoneType[]; notFrom?: readonly ZoneType[] }): boolean => {
  const before = life(game);
  const effect: EffectSpec = {
    kind: "conditional",
    condition: { kind: "turn-history", what: "lands-played", who: "you", ...origin },
    then: { kind: "gain-life", amount: 1 },
  };
  game.debugApplyEffect(A, effect, [], { source: spawn(game, "Grizzly Bears") });
  return life(game) > before;
};
const playedOutsideHand = (game: Game): boolean => played(game, { notFrom: ["hand"] });

describe("a land played from anywhere other than the hand", () => {
  it("a land from the hand isn't one, and one from the graveyard is", () => {
    const { game } = table();
    spawn(game, "Crucible of Worlds");
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    expect(playedOutsideHand(game)).toBe(false);
    expect(played(game, { from: ["hand"] })).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: toGraveyard(game, "Forest") });
    expect(playedOutsideHand(game)).toBe(true);
  });

  it("a land put onto the battlefield isn't played", () => {
    const { game } = table();
    const forest = toGraveyard(game, "Forest");
    game.debugMove(forest, "battlefield");
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(playedOutsideHand(game)).toBe(false);
  });
});

describe("Spider-Man 2099", () => {
  it("does nothing at the end step after a land and a spell from the hand", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man 2099");
    lands(game, "Island", 2);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    cast(game, toHand(game, "Think Twice"));
    pickTargets(a, B);
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    toStep(game, "cleanup");
    expect(life(game, B)).toBe(20);
  });

  it("deals damage equal to his power after a land played from the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man 2099");
    spawn(game, "Crucible of Worlds");
    game.dispatch({ type: "play-land", player: A, card: toGraveyard(game, "Forest") });
    pickTargets(a, B);
    toStep(game, "cleanup");
    expect(life(game, B)).toBe(18);
  });

  it("and after a spell cast from the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man 2099");
    lands(game, "Island", 3);
    const think = toGraveyard(game, "Think Twice");
    const flashback = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === think);
    if (flashback?.kind !== "cast-spell") throw new Error("no flashback offered");
    game.dispatch({ type: "cast-spell", player: A, card: think, targets: [], via: flashback.via });
    pickTargets(a, B);
    toStep(game, "cleanup");
    expect(life(game, B)).toBe(18);
  });

  it("can't be cast during your first three turns", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const spidey = toHand(game, "Spider-Man 2099");
    expect(game.state.players[A].turnsTaken).toBe(1);
    expect(() => cast(game, spidey)).toThrow();
    game.state.players[A].turnsTaken = 4;
    cast(game, spidey);
    expect(game.state.objects[spidey].zone).toBe("battlefield");
  });
});
