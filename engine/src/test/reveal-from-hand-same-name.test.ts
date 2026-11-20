/**
 * Revealing a card from your hand and searching for a card with its name —
 * Infernal Tutor: a `look-and-choose` from the hand kept there
 * (`destination: "reveal"`), whose `then` searches with `sameNameWith: 0`
 * (rule 201.2a), and its hellbent "instead", read as it resolves.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, activate, cast, hand, lands, life, nextTurn, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type T = ReturnType<typeof table>;

/** Alice answers every zone choice with the first offered card named `name`,
 * recording what each question offered. */
function answerByName(t: T, name: string): (readonly ObjectId[])[] {
  const offered: (readonly ObjectId[])[] = [];
  t.a.chooseFromZoneFn = (_view, eligible) => {
    offered.push(eligible);
    const hit = eligible.find((id) => t.game.state.objects[id].cardName === name);
    return hit === undefined ? [] : [hit];
  };
  return offered;
}

describe("Infernal Tutor", () => {
  it("finds a card with the same name as the one revealed, which stays in hand", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 2);
    const tutor = toHand(game, "Infernal Tutor");
    const bolt = toHand(game, "Lightning Bolt");
    toHand(game, "Shock");
    const shockDeep = toLibrary(game, "Shock");
    const boltDeep = toLibrary(game, "Lightning Bolt");
    const offered = answerByName(t, "Lightning Bolt");
    cast(game, tutor);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, boltDeep)).toBe("hand");
    expect(zone(game, shockDeep)).toBe("library");
    // The reveal offered the hand (not the tutor itself), the search only Bolts.
    expect(offered[0]).toContain(bolt);
    expect(offered[0]).not.toContain(tutor);
    expect(offered[1]).toContain(boltDeep);
    expect(offered[1]).not.toContain(shockDeep);
  });

  it("finds nothing when no card in the library shares the name", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 2);
    const tutor = toHand(game, "Infernal Tutor");
    toHand(game, "Lightning Bolt");
    const shockDeep = toLibrary(game, "Shock");
    answerByName(t, "Lightning Bolt");
    const before = hand(game).length;
    cast(game, tutor);
    expect(zone(game, shockDeep)).toBe("library");
    expect(hand(game).length).toBe(before - 1);
  });

  it("hellbent: with no other card in hand, any card is found", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 2);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    const tutor = toHand(game, "Infernal Tutor");
    const shockDeep = toLibrary(game, "Shock");
    const offered = answerByName(t, "Shock");
    cast(game, tutor);
    expect(zone(game, shockDeep)).toBe("hand");
    expect(offered.length).toBe(1);
    expect(hand(game)).toEqual([shockDeep]);
    expect(game.state.players[A].life).toBe(20);
  });
});

describe("Assembly Hall", () => {
  it("reveals a creature card in hand and finds one with its name", () => {
    const t = table();
    const { game } = t;
    const hall = spawn(game, "Assembly Hall");
    lands(game, "Swamp", 4);
    const bears = toHand(game, "Grizzly Bears");
    const deep = toLibrary(game, "Grizzly Bears");
    const offered = answerByName(t, "Grizzly Bears");
    activate(game, hall, 0);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, deep)).toBe("hand");
    expect(offered[1]).toEqual([deep]);
  });

  it("with no creature card in hand, the search finds nothing", () => {
    const t = table();
    const { game } = t;
    const hall = spawn(game, "Assembly Hall");
    lands(game, "Swamp", 4);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    toHand(game, "Lightning Bolt");
    const deep = toLibrary(game, "Lightning Bolt");
    const offered = answerByName(t, "Lightning Bolt");
    activate(game, hall, 0);
    expect(zone(game, deep)).toBe("library");
    expect(offered.flat()).not.toContain(deep);
  });
});

describe("Priest of the Wakening Sun", () => {
  it("gains 2 life at your upkeep when you reveal a Dinosaur card, which stays in hand", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Priest of the Wakening Sun");
    const dino = toHand(game, "Ancient Brontodon");
    const offered = answerByName(t, "Ancient Brontodon");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(life(game)).toBe(22);
    expect(zone(game, dino)).toBe("hand");
    expect(offered[0]).toEqual([dino]);
  });

  it("revealing nothing gains nothing, and a non-Dinosaur can't be revealed", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Priest of the Wakening Sun");
    toHand(game, "Grizzly Bears");
    answerByName(t, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    expect(life(game)).toBe(20);
  });

  it("sacrifices itself to find a Dinosaur card", () => {
    const t = table();
    const { game } = t;
    const priest = spawn(game, "Priest of the Wakening Sun");
    lands(game, "Plains", 5);
    toLibrary(game, "Grizzly Bears");
    const dino = toLibrary(game, "Ancient Brontodon");
    answerByName(t, "Ancient Brontodon");
    activate(game, priest, 0);
    expect(zone(game, priest)).toBe("graveyard");
    expect(zone(game, dino)).toBe("hand");
  });
});
