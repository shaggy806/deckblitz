/**
 * Set walk batch 65 (d): Avatar: The Last Airbender's waterbend cards — each
 * card's own text, on top of waterbend's payment (`waterbend.test.ts`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;
type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const activateOffer = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): ActivateOffer | undefined =>
  game
    .legalActions(player)
    .find((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Aang's Iceberg", () => {
  it("exiles another nonland permanent until it leaves, and its waterbend sacrifices it to scry 2", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    const iceberg = toHand(game, "Aang's Iceberg");
    cast(game, iceberg, { settle: false });
    settle(game);
    // The enters trigger targets: the seat's default takes the first option.
    expect(zone(game, theirs)).toBe("exile");
    const bears = spawn(game, "Grizzly Bears");
    const relic = spawn(game, "Darksteel Relic");
    const thopter = spawn(game, "Memnite");
    activate(game, iceberg, 0, { waterbend: [bears, relic, thopter] });
    expect(zone(game, iceberg)).toBe("graveyard");
    // Its leaving brings the exiled creature back.
    expect(named(game, "Grizzly Bears").filter((id) => game.state.objects[id].controller === B)).toHaveLength(1);
  });
});

describe("Benevolent River Spirit", () => {
  it("costs {U}{U} plus waterbend {5}, flies, has ward {2}, and scries 2 as it enters", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const spirit = toHand(game, "Benevolent River Spirit");
    const tappers = Array.from({ length: 4 }, () => spawn(game, "Ornithopter"));
    expect(castOffers(game, spirit)).toHaveLength(0);
    spawn(game, "Island");
    // Five generic may be paid by tapping, but there are only four to tap.
    expect(castOffers(game, spirit)[0]?.waterbend?.max).toBe(4);
    cast(game, spirit, { waterbend: tappers });
    expect(zone(game, spirit)).toBe("battlefield");
    expect(keywords(game, spirit).has("flying")).toBe(true);
    expect(pt(game, spirit)).toEqual({ power: 4, toughness: 5 });
  });
});

describe("Flexible Waterbender", () => {
  it("has base power and toughness 5/2 until end of turn", () => {
    const { game } = table();
    const bender = spawn(game, "Flexible Waterbender");
    lands(game, "Island", 3);
    activate(game, bender, 0, { waterbend: [] });
    expect(pt(game, bender)).toEqual({ power: 5, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bender)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("Foggy Swamp Vinebender", () => {
  it("grows only during its controller's turn", () => {
    const { game } = table();
    const vine = spawn(game, "Foggy Swamp Vinebender");
    lands(game, "Forest", 5);
    activate(game, vine, 0);
    expect(counters(game, vine)).toBe(1);
    // Bob's turn: not on offer.
    toStep(game, "precombat-main", B);
    expect(activateOffer(game, vine)).toBeUndefined();
  });
});

describe("Geyser Leaper", () => {
  it("loots for waterbend {4}", () => {
    const { game } = table();
    const leaper = spawn(game, "Geyser Leaper");
    lands(game, "Island", 4);
    toLibrary(game, "Island");
    const size = hand(game).length;
    activate(game, leaper, 0, { waterbend: [] });
    expect(hand(game)).toHaveLength(size);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Giant Koi", () => {
  it("can't be blocked this turn after its waterbend", () => {
    const { game } = table();
    const koi = spawn(game, "Giant Koi");
    lands(game, "Island", 3);
    activate(game, koi, 0, { waterbend: [] });
    expect(keywords(game, koi).has("unblockable")).toBe(true);
  });
});

describe("Invasion Submersible", () => {
  it("bounces another nonland permanent as it enters", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Invasion Submersible"));
    expect(zone(game, theirs)).toBe("hand");
  });

  it("becomes a 3/3 artifact creature for good, once — tapping itself to help pay", () => {
    const { game } = table();
    const sub = spawn(game, "Invasion Submersible");
    lands(game, "Island", 2);
    activate(game, sub, 0, { waterbend: [sub] });
    expect(types(game, sub)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, sub)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(types(game, sub)).toContain("creature");
    // Exhaust: only once.
    expect(activateOffer(game, sub)).toBeUndefined();
  });
});

describe("Katara, Bending Prodigy", () => {
  it("gets a +1/+1 counter at your end step only while tapped — tapping herself to draw sets it up", () => {
    const { game } = table();
    const katara = spawn(game, "Katara, Bending Prodigy");
    lands(game, "Island", 5);
    toLibrary(game, "Island");
    const size = hand(game).length;
    activate(game, katara, 0, { waterbend: [katara] });
    expect(hand(game)).toHaveLength(size + 1);
    expect(tapped(game, katara)).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(counters(game, katara)).toBe(1);
    // Untapped on the next one: no counter.
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, katara)).toBe(1);
  });
});

describe("Katara, Seeking Revenge", () => {
  it("loots as she enters unless her additional cost was paid, and grows with Lessons", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const katara = toHand(game, "Katara, Seeking Revenge");
    toLibrary(game, "Island");
    let discarded = 0;
    a.chooseDiscardsFn = (cards, count) => {
      discarded += count;
      return cards.slice(0, count).map((o) => o.id);
    };
    cast(game, katara);
    expect(discarded).toBe(1);
    expect(pt(game, katara)).toEqual({ power: 3, toughness: 3 });
    toGraveyard(game, "Water Whip");
    toGraveyard(game, "Waterbender's Restoration");
    expect(pt(game, katara)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Katara, Water Tribe's Hope", () => {
  it("makes an Ally as she enters, and sets creatures to X/X on your turn only, X at least 1", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 4);
    const katara = toHand(game, "Katara, Water Tribe's Hope");
    cast(game, katara);
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
    // No {T} in the cost: summoning sick, she and the Ally may still pay it.
    const offer = activateOffer(game, katara);
    expect(offer?.xCost?.minX).toBe(1);
    const ally = named(game, "Ally Token")[0];
    activate(game, katara, 0, { x: 2, waterbend: [ally, katara] });
    expect(pt(game, katara)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, ally)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main", B);
    expect(activateOffer(game, katara)).toBeUndefined();
  });
});

describe("North Pole Patrol", () => {
  it("untaps another permanent you control", () => {
    const { game } = table();
    const patrol = spawn(game, "North Pole Patrol");
    const island = spawn(game, "Island", A, { tapped: true });
    activate(game, patrol, 0, { targets: [ref(island)] });
    expect(tapped(game, island)).toBe(false);
    expect(tapped(game, patrol)).toBe(true);
  });
});

describe("Ruthless Waterbender", () => {
  it("gets +1/+1 until end of turn, during your turn only", () => {
    const { game } = table();
    const bender = spawn(game, "Ruthless Waterbender");
    lands(game, "Swamp", 2);
    activate(game, bender, 0, { waterbend: [] });
    expect(pt(game, bender)).toEqual({ power: 2, toughness: 4 });
    toStep(game, "precombat-main", B);
    expect(activateOffer(game, bender)).toBeUndefined();
  });
});

describe("Water Tribe Rallier", () => {
  it("looks at four, takes a creature card with power 3 or less, bottoms the rest", () => {
    const { game, a } = table();
    const rallier = spawn(game, "Water Tribe Rallier");
    const tappers = Array.from({ length: 5 }, () => spawn(game, "Ornithopter"));
    const big = toLibrary(game, "Giant Koi");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    activate(game, rallier, 0, { waterbend: tappers });
    expect(offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, big)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3)).toEqual(expect.arrayContaining([big]));
  });
});

describe("Water Whip", () => {
  it("returns up to two creatures and draws two", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const whip = toHand(game, "Water Whip");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const size = hand(game).length;
    cast(game, whip, { targets: [ref(one), ref(two)], waterbend: [] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(hand(game)).toHaveLength(size + 1);
  });
});

describe("Waterbender Ascension", () => {
  it("puts a quest counter on it for each creature that connects, and draws from the fourth on", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Waterbender Ascension");
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Memnite");
    game.state.objects[ascension].counters.quest = 2;
    toLibrary(game, "Island");
    const size = hand(game).length;
    // Two connect: the third counter draws nothing, the fourth draws.
    attack(game, a, [bears, thopter]);
    expect(counters(game, ascension, "quest")).toBe(4);
    expect(hand(game)).toHaveLength(size + 1);
  });

  it("makes target creature unblockable this turn", () => {
    const { game } = table();
    const ascension = spawn(game, "Waterbender Ascension");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    activate(game, ascension, 0, { targets: [ref(bears)], waterbend: [] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Waterbender's Restoration", () => {
  it("exiles X creatures you control and returns them at the next end step", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const restoration = toHand(game, "Waterbender's Restoration");
    cast(game, restoration, { x: 1, targets: [ref(bears)], waterbend: [bears] });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
  });
});

describe("Yue, the Moon Spirit", () => {
  it("casts a noncreature spell from your hand free — a waterbend additional cost still paid", () => {
    const { game, a } = table();
    const yue = spawn(game, "Yue, the Moon Spirit");
    const whip = toHand(game, "Water Whip");
    toHand(game, "Grizzly Bears");
    const tappers = Array.from({ length: 5 }, () => spawn(game, "Ornithopter"));
    const more = Array.from({ length: 5 }, () => spawn(game, "Memnite"));
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      const way = offer.casts.find((c) => c.card === whip);
      return { type: "cast-spell", player: A, card: whip, targets: [null, null], via: way?.via, free: true, waterbend: more };
    };
    // Yue's {T} taps her: she isn't among what may help.
    expect(activateOffer(game, yue)?.waterbend?.choices).not.toContain(yue);
    activate(game, yue, 0, { waterbend: tappers });
    expect(offered).toEqual([whip]);
    expect(zone(game, whip)).toBe("graveyard");
    expect(more.every((id) => tapped(game, id))).toBe(true);
  });
});
