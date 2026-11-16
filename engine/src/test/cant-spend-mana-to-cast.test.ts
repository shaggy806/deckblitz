/**
 * "You can't spend mana to cast this spell" (Hogaak, Arisen Necropolis):
 * convoke and delve (rules 702.51a, 702.66a) pay its whole total cost, or it
 * can't be cast — what they leave can't be paid (rule 601.2h). A black or
 * green creature pays each {B/G} (a hybrid symbol is each of its colours,
 * rule 107.4e); graveyard cards or any creatures the {5}. The cast offer
 * prices the two together: the fewest cards delve may exile, and the
 * creatures that pay the rest for each number delved (`proofByDelve`).
 */

import { describe, expect, it } from "vitest";

import { convokeProofFor, delvePicks } from "../actions.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offersFor = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

const fillGraveyard = (game: Game, n: number): ObjectId[] =>
  Array.from({ length: n }, () => toGraveyard(game, "Grizzly Bears"));

describe("Hogaak, Arisen Necropolis", () => {
  it("can't be cast with mana, however much there is", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
    expect(offersFor(game, hogaak)).toEqual([]);
    expect(() => cast(game, hogaak)).toThrow(/can't be cast with mana/);
  });

  it("five cards delved and two black creatures convoking pay it all, no land tapped", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 2);
    const zombies = [spawn(game, "Walking Corpse"), spawn(game, "Walking Corpse")];
    const cards = fillGraveyard(game, 5);
    const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
    const [offer] = offersFor(game, hogaak);
    expect(offer.delve).toMatchObject({ minCards: 5, maxCards: 5 });
    expect(offer.convoke?.manaAffordable).toBe(false);
    expect(offer.convoke?.proofByDelve?.[5]?.map((p) => p.creature).sort()).toEqual([...zombies].sort());
    cast(game, hogaak, { delve: cards, convoke: zombies.map((creature) => ({ creature })) });
    expect(zone(game, hogaak)).toBe("battlefield");
    for (const id of cards) expect(zone(game, id)).toBe("exile");
    for (const id of zombies) expect(game.state.objects[id].tapped).toBe(true);
    for (const id of swamps) expect(game.state.objects[id].tapped).toBe(false);
  });

  it("a {B/G} left for mana refuses the cast: one black creature, five cards and a Swamp", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const zombie = spawn(game, "Walking Corpse");
    const cards = fillGraveyard(game, 5);
    const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
    expect(offersFor(game, hogaak)).toEqual([]);
    expect(() => cast(game, hogaak, { delve: cards, convoke: [{ creature: zombie }] })).toThrow(/can't be cast with mana/);
  });

  it("colorless creatures pay only the {5}: seven artifact creatures can't cast it", () => {
    const { game } = table();
    for (let i = 0; i < 7; i += 1) spawn(game, "Ornithopter");
    fillGraveyard(game, 5);
    const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
    expect(offersFor(game, hogaak)).toEqual([]);
  });

  it("seven creatures, two of them green, cast it with nothing delved", () => {
    const { game } = table();
    const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves")];
    const others = Array.from({ length: 5 }, () => spawn(game, "Ornithopter"));
    fillGraveyard(game, 3);
    const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
    const [offer] = offersFor(game, hogaak);
    expect(offer.delve).toMatchObject({ minCards: 0, maxCards: 3 });
    cast(game, hogaak, { convoke: [...elves, ...others].map((creature) => ({ creature })) });
    expect(zone(game, hogaak)).toBe("battlefield");
  });

  it("cards and creatures share the {5}: the offer's ends both cast it", () => {
    for (const take of ["most", "fewest"] as const) {
      const { game } = table();
      spawn(game, "Walking Corpse");
      spawn(game, "Llanowar Elves");
      spawn(game, "Ornithopter");
      spawn(game, "Ornithopter");
      fillGraveyard(game, 4);
      const hogaak = toHand(game, "Hogaak, Arisen Necropolis");
      const [offer] = offersFor(game, hogaak);
      // Four creatures: the two {B/G} and two of the {5}, so at least three delved.
      expect(offer.delve).toMatchObject({ minCards: 3, maxCards: 4 });
      const delve = delvePicks(offer.delve!, 0, take)!;
      expect(delve.length).toBe(take === "most" ? 4 : 3);
      const convoke = convokeProofFor(offer.convoke!, 0, undefined, delve.length);
      expect(convoke.length).toBe(take === "most" ? 3 : 4);
      cast(game, hogaak, { delve, convoke });
      expect(zone(game, hogaak)).toBe("battlefield");
    }
  });

  it("is cast from the graveyard, never delving itself", () => {
    const { game } = table();
    const zombies = [spawn(game, "Walking Corpse"), spawn(game, "Walking Corpse")];
    const hogaak = toGraveyard(game, "Hogaak, Arisen Necropolis");
    const cards = fillGraveyard(game, 5);
    const [offer] = offersFor(game, hogaak);
    expect(offer.via).toBe("graveyard-permission");
    expect(offer.delve?.choices).not.toContain(hogaak);
    cast(game, hogaak, {
      via: "graveyard-permission",
      delve: cards,
      convoke: zombies.map((creature) => ({ creature })),
    });
    expect(zone(game, hogaak)).toBe("battlefield");
  });
});
