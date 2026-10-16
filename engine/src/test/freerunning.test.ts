/**
 * Freerunning (rule 702.173a): an alternative cost a player may pay once a
 * player was dealt combat damage this turn by a creature that, as it dealt
 * it, was an Assassin creature or a commander under their control — and for
 * the rest of that turn, whatever happens to that creature (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, destroy, hand, lands, spawn, table, toHand, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "freerunning");

describe("freerunning", () => {
  it("Eagle Vision for {1}{U} after an Assassin dealt a player combat damage, not before", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    expect(offers(game, vision)).toHaveLength(0);
    const blade = spawn(game, "Hired Blade");
    attack(game, a, [blade]);
    // Gone since: it doesn't matter (the ruling).
    destroy(game, blade);
    expect(offers(game, vision)).toHaveLength(1);
    const before = hand(game, A).length;
    cast(game, vision, { via: "freerunning" });
    expect(zone(game, vision)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("a non-Assassin's combat damage doesn't, nor an opponent's Assassin's", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    expect(offers(game, vision)).toHaveLength(0);
    spawn(game, "Hired Blade", B);
    expect(offers(game, vision)).toHaveLength(0);
  });

  it("a commander's combat damage does", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].isCommander = true;
    attack(game, a, [bears]);
    expect(offers(game, vision)).toHaveLength(1);
  });
});
