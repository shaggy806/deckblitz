/**
 * Waterbend (rule 701.67): "Waterbend [cost]" means "Pay [cost]. For each
 * generic mana in that cost, you may tap an untapped artifact or creature you
 * control rather than pay that mana" (701.67a) — and when it's part of a
 * larger total cost, only the waterbend part's generic may be paid by tapping
 * (701.67b).
 *
 * Each shape the engine has: an activated ability's cost
 * (`AbilityCost.waterbend` — Geyser Leaper, North Pole Patrol's "Waterbend
 * {3}, {T}", Katara, Water Tribe's Hope's "Waterbend {X}"), a spell's
 * additional cost (`additionalCost.waterbend` — Water Whip's {5},
 * Waterbender's Restoration's {X}), and an optional one (a `waterbend`
 * kicker — Katara, Seeking Revenge). The driver names what taps
 * (`waterbend` on the action), or the engine taps the fewest that pay.
 */
import { describe, expect, it } from "vitest";

import { waterbendAt } from "../actions.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  cast,
  counters,
  hand,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const activateOffer = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): ActivateOffer | undefined =>
  game
    .legalActions(player)
    .find((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

function stackOf(game: Game, name: string, count: number, player: PlayerId = A): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: name, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].isToken,
  );
  if (stack === undefined || (game.state.objects[stack].stackCount ?? 1) !== count) {
    throw new Error(`expected one stack of ${count} ${name}`);
  }
  return stack;
}

const untappedTokens = (game: Game, name: string): number =>
  game.state.zones.shared.battlefield
    .map((id) => game.state.objects[id])
    .filter((o) => o.cardName === name && !o.tapped)
    .reduce((n, o) => n + (o.stackCount ?? 1), 0);

describe("waterbend as an activated ability's cost (Geyser Leaper's Waterbend {4})", () => {
  it("is paid by tapping artifacts and creatures alone, summoning sick ones included", () => {
    const { game, a } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const relic = spawn(game, "Darksteel Relic");
    const thopter = spawn(game, "Ornithopter", A, { sick: true });
    const card = toLibrary(game, "Island");
    a.chooseDiscardsFn = () => [card];
    const offer = activateOffer(game, leaper);
    expect(offer?.waterbend?.max).toBe(4);
    // A noncreature artifact first, then creatures, the source last.
    expect(offer?.waterbend?.choices).toEqual([relic, bears, thopter, leaper]);
    expect(offer?.waterbend?.proof).toEqual([relic, bears, thopter, leaper]);
    activate(game, leaper, 0, { waterbend: [relic, bears, thopter, leaper] });
    for (const id of [relic, bears, thopter, leaper]) expect(tapped(game, id)).toBe(true);
    // Drew the Island and discarded it.
    expect(game.state.objects[card].zone).toBe("graveyard");
  });

  it("taps what the player names and pays the rest with mana — or none at all", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const bears = spawn(game, "Grizzly Bears");
    const islands = lands(game, "Island", 4);
    expect(activateOffer(game, leaper)?.waterbend?.proof).toEqual([]);
    activate(game, leaper, 0, { waterbend: [bears] });
    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, leaper)).toBe(false);
    expect(islands.filter((id) => tapped(game, id))).toHaveLength(3);
    // `[]`: all of it with mana, none tapped — not enough left now.
    expect(game.canDispatch({ type: "activate-ability", player: A, source: leaper, abilityIndex: 0, targets: [], waterbend: [] })).toMatch(
      /cannot pay/,
    );
  });

  it("left to the engine, taps the fewest that leave the rest payable", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    const islands = lands(game, "Island", 3);
    expect(activateOffer(game, leaper)?.waterbend?.proof).toEqual([relic]);
    activate(game, leaper);
    expect(tapped(game, relic)).toBe(true);
    expect(tapped(game, bears)).toBe(false);
    expect(islands.every((id) => tapped(game, id))).toBe(true);
  });

  it("refuses more than the waterbend generic, a land, a tapped permanent, or one twice", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const ids = [spawn(game, "Grizzly Bears"), spawn(game, "Ornithopter"), spawn(game, "Memnite"), spawn(game, "Darksteel Relic")];
    const extra = spawn(game, "Grizzly Bears");
    const island = spawn(game, "Island");
    const tappedBears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const why = (waterbend: readonly ObjectId[]) =>
      game.canDispatch({ type: "activate-ability", player: A, source: leaper, abilityIndex: 0, targets: [], waterbend });
    expect(why([...ids, extra])).toMatch(/only 4/);
    expect(why([island])).toMatch(/only an artifact or creature/);
    expect(why([tappedBears])).toMatch(/already tapped/);
    expect(why([ids[0], ids[0]])).toMatch(/twice/);
    expect(why(ids)).toBeNull();
  });

  it("a mana creature tapped to waterbend can't tap for mana as well (the rulings)", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    // Mana makers come last in the offer; the Elves pay one way or the other.
    expect(activateOffer(game, leaper)?.waterbend?.choices).toEqual([bears, leaper, elves]);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: leaper, abilityIndex: 0, targets: [], waterbend: [elves] }),
    ).toMatch(/cannot pay/);
    activate(game, leaper, 0, { waterbend: [elves, bears] });
    expect(tapped(game, elves)).toBe(true);
  });

  it("a token stack pays once per token", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    const saprolings = stackOf(game, "Saproling Token", 9);
    const offer = activateOffer(game, leaper)?.waterbend;
    expect(offer?.copies).toEqual({ [saprolings]: 9 });
    expect(offer?.proof).toEqual([saprolings, saprolings, saprolings, saprolings]);
    activate(game, leaper, 0, { waterbend: [saprolings, saprolings, saprolings, saprolings] });
    expect(untappedTokens(game, "Saproling Token")).toBe(5);
    expect(tapped(game, leaper)).toBe(false);
  });
});

describe("waterbend beside {T} (North Pole Patrol's Waterbend {3}, {T})", () => {
  it("leaves the source out: its {T} taps it", () => {
    const { game } = table();
    const patrol = spawn(game, "North Pole Patrol");
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    const thopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Grizzly Bears", "bob" as PlayerId);
    const offer = activateOffer(game, patrol, 1);
    expect(offer?.waterbend?.choices).toEqual([relic, bears, thopter]);
    expect(
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: patrol,
        abilityIndex: 1,
        targets: [ref(theirs)],
        waterbend: [patrol, bears, relic],
      }),
    ).toMatch(/\{T\}/);
    activate(game, patrol, 1, { targets: [ref(theirs)], waterbend: [bears, relic, thopter] });
    expect(tapped(game, theirs)).toBe(true);
    expect(tapped(game, patrol)).toBe(true);
  });
});

describe("waterbend {X} on an ability (Katara, Water Tribe's Hope)", () => {
  it("taps pay for X too, and X can't be 0", () => {
    const { game } = table();
    const katara = spawn(game, "Katara, Water Tribe's Hope");
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Island", 1);
    const offer = activateOffer(game, katara);
    // One Island and three to tap (Katara too: no {T} in the cost).
    expect(offer?.xCost).toEqual({ maxX: 4, minX: 1 });
    expect(offer?.waterbend?.byX?.map((at) => at.max)).toEqual([0, 1, 2, 3, 3]);
    expect(waterbendAt(offer!.waterbend!, 4).proof).toHaveLength(3);
    activate(game, katara, 0, { x: 4 });
    for (const id of [katara, bears, thopter]) expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("waterbend as a spell's additional cost (Water Whip's {5})", () => {
  it("adds {5} to the total cost, any of it paid by tapping", () => {
    const { game } = table();
    const whip = toHand(game, "Water Whip");
    lands(game, "Island", 2);
    const tappers = [spawn(game, "Grizzly Bears"), spawn(game, "Ornithopter"), spawn(game, "Memnite"), spawn(game, "Darksteel Relic")];
    // {U}{U} and four to tap: one generic short.
    expect(castOffers(game, whip)).toHaveLength(0);
    const fifth = spawn(game, "Grizzly Bears");
    const offer = castOffers(game, whip)[0];
    expect(offer.waterbend?.max).toBe(5);
    expect(offer.waterbend?.proof).toHaveLength(5);
    const theirs = spawn(game, "Grizzly Bears", "bob" as PlayerId);
    const before = hand(game).length;
    cast(game, whip, { targets: [ref(theirs), null], waterbend: [...tappers, fifth] });
    expect(game.state.objects[theirs].zone).toBe("hand");
    // Water Whip left the hand, two cards came in.
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("a cost reduction doesn't raise what tapping may pay, nor an increase it (701.67b)", () => {
    const { game } = table();
    const whip = toHand(game, "Water Whip");
    lands(game, "Island", 2);
    const tappers = Array.from({ length: 6 }, () => spawn(game, "Grizzly Bears"));
    // Thalia: noncreature spells cost {1} more — {6}{U}{U}, of which tapping pays only {5}.
    spawn(game, "Thalia, Guardian of Thraben", "bob" as PlayerId);
    expect(castOffers(game, whip)).toHaveLength(0);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: whip, targets: [null, null], waterbend: tappers }),
    ).toMatch(/only 5/);
    spawn(game, "Island");
    expect(castOffers(game, whip)[0]?.waterbend?.max).toBe(5);
    cast(game, whip, { targets: [null, null], waterbend: tappers.slice(0, 5) });
    expect(tapped(game, tappers[5])).toBe(false);
  });
});

describe("waterbend {X} as a spell's additional cost (Waterbender's Restoration)", () => {
  it("X reaches as far as mana and taps, and the creatures that paid may be the ones it exiles", () => {
    const { game } = table();
    const restoration = toHand(game, "Waterbender's Restoration");
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter");
    spawn(game, "Memnite");
    const offer = castOffers(game, restoration)[0];
    // Exactly X targets, so X is at most the three creatures; {U}{U} from two
    // Islands, X from the third and two of the creatures tapping.
    expect(offer.xCost?.maxX).toBe(3);
    expect(waterbendAt(offer.waterbend!, 3)).toEqual({ max: 3, proof: [bears, thopter] });
    expect(waterbendAt(offer.waterbend!, 1).proof).toEqual([]);
    // The creatures it exiles may be the ones that paid.
    cast(game, restoration, { x: 2, targets: [ref(bears), ref(thopter)], waterbend: [bears, thopter] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, thopter)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
    expect(named(game, "Ornithopter")).toHaveLength(1);
  });
});

describe("an optional waterbend (Katara, Seeking Revenge's \"you may waterbend {2}\")", () => {
  it("is the kicked cast, and her additional cost paid skips the discard", () => {
    const { game, a } = table();
    const katara = toHand(game, "Katara, Seeking Revenge");
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    const offers = castOffers(game, katara);
    const kicked = offers.find((o) => o.kicked === true);
    expect(kicked?.kickerKeyword).toBe("waterbend");
    expect(kicked?.waterbend?.max).toBe(2);
    expect(offers.find((o) => o.kicked !== true)?.waterbend).toBeUndefined();
    toLibrary(game, "Island");
    let asked = false;
    a.chooseDiscardsFn = (cards, count) => {
      asked = true;
      return cards.slice(0, count).map((o) => o.id);
    };
    cast(game, katara, { kicked: true, waterbend: [bears, relic] });
    expect(asked).toBe(false);
    expect(tapped(game, bears) && tapped(game, relic)).toBe(true);
    expect(counters(game, katara)).toBe(0);
  });
});
