/**
 * Which "as this enters, choose …" menus a searching bot plays out
 * (`decisions/choose-creature-type.ts`, `LegalAction.entersWith`): a
 * permanent's own short word menu, as riot's and unleash's question is.
 * Until 2026-11-17 only those two were, and "odd or even" got the first word.
 * What the search then answers is the gate's (`bot/scenarios.ts`, "names even
 * for Ashling's Prerogative …").
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { decisionCandidates } from "../bot/decisions.js";
import type { Game } from "../game.js";
import { A, cast, lands, table, toHand } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "choose-creature-type" }>;

/** Alice casts `name` off `count` of `land`: the menu it asks as it enters. */
function entering(game: Game, name: string, land: string, count: number): Offer {
  lands(game, land, count);
  cast(game, toHand(game, name), { settle: false });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
  const offer = game.legalActions(A).find((o): o is Offer => o.kind === "choose-creature-type");
  if (offer === undefined) throw new Error(`${name} asked nothing as it entered`);
  return offer;
}

const words = (offer: Offer): string[] =>
  (decisionCandidates(offer, A) ?? []).map((a) => (a.type === "choose-creature-type" ? a.creatureType : a.type));

describe("the word menus a bot searches as a permanent enters", () => {
  it("lists both words of 'choose odd or even'", () => {
    const offer = entering(table().game, "Ashling's Prerogative", "Mountain", 2);
    expect(offer.entersWith).toBe("word");
    expect(words(offer)).toEqual(["odd", "even"]);
  });

  it("lists a Siege's two names", () => {
    const offer = entering(table().game, "Frontier Siege", "Forest", 4);
    expect(offer.entersWith).toBe("word");
    expect(words(offer)).toEqual(["Khans", "Dragons"]);
  });

  it("leaves a menu of nine card types to v1's answer", () => {
    const offer = entering(table().game, "Serra's Emissary", "Plains", 7);
    expect(offer.options.length).toBeGreaterThan(5);
    expect(words(offer)).toEqual([]);
  });

  it("leaves a player named as it enters, and a creature type, alone", () => {
    const vise = entering(table({ players: 3 }).game, "Black Vise", "Wastes", 1);
    expect(vise.entersWith).toBeUndefined();
    expect(words(vise)).toEqual([]);
    const incubator = entering(table().game, "Urza's Incubator", "Wastes", 3);
    expect(incubator.catalog).toBe(true);
    expect(incubator.entersWith).toBeUndefined();
    expect(words(incubator)).toEqual([]);
  });
});
