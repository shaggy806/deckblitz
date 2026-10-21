import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, cast, counters, graveyard, hand, lands, spawn, table, toGraveyard, zone } from "./harness.js";

// Jump-start (rule 702.133a): cast from your graveyard by discarding a card
// in addition to its other costs, then exiled as it leaves the stack — the
// flashback cast for the card's own mana cost with `discard: 1`. Mentor
// (702.134a): a +1/+1 counter on target attacking creature with lesser power.

const graveyardCasts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

describe("jump-start", () => {
  it("casts Radical Idea from the graveyard for its mana cost, discarding a card, then exiles it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const idea = toGraveyard(game, "Radical Idea");
    expect(graveyardCasts(game, idea)[0]).toMatchObject({ altCostText: "jump-start, discarding a card" });
    const before = hand(game).length;
    cast(game, idea, { via: "flashback" });
    // One card discarded for the cost, one drawn; the Idea gone, the discard in.
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(graveyard(game)).toHaveLength(1);
    expect(zone(game, idea)).toBe("exile");
  });

  it("isn't offered with no card in hand to discard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const idea = toGraveyard(game, "Radical Idea");
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    expect(hand(game)).toHaveLength(0);
    expect(graveyardCasts(game, idea)).toHaveLength(0);
  });
});

describe("mentor", () => {
  it("puts a counter on an attacking creature with lesser power", () => {
    const { game, a } = table();
    const sergeant = spawn(game, "Barging Sergeant");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [sergeant, bears]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, sergeant)).toBe(0);
  });
});
