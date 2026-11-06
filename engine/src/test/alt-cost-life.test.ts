/**
 * Alternative costs paid in life or a life change (rule 118.9): a fixed amount
 * under a condition (Snuff Out), having another player gain life (Invigorate,
 * Reverent Silence), and life equal to the spell's mana value — a once-a-turn
 * static's (Demon of Fate's Design), a next-spell grant's (Marshland
 * Bloodcaster), an impulse's only way to cast (Inside Information). And the
 * choice among several alternative costs (rules 118.9a, 601.2b).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  enter,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const altOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  offers(game, card, player).filter((a) => a.altCost === true);

describe("a fixed life payment under a condition (Snuff Out)", () => {
  it("costs 4 life with a Swamp, and destroys a nonblack creature for good", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const snuff = toHand(game, "Snuff Out");
    const [offer] = altOffers(game, snuff);
    expect(offer.altCostText).toBe("pay 4 life");
    cast(game, snuff, { targets: [ref(bears)], altCost: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(16);
  });

  it("isn't offered without a Swamp or the life, and needs its mana cost then", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    const snuff = toHand(game, "Snuff Out");
    expect(altOffers(game, snuff)).toEqual([]);
    lands(game, "Swamp", 1);
    expect(altOffers(game, snuff).length).toBe(1);
    game.state.players[A].life = 3;
    expect(altOffers(game, snuff)).toEqual([]);
  });
});

describe("having another player gain life (Invigorate, Reverent Silence)", () => {
  it("has the opponent gain 3 life, for no mana", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    const invigorate = toHand(game, "Invigorate");
    cast(game, invigorate, { targets: [ref(bears)], altCost: true });
    expect(life(game, B)).toBe(23);
    expect(life(game, A)).toBe(20);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });

  it("offers each opponent as a variant, and the one named gains the life", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    const invigorate = toHand(game, "Invigorate");
    const variants = altOffers(game, invigorate);
    expect(variants.map((v) => v.altCostGainer)).toEqual([B, C]);
    const second = variants[1];
    cast(game, invigorate, { targets: [ref(bears)], altCost: true, altCostIndex: second.altCostIndex });
    expect(life(game, C)).toBe(23);
    expect(life(game, B)).toBe(20);
  });

  it("has every other player gain the life for Reverent Silence", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 1);
    const silence = toHand(game, "Reverent Silence");
    const glory = spawn(game, "Glorious Anthem", B);
    const [offer] = altOffers(game, silence);
    expect(offer.altCostGainer).toBeUndefined();
    cast(game, silence, { targets: [], altCost: true });
    expect(zone(game, glory)).toBe("graveyard");
    expect(life(game, B)).toBe(26);
    expect(life(game, C)).toBe(26);
    expect(life(game, A)).toBe(20);
  });

  it("can't have a player gain life who can't, but can one whose gain is replaced (the rulings)", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Grizzly Bears", A);
    const invigorate = toHand(game, "Invigorate");
    const erebos = enter(game, "Erebos, God of the Dead", A);
    expect(altOffers(game, invigorate)).toEqual([]);
    game.debugMove(erebos, "graveyard");
    const vortex = enter(game, "Sulfuric Vortex", A);
    expect(altOffers(game, invigorate).length).toBe(1);
    const bears = named(game, "Grizzly Bears", A)[0];
    cast(game, invigorate, { targets: [ref(bears)], altCost: true });
    expect(life(game, B)).toBe(20);
    expect(zone(game, vortex)).toBe("battlefield");
  });
});

describe("life equal to the spell's mana value: Demon of Fate's Design", () => {
  it("casts an enchantment for its mana value in life, once each of your turns", () => {
    const { game } = table();
    spawn(game, "Demon of Fate's Design", A);
    const first = toHand(game, "Glorious Anthem");
    const second = toHand(game, "Glorious Anthem");
    expect(altOffers(game, first)[0].altCostText).toBe("pay 3 life");
    cast(game, first, { targets: [], altCost: true });
    expect(zone(game, first)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
    expect(altOffers(game, second)).toEqual([]);
    nextTurn(game);
    nextTurn(game);
    expect(game.activePlayer).toBe(A);
    expect(altOffers(game, second).length).toBe(1);
  });

  it("is for enchantments only, on your own turn, and a new Demon can use it again", () => {
    const { game } = table();
    const demon = spawn(game, "Demon of Fate's Design", A);
    expect(altOffers(game, toHand(game, "Grizzly Bears"))).toEqual([]);
    const anthem = toHand(game, "Glorious Anthem");
    const other = toHand(game, "Glorious Anthem");
    cast(game, anthem, { targets: [], altCost: true });
    expect(altOffers(game, other)).toEqual([]);
    // A second Demon is its own allowance.
    spawn(game, "Demon of Fate's Design", A);
    expect(altOffers(game, other).length).toBe(1);
    expect(zone(game, demon)).toBe("battlefield");
  });

  it("isn't offered when the life can't be paid", () => {
    const { game } = table();
    spawn(game, "Demon of Fate's Design", A);
    const anthem = toHand(game, "Glorious Anthem");
    game.state.players[A].life = 2;
    expect(altOffers(game, anthem)).toEqual([]);
  });

  it("pumps by the sacrificed enchantment's mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const demon = spawn(game, "Demon of Fate's Design", A);
    const anthem = spawn(game, "Glorious Anthem", A);
    game.dispatch({ type: "activate-ability", player: A, source: demon, abilityIndex: 0, targets: [], sacrifice: anthem });
    settle(game);
    expect(zone(game, anthem)).toBe("graveyard");
    expect(pt(game, demon).power).toBe(6 + 3);
  });
});

describe("life equal to the spell's mana value: Marshland Bloodcaster's next spell", () => {
  function ready() {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 2);
    const caster = spawn(game, "Marshland Bloodcaster", A);
    activate(game, caster, 0);
    settle(game);
    return t;
  }

  it("lets the next spell be cast for life, and only that one", () => {
    const { game } = ready();
    const anthem = toHand(game, "Glorious Anthem");
    const bears = toHand(game, "Grizzly Bears");
    expect(altOffers(game, anthem)[0].altCostText).toBe("pay 3 life");
    cast(game, anthem, { targets: [], altCost: true });
    expect(life(game, A)).toBe(17);
    expect(altOffers(game, bears)).toEqual([]);
  });

  it("is used up by a next spell cast for its mana cost (the rulings)", () => {
    const { game } = ready();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    const anthem = toHand(game, "Glorious Anthem");
    cast(game, bears, { targets: [] });
    expect(life(game, A)).toBe(20);
    expect(altOffers(game, anthem)).toEqual([]);
  });

  it("makes X 0 in the life and the spell (rule 107.3b)", () => {
    const { game } = ready();
    const ballista = toHand(game, "Walking Ballista");
    const [offer] = altOffers(game, ballista);
    expect(offer.altCostText).toBe("pay 0 life");
    cast(game, ballista, { targets: [], altCost: true, x: 5 });
    expect(life(game, A)).toBe(20);
    // A 0/0 with X 0: gone as it enters.
    expect(zone(game, ballista)).toBe("graveyard");
  });

  it("takes kicker on top of it (rule 118.9d, the rulings)", () => {
    const { game } = ready();
    lands(game, "Forest", 1);
    const scion = toHand(game, "Burst Lightning");
    const kicked = altOffers(game, scion).filter((o) => o.kicked === true);
    expect(kicked).toEqual([]);
    lands(game, "Mountain", 4);
    const paid = altOffers(game, scion).find((o) => o.kicked === true);
    expect(paid).toBeDefined();
    cast(game, scion, { targets: [ref(B)], altCost: true, kicked: true });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(16);
  });
});

describe("an impulse's only way to cast: Inside Information", () => {
  function exiled(top: string) {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 3);
    const card = toLibrary(game, top, B);
    const info = toHand(game, "Inside Information");
    cast(game, info, { targets: [ref(B)], x: 1 });
    expect(zone(game, card)).toBe("exile");
    return { ...t, card };
  }

  it("casts the spell for life equal to its mana value, and no other way", () => {
    const { game, card } = exiled("Glorious Anthem");
    lands(game, "Plains", 3);
    const [offer, ...rest] = offers(game, card);
    expect(rest).toEqual([]);
    expect(offer.altCost).toBe(true);
    expect(offer.altCostText).toBe("pay 3 life");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [], via: "impulse" })).not.toBeNull();
    cast(game, card, { targets: [], via: "impulse", altCost: true });
    expect(zone(game, card)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
  });

  it("pays only the life for a card with an alternative cost of its own (Gush)", () => {
    const { game, card } = exiled("Gush");
    const islands = lands(game, "Island", 2);
    const [offer, ...rest] = offers(game, card);
    expect(rest).toEqual([]);
    expect(offer.altCostText).toBe("pay 5 life");
    cast(game, card, { targets: [], via: "impulse", altCost: true, altCostIndex: offer.altCostIndex });
    expect(life(game, A)).toBe(15);
    expect(islands.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
  });

  it("plays a land for nothing, with a land drop", () => {
    const { game, card } = exiled("Forest");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card });
    expect(zone(game, card)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });
});

describe("a choice among alternative costs (rules 118.9a, 601.2b)", () => {
  it("offers a card's own and a granted one apart, and pays the one chosen", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const islands = lands(game, "Island", 2);
    const caster = spawn(game, "Marshland Bloodcaster", A);
    activate(game, caster, 0);
    settle(game);
    // Gush's own "return two Islands", or the Bloodcaster's 5 life.
    const gush = toHand(game, "Gush");
    const variants = altOffers(game, gush);
    expect(variants.map((v) => v.altCostIndex)).toEqual([undefined, 1]);
    expect(variants[1].altCostText).toBe("pay 5 life");
    cast(game, gush, { targets: [], altCost: true, altCostIndex: 1 });
    expect(life(game, A)).toBe(15);
    expect(islands.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
  });

  it("offers the granted one when the card's own can't be paid", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const caster = spawn(game, "Marshland Bloodcaster", A);
    activate(game, caster, 0);
    settle(game);
    const gush = toHand(game, "Gush");
    const variants = altOffers(game, gush);
    expect(variants.length).toBe(1);
    expect(variants[0].altCostText).toBe("pay 5 life");
    cast(game, gush, { targets: [], altCost: true, altCostIndex: variants[0].altCostIndex });
    expect(life(game, A)).toBe(15);
  });
});
