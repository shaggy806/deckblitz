/**
 * "You may cast spells without paying their mana costs", with its limits, all
 * `alternativeCostForSpells` (rule 118.9): from hand, from exile or the top of
 * the library, once each turn, under a value read off the permanent, by any
 * player and with flash.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  hand,
  lands,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): readonly CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

/** The offer that's an alternative cost of {0}, if there is one. */
const freeOffer = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer | undefined =>
  castOffers(game, card, player).find((a) => a.altCost === true && a.altCostText === "without paying its mana cost");

const castFree = (game: Game, card: ObjectId, player: PlayerId = A, targets: readonly ReturnType<typeof ref>[] = []): void => {
  const offer = freeOffer(game, card, player);
  if (offer === undefined) throw new Error(`no {0} offer for ${game.state.objects[card].cardName}`);
  cast(game, card, {
    player,
    targets,
    altCost: true,
    ...(offer.via !== undefined ? { via: offer.via } : {}),
    ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
  });
};

describe("from your hand", () => {
  it("Omniscience: free from hand, with nothing to pay it with", () => {
    const { game } = table();
    spawn(game, "Omniscience");
    const bear = toHand(game, "Grizzly Bears");
    expect(castOffers(game, bear).length).toBe(1);
    castFree(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Omniscience: not from the top of the library", () => {
    const { game } = table();
    spawn(game, "Omniscience");
    spawn(game, "Future Sight");
    const top = toLibrary(game, "Grizzly Bears");
    expect(freeOffer(game, top)).toBeUndefined();
  });

  it("Omniscience: a card with an alternative cost of its own is offered both", () => {
    const { game } = table();
    spawn(game, "Omniscience");
    lands(game, "Plains", 2);
    for (let i = 0; i < 4; i++) spawn(game, "Wind Drake");
    const sephara = toHand(game, "Sephara, Sky's Blade");
    const offers = castOffers(game, sephara).filter((a) => a.altCost === true);
    expect(offers.length).toBe(2);
    expect(offers.filter((a) => a.altCostText === "without paying its mana cost").length).toBe(1);
    expect(offers.filter((a) => a.tapCost !== undefined).length).toBe(1);
  });

  it("Omniscience: X is 0", () => {
    const { game } = table();
    spawn(game, "Omniscience");
    const ballista = toHand(game, "Walking Ballista");
    castFree(game, ballista);
    // A 0/0 with no counters, gone at once.
    expect(zone(game, ballista)).toBe("graveyard");
  });

  it("Omnipresence: up to the number of creatures you control, read as it's cast", () => {
    const { game } = table();
    spawn(game, "Omnipresence");
    const ogre = toHand(game, "Hill Giant"); // mana value 4
    const bear = toHand(game, "Grizzly Bears");
    expect(freeOffer(game, bear)).toBeUndefined();
    spawn(game, "Grizzly Bears");
    expect(freeOffer(game, bear)).toBeUndefined();
    spawn(game, "Grizzly Bears");
    expect(freeOffer(game, bear)).toBeDefined();
    expect(freeOffer(game, ogre)).toBeUndefined();
    castFree(game, bear);
    // Three now, one short of the mana value of four.
    expect(freeOffer(game, ogre)).toBeUndefined();
    spawn(game, "Grizzly Bears");
    expect(freeOffer(game, ogre)).toBeDefined();
  });

  it("Omnipresence: an opponent's creatures don't count", () => {
    const { game } = table();
    spawn(game, "Omnipresence");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    expect(freeOffer(game, toHand(game, "Grizzly Bears"))).toBeUndefined();
  });
});

describe("once each turn", () => {
  it("Zaffai and the Tempests: one instant or sorcery a turn, on your own turn, no creature", () => {
    const { game, a } = table();
    spawn(game, "Zaffai and the Tempests");
    const first = toHand(game, "Divination");
    const second = toHand(game, "Divination");
    expect(freeOffer(game, toHand(game, "Grizzly Bears"))).toBeUndefined();
    pickTargets(a);
    castFree(game, first);
    expect(zone(game, first)).toBe("graveyard");
    expect(freeOffer(game, second)).toBeUndefined();
    nextTurn(game); // bob's
    nextTurn(game); // alice's again
    expect(freeOffer(game, second)).toBeDefined();
  });

  it("Zaffai and the Tempests: not on an opponent's turn", () => {
    const { game } = table();
    spawn(game, "Zaffai and the Tempests");
    const bolt = toHand(game, "Lightning Bolt");
    expect(freeOffer(game, bolt)).toBeDefined();
    nextTurn(game); // bob's
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(freeOffer(game, bolt)).toBeUndefined();
  });

  it("Vision: a noncreature or a Robot spell, not another creature", () => {
    const { game } = table();
    spawn(game, "Vision, Spectral Synthezoid");
    expect(freeOffer(game, toHand(game, "Divination"))).toBeDefined();
    expect(freeOffer(game, toHand(game, "Grizzly Bears"))).toBeUndefined();
    expect(freeOffer(game, toHand(game, "Sol Ring"))).toBeDefined();
    expect(freeOffer(game, toHand(game, "Vision, Spectral Synthezoid"))).toBeDefined();
  });

  it("Vision: an Adventure from a creature card is the sorcery it would be (rule 601.3e)", () => {
    const { game } = table();
    spawn(game, "Vision, Spectral Synthezoid");
    toGraveyard(game, "Grizzly Bears");
    const hunter = toHand(game, "Tlincalli Hunter");
    const offers = castOffers(game, hunter).filter((a) => a.altCost === true);
    expect(offers.map((a) => a.face)).toEqual([1]);
  });

  it("As Foretold: X is its time counters, read as it's cast, once a turn", () => {
    const { game } = table();
    const foretold = spawn(game, "As Foretold");
    const bear = toHand(game, "Grizzly Bears");
    const ring = toHand(game, "Sol Ring");
    expect(freeOffer(game, ring)).toBeUndefined();
    nextTurn(game); // bob's
    nextTurn(game); // alice's: one time counter
    expect(counters(game, foretold, "time")).toBe(1);
    expect(freeOffer(game, bear)).toBeUndefined();
    expect(freeOffer(game, ring)).toBeDefined();
    nextTurn(game);
    nextTurn(game); // two
    expect(counters(game, foretold, "time")).toBe(2);
    castFree(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
    expect(freeOffer(game, ring)).toBeUndefined();
  });

  it("As Foretold: on an opponent's turn too, for a spell that can be cast then", () => {
    const { game } = table();
    const foretold = spawn(game, "As Foretold");
    game.state.objects[foretold].counters.time = 1;
    const bolt = toHand(game, "Lightning Bolt");
    nextTurn(game); // bob's
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(freeOffer(game, bolt)).toBeDefined();
  });

  it("two permanents' grants are each their own once", () => {
    const { game } = table();
    spawn(game, "Zaffai and the Tempests");
    spawn(game, "Vision, Spectral Synthezoid");
    const one = toHand(game, "Divination");
    const two = toHand(game, "Divination");
    castFree(game, one);
    castFree(game, two);
    expect(zone(game, two)).toBe("graveyard");
    expect(freeOffer(game, toHand(game, "Divination"))).toBeUndefined();
  });
});

describe("from another zone", () => {
  it("One with the Multiverse: free from the top of the library or from hand, one between them", () => {
    const { game } = table();
    spawn(game, "One with the Multiverse");
    const inHand = toHand(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    const offer = freeOffer(game, top);
    expect(offer?.via).toBe("library-top");
    expect(freeOffer(game, inHand)).toBeDefined();
    cast(game, top, { via: "library-top", altCost: true });
    expect(zone(game, top)).toBe("battlefield");
    expect(freeOffer(game, inHand)).toBeUndefined();
  });

  it("One with the Multiverse: only the top card of the library", () => {
    const { game } = table();
    spawn(game, "One with the Multiverse");
    const below = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Grizzly Bears");
    expect(freeOffer(game, below)).toBeUndefined();
    expect(freeOffer(game, top)).toBeDefined();
  });

  it("Tlincalli Hunter: a creature cast from exile, once a turn; not one from hand", () => {
    const { game } = table();
    spawn(game, "Tlincalli Hunter");
    lands(game, "Forest", 4);
    const inHand = toHand(game, "Grizzly Bears");
    expect(freeOffer(game, inHand)).toBeUndefined();
    const dead = toGraveyard(game, "Hill Giant");
    const prey = toHand(game, "Tlincalli Hunter");
    cast(game, prey, { face: 1, targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("exile");
    expect(zone(game, prey)).toBe("exile");
    // The exiled Hill Giant: a permission to cast it, and now {0} for it.
    expect(freeOffer(game, dead)?.via).toBe("impulse");
    castFree(game, dead);
    expect(zone(game, dead)).toBe("battlefield");
    // And the Hunter on its Adventure is another: this turn's is spent.
    expect(freeOffer(game, prey)).toBeUndefined();
  });

  it("Tlincalli Hunter: no permission from it to cast what's in exile", () => {
    const { game } = table();
    spawn(game, "Tlincalli Hunter");
    expect(castOffers(game, toExile(game, "Grizzly Bears"))).toEqual([]);
  });
});

describe("any player", () => {
  it("Aluren: its controller's creature spell, free", () => {
    const { game } = table();
    spawn(game, "Aluren");
    const bear = toHand(game, "Grizzly Bears");
    castFree(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Aluren: an opponent may too, on any turn, with flash, and pays for it no other way", () => {
    const { game } = table();
    spawn(game, "Aluren");
    const bear = toHand(game, "Grizzly Bears", B);
    // Alice's main phase: Bob has priority once she passes it.
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(castOffers(game, bear, B).map((a) => a.altCostText)).toEqual(["without paying its mana cost"]);
    castFree(game, bear, B);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].controller).toBe(B);
  });

  it("Aluren: mana value 3 or less, a creature", () => {
    const { game } = table();
    spawn(game, "Aluren");
    expect(freeOffer(game, toHand(game, "Hill Giant"))).toBeUndefined();
    expect(freeOffer(game, toHand(game, "Divination"))).toBeUndefined();
  });

  it("Aluren: gone with a player who left", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Aluren", B);
    const bear = toHand(game, "Grizzly Bears");
    expect(freeOffer(game, bear)).toBeDefined();
    game.state.players[B].hasLost = true;
    expect(hand(game)).toContain(bear);
    expect(freeOffer(game, bear)).toBeUndefined();
  });
});
