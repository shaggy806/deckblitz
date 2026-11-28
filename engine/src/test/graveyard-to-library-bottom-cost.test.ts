/**
 * "Put N cards from your graveyard on the bottom of your library" as a price
 * — Gurzigost's upkeep "sacrifice this creature unless you put two cards …"
 * (a `may` look-and-choose, sacrificed with fewer there) and Battlefield
 * Scrounger's activation cost (a `do` act, paid as a library move last —
 * rule 601.2h — and only with that many there, 118.3). The cards' order on
 * the bottom is their owner's (401.4).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  activate,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toStep,
  zone,
} from "./harness.js";

describe("Gurzigost", () => {
  it("puts the two chosen graveyard cards on the bottom, and stays", () => {
    const { game, a } = table();
    const gurz = spawn(game, "Gurzigost");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Llanowar Elves");
    const left = toGraveyard(game, "Forest");
    pickModes(a, 0);
    const offered = pickFromZone(a, one, two);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, gurz)).toBe("battlefield");
    expect(offered.offered).toEqual(expect.arrayContaining([one, two, left]));
    const lib = game.state.zones.perPlayer[A].library;
    expect(new Set(lib.slice(-2))).toEqual(new Set([one, two]));
    expect(graveyard(game)).toEqual([left]);
  });

  it("is sacrificed with only one card in the graveyard, nothing put", () => {
    const { game } = table();
    const gurz = spawn(game, "Gurzigost");
    const one = toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, gurz)).toBe("graveyard");
    expect(zone(game, one)).toBe("graveyard");
  });

  it("is sacrificed when its controller declines", () => {
    const { game, a } = table();
    const gurz = spawn(game, "Gurzigost");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, gurz)).toBe("graveyard");
  });

  it("{G}{G}, discard a card: offered, and paid by a discard", () => {
    const { game } = table();
    const gurz = spawn(game, "Gurzigost");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    activate(game, gurz, 0);
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Battlefield Scrounger", () => {
  const board = (cards: number) => {
    const { game, a } = table();
    const scrounger = spawn(game, "Battlefield Scrounger");
    const yard = Array.from({ length: cards }, () => toGraveyard(game, "Grizzly Bears"));
    return { game, a, scrounger, yard };
  };
  const offered = (game: ReturnType<typeof table>["game"], source: string) =>
    game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === source);

  it("isn't offered without threshold", () => {
    const { game, scrounger } = board(6);
    expect(offered(game, scrounger)).toBe(false);
  });

  it("puts the three chosen on the bottom and gets +3/+3, once a turn", () => {
    const { game, a, scrounger, yard } = board(7);
    expect(offered(game, scrounger)).toBe(true);
    pickFromZone(a, yard[0], yard[1], yard[2]);
    activate(game, scrounger, 0);
    expect(pt(game, scrounger)).toEqual({ power: 6, toughness: 6 });
    const lib = game.state.zones.perPlayer[A].library;
    expect(new Set(lib.slice(-3))).toEqual(new Set(yard.slice(0, 3)));
    expect(graveyard(game)).toHaveLength(4);
    // Threshold would be met again with three more, but once each turn.
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Forest");
    expect(offered(game, scrounger)).toBe(false);
  });
});
