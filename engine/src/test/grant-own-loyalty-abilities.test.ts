/**
 * `grantsActivatedOf` over its own permanent (`zone: "source"`): "each other
 * planeswalker you control has the loyalty abilities of Kasmina" (Kasmina,
 * Enigma Sage). Each granted ability works from the planeswalker that has it
 * (rule 201.5b): its loyalty pays, its one loyalty activation a turn is spent
 * (606.3), and the −8's "shares a color with this planeswalker" reads its
 * colors (Kasmina's ruling). What Kasmina has is what it gives: a loyalty
 * ability granted to it (Teferi's Talent's) goes to the others too.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, counters, named, pickFromZone, settle, spawn, table, toLibrary, zone } from "./harness.js";
import { invalidateComputedCache } from "../characteristics.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

const KASMINA = "Kasmina, Enigma Sage";
const PLUS = "+2: Scry 1.";
const MINUS_X = "−X: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.";
const ULT = "−8: Search your library for an instant or sorcery card that shares a color with this planeswalker";

const offers = (game: Game, id: ObjectId, player: PlayerId = A): Activate[] =>
  game.legalActions(player).filter((a): a is Activate => a.kind === "activate-ability" && a.source === id);
const offer = (game: Game, id: ObjectId, text: string): Activate => {
  const found = offers(game, id).find((a) => a.text.startsWith(text));
  if (found === undefined) throw new Error(`no "${text}" offered on ${game.state.objects[id].cardName}`);
  return found;
};
const walker = (game: Game, name: string, loyalty: number, player: PlayerId = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].counters.loyalty = loyalty;
  return id;
};

describe("Kasmina, Enigma Sage — each other planeswalker you control has its loyalty abilities", () => {
  it("gives them to each other planeswalker you control, not an opponent's, and not twice to itself", () => {
    const { game } = table();
    const kasmina = walker(game, KASMINA, 8);
    const liliana = walker(game, "Liliana of the Veil", 8);
    const jace = walker(game, "Jace, Mirror Mage", 8, B);
    const lilianaTexts = [...new Set(offers(game, liliana).map((a) => a.text))];
    for (const text of [PLUS, MINUS_X]) expect(lilianaTexts).toContain(text);
    expect(lilianaTexts.some((t) => t.startsWith(ULT))).toBe(true);
    // Her own three as well.
    expect(lilianaTexts.length).toBe(6);
    expect(new Set(offers(game, kasmina).map((a) => a.text)).size).toBe(3);
    expect(new Set(offers(game, kasmina).map((a) => a.abilityIndex)).size).toBe(3);
    // Jace is bob's: nothing of Kasmina's, and bob isn't offered it either.
    expect(offers(game, jace, B).some((a) => a.text === PLUS)).toBe(false);
    // Kasmina gone, the grant goes with it.
    game.debugMove(kasmina, "graveyard");
    invalidateComputedCache();
    expect(offers(game, liliana).some((a) => a.text === PLUS)).toBe(false);
  });

  it("a granted −X is paid from that planeswalker's loyalty and spends its one activation this turn", () => {
    const { game } = table();
    const kasmina = walker(game, KASMINA, 2);
    const liliana = walker(game, "Liliana of the Veil", 3);
    activate(game, liliana, offer(game, liliana, MINUS_X).abilityIndex, { x: 2 });
    settle(game);
    expect(game.state.objects[liliana].counters.loyalty).toBe(1);
    expect(game.state.objects[kasmina].counters.loyalty).toBe(2);
    const fractals = named(game, "Fractal Token", A);
    expect(fractals).toHaveLength(1);
    expect(counters(game, fractals[0])).toBe(2);
    // Liliana has used hers (rule 606.3); Kasmina hasn't.
    expect(offers(game, liliana)).toHaveLength(0);
    expect(offers(game, kasmina).some((a) => a.text === PLUS)).toBe(true);
  });

  it("the −8 on another planeswalker finds a card sharing a color with that one, not with Kasmina", () => {
    const { game, a } = table();
    walker(game, KASMINA, 2);
    const liliana = walker(game, "Liliana of the Veil", 8);
    const blue = toLibrary(game, "Divination");
    const black = toLibrary(game, "Duress");
    const seen = pickFromZone(a, black);
    a.chooseCastNowFn = () => null;
    activate(game, liliana, offer(game, liliana, ULT).abilityIndex);
    settle(game);
    expect(seen.offered).toContain(black);
    expect(seen.offered).not.toContain(blue);
    // Paid from Liliana's eight: none left, so she's gone (rule 704.5i).
    expect(zone(game, liliana)).toBe("graveyard");
    expect(zone(game, black)).toBe("exile");
  });

  it("Kasmina's own −8 reads its colors, and casts the card it found for free", () => {
    const { game, a } = table();
    const kasmina = walker(game, KASMINA, 8);
    const blue = toLibrary(game, "Divination");
    const black = toLibrary(game, "Duress");
    const seen = pickFromZone(a, blue);
    a.chooseCastNowFn = (_view, castOffer) => ({
      type: "cast-spell",
      player: A,
      card: castOffer.casts[0].card,
      targets: [],
      via: "effect",
      free: true,
    });
    const handBefore = game.state.zones.perPlayer[A].hand.length;
    activate(game, kasmina, offer(game, kasmina, ULT).abilityIndex);
    settle(game);
    expect(seen.offered).toContain(blue);
    expect(seen.offered).not.toContain(black);
    // Divination resolved: two cards drawn, the spell in the graveyard.
    expect(zone(game, blue)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore + 2);
  });

  it("a loyalty ability granted to Kasmina (Teferi's Talent's −12) goes to the others too", () => {
    const { game } = table();
    const kasmina = walker(game, KASMINA, 12);
    const liliana = walker(game, "Liliana of the Veil", 12);
    const twelve = (id: ObjectId): boolean => offers(game, id).some((x) => x.loyalty === -12);
    expect(twelve(liliana)).toBe(false);
    const talent = spawn(game, "Teferi's Talent");
    game.state.objects[talent].attachedTo = kasmina;
    invalidateComputedCache();
    expect(twelve(kasmina)).toBe(true);
    expect(twelve(liliana)).toBe(true);
  });
});
