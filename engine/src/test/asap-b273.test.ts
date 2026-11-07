// B273: the cards flagged "Build ASAP" in the library — Loading Zone (no
// engine change: a counter multiplier over creatures, Spacecraft and Planets),
// Tablet of Discovery's "mill a card. You may play that card this turn"
// (`grant-graveyard-cast`'s `cards: "milled-this-way"` and `play`, the card
// found in exile too under rule 701.17c), and Nahiri's Lithoforming's "you may
// play X additional lands this turn" (`additional-land-drop`'s amount) and
// "lands you control enter tapped this turn" (`player-effect`'s
// `entersTapped`).

import { describe, expect, it } from "vitest";
import { A, cast, enter, lands, nextTurn, spawn, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const counters = (game: Game, id: ObjectId, kind: string): number => game.state.objects[id].counters[kind] ?? 0;

const playLand = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "play-land", player: A, card });
};

describe("Loading Zone", () => {
  it("doubles counters put on a creature you control, not on a noncreature artifact", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    enter(game, "Loading Zone");
    const ballista = toHand(game, "Walking Ballista");
    cast(game, ballista, { x: 1 });
    expect(counters(game, ballista, "+1/+1")).toBe(2);
    const cornucopia = toHand(game, "Astral Cornucopia");
    cast(game, cornucopia, { x: 1 });
    expect(counters(game, cornucopia, "charge")).toBe(1);
  });
});

describe("Tablet of Discovery", () => {
  it("mills a land that may be played from the graveyard this turn only", () => {
    const { game } = table();
    const forest = toLibrary(game, "Forest");
    enter(game, "Tablet of Discovery");
    expect(zone(game, forest)).toBe("graveyard");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === forest)).toBe(true);
    playLand(game, forest);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("lets a milled spell be cast this turn, and not on a later turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    enter(game, "Tablet of Discovery");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt)).toBe(false);
  });

  it("finds a card Rest in Peace exiled instead, and lets it be cast from exile (rule 701.17c)", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Rest in Peace");
    const bolt = toLibrary(game, "Lightning Bolt");
    enter(game, "Tablet of Discovery");
    expect(zone(game, bolt)).toBe("exile");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt)).toBe(true);
  });
});

describe("Nahiri's Lithoforming", () => {
  it("sacrifices X lands, draws for each, and allows X more land drops, those lands entering tapped", () => {
    const { game } = table();
    // The test table has no land limit; this one needs the real one.
    game.state.rules = { ...game.state.rules, maxLandsPerTurn: 1 };
    const mountains = lands(game, "Mountain", 6);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    const forests = [toHand(game, "Forest"), toHand(game, "Forest"), toHand(game, "Forest"), toHand(game, "Forest")];
    const handBefore = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Nahiri's Lithoforming"), { x: 2 });
    expect(mountains.filter((id) => zone(game, id) === "battlefield")).toHaveLength(4);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore + 2);
    // The turn's own land drop and two more, each entering tapped.
    for (const forest of forests.slice(0, 3)) {
      playLand(game, forest);
      expect(zone(game, forest)).toBe("battlefield");
      expect(game.state.objects[forest].tapped).toBe(true);
    }
    expect(game.canDispatch({ type: "play-land", player: A, card: forests[3] })).not.toBeNull();
  });

  it("stops making lands enter tapped once the turn is over", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    toLibrary(game, "Island");
    cast(game, toHand(game, "Nahiri's Lithoforming"), { x: 0 });
    nextTurn(game);
    nextTurn(game);
    const forest = toHand(game, "Forest");
    playLand(game, forest);
    expect(game.state.objects[forest].tapped).toBe(false);
  });
});
