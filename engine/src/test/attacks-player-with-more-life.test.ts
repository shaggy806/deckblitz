/**
 * "Whenever Namor attacks a player who has more life than you" (the `attacks`
 * trigger's `defenderLife: "more-than-you"`, a trigger condition asked as the
 * attack is declared) and "other creatures you control attacking **that
 * player**" (the `attackingPlayerRef` filter clause, bound to the attacked
 * player as the effect applies: the player, not a planeswalker of theirs —
 * rule 506.3). Namor, Atlantean King. And a target "attacking the same player
 * or planeswalker" as the source (`attackingSameAsSource`): Kitesail Skirmisher.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, cast, keywords, lands, life, spawn, table, toHand, tokensNamed, toStep, watchTargets } from "./harness.js";
import type { ScriptedController } from "../controller.js";

const setLife = (game: Game, player: PlayerId, n: number): void => {
  game.state.players[player].life = n;
};

/** Each attacker at its defender, then on to the second main phase. */
const attackEach = (game: Game, seat: ScriptedController, plan: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void => {
  seat.declareAttackersFn = () => plan.map(([attacker, defender]) => ({ attacker, defender }));
  toStep(game, "postcombat-main", seat.playerId);
};

describe("Namor, Atlantean King: attacks a player who has more life than you", () => {
  it("other creatures attacking that player get +2/+0", () => {
    const { game, a } = table();
    const namor = spawn(game, "Namor, Atlantean King");
    const bears = spawn(game, "Grizzly Bears");
    setLife(game, B, 25);
    attackEach(game, a, [
      [namor, B],
      [bears, B],
    ]);
    // Namor 2 (not pumped: "other") and the Bears 2 + 2.
    expect(life(game, B)).toBe(19);
  });

  it("doesn't trigger against a player with as much life as you", () => {
    const { game, a } = table();
    const namor = spawn(game, "Namor, Atlantean King");
    const bears = spawn(game, "Grizzly Bears");
    attackEach(game, a, [
      [namor, B],
      [bears, B],
    ]);
    expect(life(game, B)).toBe(16);
  });

  it("only creatures attacking that player, not another player or that player's planeswalker", () => {
    const { game, a } = table({ players: 3 });
    const namor = spawn(game, "Namor, Atlantean King");
    const atB = spawn(game, "Grizzly Bears");
    const atC = spawn(game, "Grizzly Bears");
    const atWalker = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Jace Beleren", B);
    setLife(game, B, 30);
    setLife(game, C, 30);
    const loyalty = game.state.objects[walker].counters["loyalty"] ?? 0;
    attackEach(game, a, [
      [namor, B],
      [atB, B],
      [atC, C],
      [atWalker, walker],
    ]);
    expect(life(game, B)).toBe(30 - 2 - 4);
    expect(life(game, C)).toBe(28);
    expect(game.state.objects[walker].counters["loyalty"] ?? 0).toBe(Math.max(0, loyalty - 2));
  });
});

describe("Kitesail Skirmisher: another target creature attacking the same player or planeswalker", () => {
  it("offers only the creatures attacking what it attacks, and gives the one chosen flying", () => {
    const { game, a } = table({ players: 3 });
    const kite = spawn(game, "Kitesail Skirmisher");
    const withIt = spawn(game, "Grizzly Bears");
    const alsoWithIt = spawn(game, "Hill Giant");
    const atC = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [alsoWithIt]);
    attackEach(game, a, [
      [kite, B],
      [withIt, B],
      [alsoWithIt, B],
      [atC, C],
    ]);
    expect(seen.asked).toBe(1);
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([withIt, alsoWithIt].sort());
    expect(keywords(game, alsoWithIt)).toContain("flying");
    expect(keywords(game, withIt)).not.toContain("flying");
    expect(keywords(game, home)).not.toContain("flying");
  });

  it("the same planeswalker, not its controller", () => {
    const { game, a } = table();
    const kite = spawn(game, "Kitesail Skirmisher");
    const walker = spawn(game, "Jace Beleren", B);
    const atWalker = spawn(game, "Grizzly Bears");
    const atPlayer = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, (offered) => [offered[0]?.[0] ?? null]);
    attackEach(game, a, [
      [kite, walker],
      [atWalker, walker],
      [atPlayer, B],
    ]);
    // One legal target is picked without asking.
    if (seen.asked > 0) expect(seen.offered[0]).toEqual([atWalker]);
    expect(keywords(game, atWalker)).toContain("flying");
    expect(keywords(game, atPlayer)).not.toContain("flying");
  });
});

describe("Namor, Atlantean King: whenever you cast a noncreature spell", () => {
  it("makes a 1/1 Merfolk for a noncreature spell, none for a creature spell", () => {
    const { game } = table();
    spawn(game, "Namor, Atlantean King");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
  });
});
