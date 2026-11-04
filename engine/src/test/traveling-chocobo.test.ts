/**
 * Traveling Chocobo and Krang: a `doubleTriggers` cause filtered to lands and
 * Birds you control entering, and a new cause, a player drawing a card.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import { A, B, cast, counters, enter, hand, lands, life, nextTurn, settle, spawn, table, toLibrary, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Traveling Chocobo's doubling", () => {
  it("doubles what a land of yours entering causes: landfall and its own enters ability", () => {
    const { game } = table();
    spawn(game, "Traveling Chocobo");
    spawn(game, "Druid Class");
    enter(game, "Wastes");
    expect(life(game, A)).toBe(22);
    enter(game, "A.I.M. Labs");
    // Landfall twice, and the land's own "gain 1 life" twice.
    expect(life(game, A)).toBe(26);
  });

  it("doubles what a Bird entering causes, not what another creature does", () => {
    const { game } = table();
    spawn(game, "Traveling Chocobo");
    spawn(game, "Soul Warden");
    enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(21);
    enter(game, "Storm Crow");
    expect(life(game, A)).toBe(23);
  });

  it("counts itself entering", () => {
    const { game } = table();
    spawn(game, "Soul Warden");
    enter(game, "Traveling Chocobo");
    expect(life(game, A)).toBe(22);
  });

  it("not for an opponent's Bird or land, and only its controller's triggers", () => {
    const { game } = table();
    spawn(game, "Traveling Chocobo");
    spawn(game, "Soul Warden");
    enter(game, "Storm Crow", B);
    expect(life(game, A)).toBe(21);
    // Bob's Warden sees Alice's Bird once: Alice's Chocobo isn't his.
    spawn(game, "Soul Warden", B);
    enter(game, "Storm Crow", A);
    expect(life(game, B)).toBe(21);
    expect(life(game, A)).toBe(23);
  });

  it("stacks: two Chocobos, three times", () => {
    const { game } = table();
    spawn(game, "Traveling Chocobo");
    spawn(game, "Traveling Chocobo");
    spawn(game, "Druid Class");
    enter(game, "Wastes");
    expect(life(game, A)).toBe(23);
  });
});

describe("Traveling Chocobo's library top", () => {
  it("plays a land and casts a Bird from the top, nothing else", () => {
    const { game } = table();
    spawn(game, "Traveling Chocobo");
    lands(game, "Island", 4);
    // A non-Bird on top: not offered.
    expect(offers(game, toLibrary(game, "Grizzly Bears"))).toHaveLength(0);
    const crow = toLibrary(game, "Storm Crow");
    const offered = offers(game, crow);
    expect(offered).toHaveLength(1);
    expect(offered[0].kind === "cast-spell" && offered[0].via).toBe("library-top");
    cast(game, crow, { via: "library-top" });
    expect(zone(game, crow)).toBe("battlefield");
    const land = toLibrary(game, "Forest");
    expect(offers(game, land).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Krang, the All-Powerful", () => {
  it("doubles what any player's draw causes for its controller, its own counter too", () => {
    const { game } = table();
    const krang = spawn(game, "Krang, the All-Powerful");
    spawn(game, "Horizon Chimera");
    // Alice's next turn but one is the first with both on the battlefield from
    // its draw step: Chimera twice, one card, no counter yet.
    nextTurn(game);
    expect(counters(game, krang)).toBe(0);
    const before = life(game, A);
    nextTurn(game);
    expect(life(game, A)).toBe(before + 2);
    expect(counters(game, krang)).toBe(0);
    // Her second card this turn: Chimera twice, Krang's own twice.
    const handBefore = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game, A).length).toBe(handBefore + 1);
    expect(life(game, A)).toBe(before + 4);
    expect(counters(game, krang)).toBe(2);
    // Any player's second card: Bob's, on her turn.
    game.debugApplyEffect(B, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, krang)).toBe(4);
  });

  it("doesn't double an opponent's draw trigger", () => {
    const { game } = table();
    spawn(game, "Krang, the All-Powerful");
    spawn(game, "Horizon Chimera", B);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(life(game, B)).toBe(21);
  });
});
