/**
 * Sneak (rule 702.190): "Any time you could cast an instant during your
 * declare blockers step, you may cast this spell by paying [cost] and
 * returning an unblocked creature you control to its owner's hand rather
 * than paying this spell's mana cost" — and a permanent spell cast that way
 * enters tapped and attacking what that creature was attacking (702.190b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, hand, lands, life, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const sneakOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "sneak");

/** Alice attacks `defender` with `attackers` and stops in the declare
 * blockers step (no blocks), with priority. */
const attackAndHold = (g: ReturnType<typeof table>, attackers: ObjectId[], defender: PlayerId = B): void => {
  g.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender }));
  toStep(g.game, "declare-blockers");
};

describe("sneak", () => {
  it("isn't offered outside your declare blockers step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Grizzly Bears");
    const raph = toHand(game, "Raphael, the Nightwatcher");
    expect(sneakOffers(game, raph)).toHaveLength(0);
  });

  it("returns an unblocked attacker; the creature enters tapped and attacking that player, double strike and all", () => {
    const g = table({ players: 3 });
    const { game } = g;
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const raph = toHand(game, "Raphael, the Nightwatcher");
    attackAndHold(g, [bears], C);
    const offers = sneakOffers(game, raph);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ sneakReturn: { object: bears } });
    game.dispatch({ type: "cast-spell", player: A, card: raph, targets: [], via: "sneak", sneakReturn: bears });
    expect(zone(game, bears)).toBe("hand");
    settle(game);
    expect(zone(game, raph)).toBe("battlefield");
    expect(game.state.objects[raph].tapped).toBe(true);
    expect(game.state.objects[raph].attacking).toBe(C);
    toStep(game, "postcombat-main");
    // Raphael (2 power, double strike from his own static) hits carol twice.
    expect(life(game, C)).toBe(16);
    expect(life(game, B)).toBe(20);
  });

  it("a sorcery with sneak is cast at instant speed then, for its sneak cost", () => {
    const g = table();
    const { game } = g;
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const technique = toHand(game, "Shredder's Technique");
    attackAndHold(g, [bears]);
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: technique,
      targets: [ref(theirs)],
      via: "sneak",
      sneakReturn: bears,
    });
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(hand(game)).toContain(bears);
    expect(life(game)).toBe(20);
  });

  it("a blocked attacker can't pay it", () => {
    const g = table();
    const { game } = g;
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const raph = toHand(game, "Raphael, the Nightwatcher");
    g.b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attackAndHold(g, [bears]);
    expect(sneakOffers(game, raph)).toHaveLength(0);
  });
});
