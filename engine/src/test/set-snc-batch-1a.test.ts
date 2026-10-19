/**
 * Streets of New Capenna, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
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
  watchTargets,
  zone,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const copiesOnStack = (game: Game): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => game.state.objects[id].isCopy === true);

describe("Demon's Due", () => {
  it("scries 2, then draws two cards, and you lose 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Demon's Due"));
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
  });
});

describe("A Little Chat", () => {
  it("puts one of the top two into your hand and the other on the bottom", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bottom = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    const before = hand(game).length;
    cast(game, toHand(game, "A Little Chat"));
    expect(hand(game).length).toBe(before + 1);
    const kept = hand(game).includes(top) ? bottom : top;
    expect(library(game)[library(game).length - 1]).toBe(kept);
  });

  it("casualty 1: sacrificing a 1-power creature copies it, so it looks twice", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const memnite = spawn(game, "Memnite");
    pickPermanents(a, memnite);
    const before = hand(game).length;
    cast(game, toHand(game, "A Little Chat"));
    expect(zone(game, memnite)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
    expect(game.eventsOfType("spell-copied")).toHaveLength(1);
  });
});

describe("Cut of the Profits", () => {
  it("draws X and loses X; the casualty copy has the same X", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a, giant);
    const before = hand(game).length;
    cast(game, toHand(game, "Cut of the Profits"), { x: 2 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 4);
    expect(life(game)).toBe(16);
  });

  it("a creature with power less than 3 can't pay its casualty", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a);
    cast(game, toHand(game, "Cut of the Profits"), { x: 1 });
    expect(seen.offered).toEqual([]);
    expect(life(game)).toBe(19);
  });
});

describe("Rooftop Nuisance", () => {
  it("taps the target, which skips its controller's next untap, and draws a card", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Rooftop Nuisance"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("the casualty copy may tap a different creature", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const memnite = spawn(game, "Memnite");
    pickPermanents(a, memnite);
    pickTargets(a, giant);
    const before = hand(game).length;
    cast(game, toHand(game, "Rooftop Nuisance"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("For the Family", () => {
  it("+2/+2 with three creatures", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "For the Family"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });

  it("+4/+4 instead with four or more creatures", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "For the Family"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Plasma Jockey", () => {
  it("blitzed, it has haste and its attack stops a creature an opponent controls from blocking", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const jockey = toHand(game, "Plasma Jockey");
    cast(game, jockey, { via: "blitz" });
    expect(keywords(game, jockey).has("haste")).toBe(true);
    pickTargets(a, bear);
    const offer = blockOffer(game, a, [jockey]);
    expect(canBlock(offer, bear)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([jockey]);
  });
});

describe("Buy Your Silence", () => {
  it("exiles the permanent and its controller gets a Treasure", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Buy Your Silence"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Ballroom Brawlers", () => {
  it("it and up to one other creature you control both gain the one chosen keyword", () => {
    const { game, a } = table();
    const brawlers = spawn(game, "Ballroom Brawlers");
    const bear = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    const seen = watchTargets(a, () => [bear]);
    pickModes(a, 1);
    attack(game, a, [brawlers]);
    expect(seen.offered[0]).toContain(bear);
    expect(seen.offered[0]).toContain(memnite);
    expect(seen.offered[0]).not.toContain(brawlers);
    expect(keywords(game, brawlers).has("lifelink")).toBe(true);
    expect(keywords(game, bear).has("lifelink")).toBe(true);
    expect(keywords(game, brawlers).has("first-strike")).toBe(false);
    expect(keywords(game, bear).has("first-strike")).toBe(false);
    expect(keywords(game, memnite).has("lifelink")).toBe(false);
    expect(life(game)).toBe(23);
  });
});

describe("Ceremonial Groundbreaker", () => {
  it("Equip Citizen {1} attaches only to a Citizen; equipped gets +2/+1 and trample", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const gear = spawn(game, "Ceremonial Groundbreaker");
    const bess = spawn(game, "Bess, Soul Nourisher");
    const bear = spawn(game, "Grizzly Bears");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: gear, abilityIndex: 0, targets: [ref(bear)] }),
    ).not.toBeNull();
    activate(game, gear, 0, { targets: [ref(bess)] });
    expect(pt(game, bess)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bess).has("trample")).toBe(true);
    // Equip {3} reaches any creature you control.
    activate(game, gear, 1, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Angelic Observer", () => {
  it("costs {1} less for each Citizen you control", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const observer = toHand(game, "Angelic Observer");
    const castable = (): boolean =>
      game.canDispatch({ type: "cast-spell", player: A, card: observer, targets: [] }) === null;
    spawn(game, "Citizen Token");
    spawn(game, "Citizen Token");
    expect(castable()).toBe(false);
    spawn(game, "Citizen Token");
    expect(castable()).toBe(true);
    cast(game, observer);
    expect(zone(game, observer)).toBe("battlefield");
  });
});

describe("Elegant Entourage", () => {
  it("another creature entering pumps a target creature other than itself", () => {
    const { game, a } = table();
    const entourage = spawn(game, "Elegant Entourage");
    const bear = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bear]);
    enter(game, "Memnite");
    expect(seen.offered[0]).toContain(bear);
    expect(seen.offered[0]).not.toContain(entourage);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("trample")).toBe(true);
  });
});

describe("Venom Connoisseur", () => {
  it("gains deathtouch alone the first time, and all your creatures gain it the second", () => {
    const { game } = table();
    const venom = spawn(game, "Venom Connoisseur");
    const bear = spawn(game, "Grizzly Bears");
    const first = enter(game, "Memnite");
    expect(keywords(game, venom).has("deathtouch")).toBe(true);
    expect(keywords(game, bear).has("deathtouch")).toBe(false);
    expect(keywords(game, first).has("deathtouch")).toBe(false);
    enter(game, "Memnite");
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
    expect(keywords(game, first).has("deathtouch")).toBe(true);
  });
});

describe("Bess, Soul Nourisher", () => {
  it("one counter for a batch of 1/1s entering, none for a 2/2", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bess = spawn(game, "Bess, Soul Nourisher");
    cast(game, toHand(game, "Raise the Alarm"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(counters(game, bess)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, bess)).toBe(1);
  });

  it("its attack pumps other base-1/1 creatures by its +1/+1 counters, counters on them aside", () => {
    const { game, a } = table();
    const bess = spawn(game, "Bess, Soul Nourisher");
    game.state.objects[bess].counters["+1/+1"] = 2;
    const soldier = spawn(game, "Soldier Token");
    const grown = spawn(game, "Soldier Token");
    game.state.objects[grown].counters["+1/+1"] = 1;
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [bess]);
    expect(pt(game, soldier)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, grown)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bess)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Errant, Street Artist", () => {
  it("copies a spell copy you control, never a spell that was cast", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const errant = spawn(game, "Errant, Street Artist");
    const memnite = spawn(game, "Memnite");
    pickPermanents(a, memnite);
    const chat = toHand(game, "A Little Chat");
    const before = hand(game).length - 1;
    cast(game, chat, { settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.pendingTriggers.length === 0 && copiesOnStack(game).length === 1);
    const copy = copiesOnStack(game)[0];
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: errant, abilityIndex: 0, targets: [ref(chat)] }),
    ).not.toBeNull();
    activate(game, errant, 0, { targets: [ref(copy)] });
    expect(game.eventsOfType("spell-copied")).toHaveLength(2);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Flawless Forgery", () => {
  it("exiles an instant or sorcery from an opponent's graveyard and casts a copy of it free", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    const mine = toGraveyard(game, "Lightning Bolt", A);
    const seen = watchTargets(a, () => [theirs]);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const forgery = toHand(game, "Flawless Forgery");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: forgery, targets: [ref(mine)] })).not.toBeNull();
    cast(game, forgery, { targets: [ref(theirs)] });
    expect(seen.asked).toBe(0);
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, B)).toBe(17);
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Obscura Interceptor", () => {
  it("connives as it enters, then returns up to one target spell to its owner's hand", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    toLibrary(game, "Grizzly Bears");
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const interceptor = toHand(game, "Obscura Interceptor");
    pickTargets(a, divination);
    cast(game, interceptor, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 || zone(game, divination) === "hand");
    expect(zone(game, divination)).toBe("hand");
    expect(zone(game, interceptor)).toBe("battlefield");
    // Connived: drew the Bears and discarded the front of the hand.
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Denry Klin, Editor in Chief", () => {
  it("enters with the chosen counter, triggers for itself, and shares its counters with nontoken creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 2);
    a.chooseCreatureTypeFn = () => "first strike";
    const denry = toHand(game, "Denry Klin, Editor in Chief");
    cast(game, denry);
    // Its own entry is a nontoken creature you control entering.
    expect(counters(game, denry, "first-strike")).toBe(2);
    expect(counters(game, denry, "+1/+1")).toBe(0);
    const bear = enter(game, "Grizzly Bears");
    expect(counters(game, bear, "first-strike")).toBe(2);
    expect(keywords(game, bear).has("first-strike")).toBe(true);
    cast(game, toHand(game, "Raise the Alarm"));
    const soldiers = named(game, "Soldier Token", A);
    expect(soldiers.length).toBeGreaterThan(0);
    for (const soldier of soldiers) expect(counters(game, soldier, "first-strike")).toBe(0);
  });

  it("with no counters on it, the trigger does nothing", () => {
    const { game } = table();
    spawn(game, "Denry Klin, Editor in Chief");
    const bear = enter(game, "Grizzly Bears");
    expect(Object.values(game.state.objects[bear].counters).every((n) => n === 0)).toBe(true);
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});
