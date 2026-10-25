/**
 * Emerge (rule 702.119a): cast by paying the emerge cost and sacrificing a
 * creature rather than paying the mana cost, the total cost reduced by that
 * creature's mana value — generic mana only (the rulings). The creature is
 * chosen with the cost (702.119c), so each one is its own cast offer, and
 * it's sacrificed as the cost is paid: after it has tapped for mana, before
 * any "when you cast" trigger. Wretched Gryff, Elder Deep-Fiend, Decimator
 * of the Provinces.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, lands, pickTargets, pt, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const emergeOffers = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).flatMap((a) => (a.kind === "cast-spell" && a.card === card && a.altCost === true ? [a] : []));

const untapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;

describe("emerge", () => {
  it("offers one cast per creature that could be sacrificed, priced with its mana value off", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Hill Giant", B);
    // {5}{U} less the Giant's 4 is {1}{U}; less the Bears' 2, {3}{U}.
    lands(game, "Island", 2);
    const offers = emergeOffers(game, gryff);
    expect(offers.map((o) => o.sacrifice?.choices)).toEqual([[giant]]);
    expect(offers[0].altCostText).toBe("emerge {5}{U}, sacrificing Hill Giant (−4)");
    lands(game, "Island", 2);
    expect(emergeOffers(game, gryff).map((o) => o.sacrifice?.choices[0])).toEqual(expect.arrayContaining([bears, giant]));
    expect(emergeOffers(game, gryff)).toHaveLength(2);
  });

  it("sacrifices the creature, pays the rest, and its cast trigger resolves first", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    const giant = spawn(game, "Hill Giant");
    const islands = lands(game, "Island", 3);
    toLibrary(game, "Island");
    const handBefore = hand(game).length;
    cast(game, gryff, { altCost: true, sacrifice: giant, settle: false });
    expect(zone(game, giant)).toBe("graveyard");
    expect(untapped(game, islands)).toBe(1);
    // The trigger is on the stack above the creature spell.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    expect(hand(game).length).toBe(handBefore);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, gryff)).toBe("battlefield");
  });

  it("never reduces the coloured mana: a creature worth more than the generic leaves only that", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    const wurm = spawn(game, "Craw Wurm");
    const islands = lands(game, "Island", 1);
    expect(emergeOffers(game, gryff)).toHaveLength(1);
    cast(game, gryff, { altCost: true, sacrifice: wurm });
    expect(untapped(game, islands)).toBe(0);
    expect(zone(game, gryff)).toBe("battlefield");
  });

  it("lets the creature tap for mana before it's sacrificed", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    const elves = spawn(game, "Llanowar Elves");
    // {5}{U} less the Elves' 1 is {4}{U}: four Islands and the Elves' {G}.
    const islands = lands(game, "Island", 4);
    expect(emergeOffers(game, gryff).map((o) => o.sacrifice?.choices[0])).toEqual([elves]);
    cast(game, gryff, { altCost: true, sacrifice: elves });
    expect(zone(game, elves)).toBe("graveyard");
    expect(untapped(game, islands)).toBe(0);
    expect(zone(game, gryff)).toBe("battlefield");
  });

  it("needs a creature to sacrifice, and refuses one that isn't yours", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    lands(game, "Island", 6);
    expect(emergeOffers(game, gryff)).toEqual([]);
    const theirs = spawn(game, "Hill Giant", B);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: gryff, targets: [], altCost: true, sacrifice: theirs }))
      .not.toBeNull();
  });

  it("Elder Deep-Fiend taps up to four target permanents as it's cast, at instant speed", () => {
    const { game, a } = table();
    const fiend = toHand(game, "Elder Deep-Fiend");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = [spawn(game, "Hill Giant", B), spawn(game, "Craw Wurm", B), spawn(game, "Island", B)];
    lands(game, "Island", 5);
    pickTargets(a, ...theirs, null);
    cast(game, fiend, { altCost: true, sacrifice: bears });
    expect(theirs.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, fiend)).toBe("battlefield");
  });

  it("Decimator of the Provinces pumps the team before it enters, so not itself", () => {
    const { game } = table();
    const decimator = toHand(game, "Decimator of the Provinces");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    cast(game, decimator, { altCost: true, sacrifice: giant });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, decimator)).toEqual({ power: 7, toughness: 7 });
  });

  it("a bot or the client echoing the offer casts it", () => {
    const { game } = table();
    const gryff = toHand(game, "Wretched Gryff");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 2);
    const [offer] = emergeOffers(game, gryff);
    cast(game, gryff, { altCost: offer.altCost, sacrifice: offer.sacrifice?.choices.at(-1) });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, gryff)).toBe("battlefield");
  });
});
