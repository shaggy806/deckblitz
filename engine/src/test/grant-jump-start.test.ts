/**
 * Jump-start given by a one-shot effect until end of turn (rule 702.133a):
 * Filigree Racer's "target instant or sorcery card in your graveyard gains
 * jump-start until end of turn" — a `grant-graveyard-keyword` of
 * `"jump-start"`, read by `Game.flashbacksOf` as a flashback cast for the
 * card's mana cost with a card discarded, then exiled. Beside a flashback the
 * card has too, each is its own way to cast it.
 *
 * Proving card: Filigree Racer (with Snapcaster Mage).
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const RACER = "Filigree Racer";
const graveyardCasts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

/** The Racer entered (four energy), crewed by a creature, attacking bob. */
const attackWithRacer = (game: Game, a: Parameters<typeof attack>[1]): ObjectId => {
  const racer = enter(game, RACER);
  const crew = spawn(game, "Grizzly Bears");
  game.state.objects[crew].summoningSick = false;
  const action: Action = { type: "activate-ability", player: A, source: racer, abilityIndex: 0, targets: [], tap: [crew] };
  game.dispatch(action);
  attack(game, a, [racer]);
  return racer;
};

describe("Filigree Racer — an instant or sorcery card gains jump-start until end of turn", () => {
  it("pays {E}{E} as it attacks: the bolt is cast from the graveyard for its mana cost, a card discarded, then exiled", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    toHand(game, "Grizzly Bears");
    expect(graveyardCasts(game, bolt)).toHaveLength(0);
    pickModes(a, 0);
    pickTargets(a, bolt);
    attackWithRacer(game, a);
    expect(game.state.players[A].energy).toBe(2);
    expect(life(game, B)).toBe(15);
    expect(graveyardCasts(game, bolt)[0]).toMatchObject({ altCostText: "jump-start, discarding a card" });
    const before = { hand: hand(game).length, graveyard: graveyard(game).length };
    cast(game, bolt, { via: "flashback", targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(12);
    expect(zone(game, bolt)).toBe("exile");
    expect(hand(game)).toHaveLength(before.hand - 1);
    expect(graveyard(game)).toHaveLength(before.graveyard);
  });

  it("declined, nothing is paid and nothing gains it; granted, it ends with the turn", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    pickModes(a);
    attackWithRacer(game, a);
    expect(game.state.players[A].energy).toBe(4);
    expect(graveyardCasts(game, bolt)).toHaveLength(0);

    const { game: g2, a: a2 } = table();
    const bolt2 = toGraveyard(g2, "Lightning Bolt");
    lands(g2, "Mountain", 1);
    pickModes(a2, 0);
    pickTargets(a2, bolt2);
    attackWithRacer(g2, a2);
    expect(graveyardCasts(g2, bolt2)).toHaveLength(1);
    nextTurn(g2);
    expect(g2.state.objects[bolt2].grantedGraveyardKeywords ?? []).toEqual([]);
  });

  it("beside a flashback from Snapcaster Mage, each is its own way to cast it", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    pickTargets(a, bolt);
    enter(game, "Snapcaster Mage");
    expect(graveyardCasts(game, bolt)).toHaveLength(1);
    pickModes(a, 0);
    attackWithRacer(game, a);
    const offers = graveyardCasts(game, bolt).map((o) => (o.kind === "cast-spell" ? o.altCostText : undefined));
    expect(offers).toHaveLength(2);
    expect(offers).toContain("jump-start, discarding a card");
  });
});
