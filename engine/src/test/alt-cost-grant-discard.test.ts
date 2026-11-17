/**
 * A granted alternative cost paid by discarding (rule 118.9): Dream Halls'
 * "rather than pay the mana cost for a spell, its controller may discard a
 * card that shares a color with that spell" — every player's spells
 * (`anyPlayer`), the card chosen as the cost is paid with the spell on the
 * stack (601.2h), sharing a color with the spell as it's cast (rule 105.2;
 * a split card's half, 709.3), never a colorless spell, and only the mana
 * cost replaced (its ruling: additional costs are still paid).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, hand, life, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const altOffers = (game: Game, card: ObjectId, player: PlayerId = A): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game
    .legalActions(player)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card && a.altCost === true);

/** A hand of only what the test puts there. */
const emptyHand = (game: Game, player: PlayerId = A): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "graveyard");
};

describe("Dream Halls — discard a card that shares a color rather than pay", () => {
  it("is offered only with a card sharing a color in hand, and discards it", () => {
    const { game } = table();
    emptyHand(game);
    spawn(game, "Dream Halls");
    const divination = toHand(game, "Divination");
    toHand(game, "Grizzly Bears");
    toHand(game, "Mountain");
    expect(altOffers(game, divination)).toEqual([]);
    const opt = toHand(game, "Opt");
    const [offer] = altOffers(game, divination);
    expect(offer?.altCostText).toBe("discard a card that shares a color with that spell");
    cast(game, divination, { altCost: true });
    expect(zone(game, opt)).toBe("graveyard");
    expect(zone(game, divination)).toBe("graveyard");
    // Bears and Mountain kept, two cards drawn.
    expect(hand(game)).toHaveLength(4);
  });

  it("reaches every player's spells, not only its controller's", () => {
    const { game } = table();
    spawn(game, "Dream Halls");
    nextTurn(game);
    emptyHand(game, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const shock = toHand(game, "Shock", B);
    expect(altOffers(game, bolt, B)).toHaveLength(1);
    cast(game, bolt, { player: B, targets: [ref(A)], altCost: true });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
  });

  it("never offers a colorless spell", () => {
    const { game } = table();
    spawn(game, "Dream Halls");
    const stone = toHand(game, "Mind Stone");
    toHand(game, "Opt");
    toHand(game, "Lightning Bolt");
    expect(altOffers(game, stone)).toEqual([]);
  });

  it("reads a split card's half by its own color", () => {
    const { game } = table();
    emptyHand(game);
    spawn(game, "Dream Halls");
    const fireIce = toHand(game, "Fire // Ice");
    const bolt = toHand(game, "Lightning Bolt");
    // Only Fire (red) shares a color with the Bolt; Ice is blue.
    const offers = altOffers(game, fireIce);
    expect(offers.map((o) => o.face)).toEqual([1]);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, fireIce, { face: 1, targets: [ref(bears)], altCost: true, division: [2] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("replaces only the mana cost: an additional cost is still paid", () => {
    const { game } = table();
    emptyHand(game);
    spawn(game, "Dream Halls");
    const fodder = spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Hill Giant", B);
    const splinters = toHand(game, "Bone Splinters");
    const rats = toHand(game, "Typhoid Rats");
    cast(game, splinters, { targets: [ref(victim)], sacrifice: fodder, altCost: true });
    expect(zone(game, rats)).toBe("graveyard");
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, victim)).toBe("graveyard");
  });
});
