/**
 * A spell's additional cost in the one shape every keyword's non-mana cost has
 * (`additionalCost.also`, `KickerAlsoCost`; rule 601.2f-h): tap N untapped
 * permanents picked from the cast's `tapCost` (Warlord's Elite, Shared
 * Discovery, Gaze of Justice, the flashback cast too, rule 118.9d), any number
 * of them with X the count (Burn at the Stake), a branch of a choice of costs
 * (Disruption Protocol), and return a land (Deprive).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, pickPermanents, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const castOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .filter((o) => o.kind === "cast-spell" && o.card === card) as Extract<
    ReturnType<Game["legalActions"]>[number],
    { kind: "cast-spell" }
  >[];

describe("tap N untapped permanents as an additional cost", () => {
  it("is offered with the permanents the mana doesn't need, and taps the ones named", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const artifact = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const elite = toHand(game, "Warlord's Elite");
    const [offer] = castOffers(game, elite);
    expect(offer.tapCost?.count).toBe(2);
    expect(offer.tapCost?.choices).toContain(bears);
    expect(offer.tapCost?.choices).toContain(artifact);
    cast(game, elite, { tap: [bears, artifact] });
    expect(zone(game, elite)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[artifact].tapped).toBe(true);
  });

  it("can't be cast with too few to tap, and a summoning-sick creature may be tapped", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const creatures = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const discovery = toHand(game, "Shared Discovery");
    expect(castOffers(game, discovery)).toHaveLength(0);
    const sick = spawn(game, "Grizzly Bears", A, { sick: true });
    const before = hand(game).length;
    cast(game, discovery, { tap: [...creatures, sick] });
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(game.state.objects[sick].tapped).toBe(true);
  });

  it("refuses the wrong count and the wrong permanents", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const white = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Hill Giant", B);
    const gaze = toHand(game, "Gaze of Justice");
    expect(() => cast(game, gaze, { targets: [ref(target)], tap: white.slice(0, 2) })).toThrow(/taps 3/);
    expect(() => cast(game, gaze, { targets: [ref(target)], tap: [bears, white[0], white[1]] })).toThrow(/can't tap/);
    cast(game, gaze, { targets: [ref(target)], tap: white });
    expect(zone(game, target)).toBe("exile");
  });

  it("is paid on a flashback cast too (rule 118.9d)", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const white = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    const target = spawn(game, "Hill Giant", B);
    const gaze = game.debugSpawn("Gaze of Justice", A, "graveyard");
    const offer = castOffers(game, gaze).find((o) => o.via === "flashback");
    expect(offer?.tapCost?.count).toBe(3);
    cast(game, gaze, { targets: [ref(target)], tap: white, via: "flashback" });
    expect(zone(game, target)).toBe("exile");
    expect(white.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, gaze)).toBe("exile");
  });

  it("the mana and the tap can't both use one land: a land is offered only if the mana is still paid without it", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const elite = toHand(game, "Warlord's Elite");
    // Three lands: all three pay {2}{W}, so nothing is left to tap.
    expect(castOffers(game, elite)).toHaveLength(0);
    lands(game, "Plains", 2);
    const [offer] = castOffers(game, elite);
    // Five: any two tapped leave three for {2}{W} (rule 601.2h).
    expect(offer.tapCost?.choices.length).toBe(5);
  });
});

describe("tap any number of untapped creatures (Burn at the Stake)", () => {
  it("X is how many were tapped", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const creatures = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant"), spawn(game, "Llanowar Elves")];
    const burn = toHand(game, "Burn at the Stake");
    const [offer] = castOffers(game, burn);
    expect(offer.tapCost).toMatchObject({ anyNumber: true, count: 0 });
    cast(game, burn, { targets: [ref(B)], tap: creatures.slice(0, 2) });
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[creatures[0]].tapped).toBe(true);
    expect(game.state.objects[creatures[2]].tapped).toBe(false);
  });

  it("none is a legal payment, and deals nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const burn = toHand(game, "Burn at the Stake");
    cast(game, burn, { targets: [ref(B)], tap: [] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, burn)).toBe("graveyard");
  });

  it("a driver that doesn't choose taps them all", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    cast(game, toHand(game, "Burn at the Stake"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});

describe("a branch of a choice of additional costs (Disruption Protocol)", () => {
  /** A Shock of alice's own on the stack to counter. */
  function withSpell() {
    const seats = table();
    lands(seats.game, "Mountain", 1);
    const shock = toHand(seats.game, "Shock");
    cast(seats.game, shock, { targets: [ref(B)], settle: false });
    return { ...seats, shock, protocol: toHand(seats.game, "Disruption Protocol") };
  }

  it("taps the artifact, on its own branch, with no {1}", () => {
    const { game, shock, protocol } = withSpell();
    lands(game, "Island", 2);
    const ring = spawn(game, "Mind Stone");
    const offers = castOffers(game, protocol);
    const tapping = offers.find((o) => o.costOption === 0);
    expect(tapping?.tapCost?.count).toBe(1);
    expect(tapping?.tapCost?.choices).toContain(ring);
    cast(game, protocol, { targets: [ref(shock)], costOption: 0, tap: [ring] });
    expect(game.state.objects[ring].tapped).toBe(true);
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("or pays {1}, with no artifact to tap: the tap branch isn't offered", () => {
    const { game, shock, protocol } = withSpell();
    const islands = lands(game, "Island", 3);
    const offers = castOffers(game, protocol);
    expect(offers.map((o) => o.costOption)).toEqual([1]);
    expect(offers[0].tapCost).toBeUndefined();
    cast(game, protocol, { targets: [ref(shock)], costOption: 1 });
    expect(islands.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("discard a card matching a filter as an additional cost", () => {
  it("Magmatic Insight discards a land card, and can't be cast without one", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 1);
    const insight = toHand(game, "Magmatic Insight");
    const bears = toHand(game, "Grizzly Bears");
    expect(castOffers(game, insight)).toHaveLength(0);
    const land = toHand(game, "Forest");
    a.chooseDiscardsFn = (cards) => {
      // Only the land is on offer.
      expect(cards.map((c) => c.id)).toEqual([land]);
      return [land];
    };
    const before = hand(game).length;
    cast(game, insight);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before - 2 + 2);
  });

  it("Scorched Earth's X is capped by the land cards in hand", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 5);
    const earth = toHand(game, "Scorched Earth");
    const inHand = [toHand(game, "Forest"), toHand(game, "Forest")];
    toHand(game, "Grizzly Bears");
    const victims = [spawn(game, "Forest", B), spawn(game, "Forest", B), spawn(game, "Forest", B)];
    const [offer] = castOffers(game, earth);
    expect(offer.xCost?.maxX).toBe(2);
    a.chooseDiscardsFn = () => inHand;
    cast(game, earth, { x: 2, targets: [ref(victims[0]), ref(victims[1])] });
    expect(inHand.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, victims[0])).toBe("graveyard");
    expect(zone(game, victims[2])).toBe("battlefield");
  });
});

describe("return a land as an additional cost (Deprive)", () => {
  it("asks which land once the spell is on the stack, and returns it", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 3);
    const bolt = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const deprive = toHand(game, "Deprive");
    pickPermanents(a, islands[2]);
    cast(game, deprive, { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, islands[2])).toBe("hand");
    expect(life(game, B)).toBe(20);
  });

  it("can't be cast with no land to return", () => {
    const { game } = table();
    const deprive = toHand(game, "Deprive");
    expect(castOffers(game, deprive)).toHaveLength(0);
  });
});
