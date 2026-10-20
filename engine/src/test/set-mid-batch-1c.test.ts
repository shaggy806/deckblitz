/**
 * Innistrad: Midnight Hunt, group c. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const faceName = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const becomeNight = (game: Game): void => game.debugApplyEffect(A, { kind: "day-night", value: "night" }, []);
const opponentLosesOne = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
  settle(game);
};

describe("Tovolar's Huntmaster // Tovolar's Packleader", () => {
  it("the front makes two Wolves; the back makes two more as it attacks", () => {
    const { game, a } = table();
    const huntmaster = enter(game, "Tovolar's Huntmaster");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(2);
    becomeNight(game);
    expect(faceName(game, huntmaster)).toBe("Tovolar's Packleader");
    attack(game, a, [huntmaster]);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(4);
    expect(life(game, B)).toBe(13);
  });

  it("{2}{G}{G}: another Wolf or Werewolf you control fights a creature you don't control — never itself", () => {
    const { game } = table();
    game.state.dayNight = "night";
    const leader = enter(game, "Tovolar's Huntmaster");
    expect(faceName(game, leader)).toBe("Tovolar's Packleader");
    const [wolf] = named(game, "Wolf Token", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    expect(() => activate(game, leader, 0, { targets: [ref(leader), ref(bears)] })).toThrow();
    activate(game, leader, 0, { targets: [ref(wolf!), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Falkenrath Pit Fighter", () => {
  it("activates only once an opponent has lost life, sacrificing a Vampire (itself) and discarding to draw two", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const fighter = spawn(game, "Falkenrath Pit Fighter");
    toHand(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears");
    const action = { type: "activate-ability", player: A, source: fighter, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...action, sacrifice: fighter })).not.toBeNull();
    opponentLosesOne(game);
    // Not a Vampire.
    expect(game.canDispatch({ ...action, sacrifice: bears })).not.toBeNull();
    const before = hand(game).length;
    game.dispatch({ ...action, sacrifice: fighter });
    settle(game);
    expect(zone(game, fighter)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Dire-Strain Rampage", () => {
  const searchAll = (seat: ReturnType<typeof table>["b"]): void => {
    seat.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
  };

  it("a land destroyed lets its controller fetch up to two basics, tapped", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const forest = spawn(game, "Forest", B);
    pickModes(b, 0);
    searchAll(b);
    cast(game, toHand(game, "Dire-Strain Rampage"), { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    const fetched = named(game, "Wastes", B);
    expect(fetched).toHaveLength(2);
    expect(fetched.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("an artifact destroyed lets its controller fetch only one", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const memnite = spawn(game, "Memnite", B);
    pickModes(b, 0);
    searchAll(b);
    cast(game, toHand(game, "Dire-Strain Rampage"), { targets: [ref(memnite)] });
    expect(zone(game, memnite)).toBe("graveyard");
    expect(named(game, "Wastes", B)).toHaveLength(1);
  });

  it("can be cast again with flashback", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 3);
    const memnite = spawn(game, "Memnite", B);
    pickModes(b);
    const card = toGraveyard(game, "Dire-Strain Rampage");
    cast(game, card, { targets: [ref(memnite)], via: "flashback" });
    expect(zone(game, memnite)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Unnatural Moonrise", () => {
  it("makes it night and gives +1/+0, trample and a card on combat damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Unnatural Moonrise"), { targets: [ref(bears)] });
    expect(game.state.dayNight).toBe("night");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Consuming Blob", () => {
  it("counts card types in your graveyard only, and its end-step Ooze does the same", () => {
    const { game } = table();
    const blob = spawn(game, "Consuming Blob");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Memnite", B);
    toGraveyard(game, "Divination", B);
    expect(pt(game, blob)).toEqual({ power: 2, toughness: 3 });
    toStep(game, "end");
    settle(game);
    const [ooze] = named(game, "Ooze Token (Consuming Blob)", A);
    expect(ooze).toBeDefined();
    expect(pt(game, ooze!)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Jerren, Corrupted Bishop // Ormendahl, the Corrupter", () => {
  it("entering, and another nontoken Human dying, each cost 1 life for a Human token; a token Human dying doesn't", () => {
    const { game } = table();
    enter(game, "Jerren, Corrupted Bishop");
    expect(life(game, A)).toBe(19);
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
    const vanguard = spawn(game, "Elite Vanguard");
    destroy(game, vanguard);
    expect(life(game, A)).toBe(18);
    expect(tokensNamed(game, "Human Token", A)).toBe(2);
    const [token] = named(game, "Human Token", A);
    destroy(game, token!);
    expect(life(game, A)).toBe(18);
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
  });

  it("{2}: a Human you control gains lifelink", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const jerren = spawn(game, "Jerren, Corrupted Bishop");
    const vanguard = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, jerren, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, jerren, 0, { targets: [ref(vanguard)] });
    expect(keywords(game, vanguard).has("lifelink")).toBe(true);
  });

  it("at exactly 13 life it may pay {4}{B}{B} at the end step to transform; Ormendahl sacrifices another creature to draw", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 4);
    const jerren = spawn(game, "Jerren, Corrupted Bishop");
    game.state.players[A].life = 13;
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, jerren)).toBe("Ormendahl, the Corrupter");
    expect([...keywords(game, jerren)].sort()).toEqual(["flying", "lifelink", "trample"]);

    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    const action = { type: "activate-ability", player: A, source: jerren, abilityIndex: 0, targets: [] } as const;
    // "Another" creature: not Ormendahl itself.
    expect(game.canDispatch({ ...action, sacrifice: jerren })).not.toBeNull();
    game.dispatch({ ...action, sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("at 14 life the end-step ability doesn't trigger", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 4);
    const jerren = spawn(game, "Jerren, Corrupted Bishop");
    game.state.players[A].life = 14;
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, jerren)).toBe("Jerren, Corrupted Bishop");
  });
});

describe("Stolen Vitality", () => {
  it("+3/+1 and trample on your turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Stolen Vitality"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("first strike instead on another player's turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Stolen Vitality");
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A);
    cast(game, card, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Pack's Betrayal", () => {
  it("steals, untaps and hastes a creature; scries 2 only with a Wolf or Werewolf", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Pack's Betrayal"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    expect(scried).toBe(0);

    spawn(game, "Reckless Stormseeker");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pack's Betrayal"), { targets: [ref(bears)] });
    expect(scried).toBe(2);
  });
});

describe("Graveyard Trespasser // Graveyard Glutton", () => {
  it("exiling a creature card drains 1; a noncreature card doesn't", () => {
    const { game, a } = table();
    const bearsCard = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bearsCard);
    enter(game, "Graveyard Trespasser");
    expect(zone(game, bearsCard)).toBe("exile");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);

    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    enter(game, "Graveyard Trespasser");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(19);
  });

  it("the back face drains 1 for each creature card of the two it exiles", () => {
    const { game, a } = table();
    game.state.dayNight = "night";
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Hill Giant");
    pickTargets(a, one, two);
    const glutton = enter(game, "Graveyard Trespasser");
    expect(faceName(game, glutton)).toBe("Graveyard Glutton");
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Contortionist Troupe", () => {
  it("enters with X counters; coven at your end step puts a counter on target creature you control", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const troupe = toHand(game, "Contortionist Troupe");
    cast(game, troupe, { x: 3 });
    expect(counters(game, troupe)).toBe(3);
    spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });

  it("without three different powers, nothing happens", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const troupe = toHand(game, "Contortionist Troupe");
    cast(game, troupe, { x: 2 });
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Neonate's Rush", () => {
  it("costs {1} less with a Vampire, deals 1 to a creature and 1 to its controller, and draws", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Neonate's Rush");
    expect(() => cast(game, card, { targets: [ref(bears)] })).toThrow();
    spawn(game, "Vampire Interloper");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before - 1 + 1);
  });
});

describe("Heirloom Mirror // Inherited Fiend", () => {
  it("the third activation removes the ritual counters and transforms it, still tapped", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const mirror = spawn(game, "Heirloom Mirror");
    activate(game, mirror, 0);
    expect(counters(game, mirror, "ritual")).toBe(1);
    expect(life(game, A)).toBe(19);
    expect(graveyard(game)).toHaveLength(2);
    toStep(game, "precombat-main");
    activate(game, mirror, 0);
    toStep(game, "precombat-main");
    activate(game, mirror, 0);
    expect(faceName(game, mirror)).toBe("Inherited Fiend");
    expect(counters(game, mirror, "ritual")).toBe(0);
    expect(game.state.objects[mirror].tapped).toBe(true);
    expect(life(game, A)).toBe(17);
  });

  it("the Fiend exiles a creature card from a graveyard and grows", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mirror = spawn(game, "Heirloom Mirror");
    game.debugApplyEffect(A, { kind: "transform", target: "source" }, [], { source: mirror });
    settle(game);
    expect(faceName(game, mirror)).toBe("Inherited Fiend");
    const card = toGraveyard(game, "Grizzly Bears", B);
    activate(game, mirror, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("exile");
    expect(pt(game, mirror)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Search Party Captain", () => {
  it("costs {1} less for each creature you attacked with this turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const card = toHand(game, "Search Party Captain");
    expect(() => cast(game, card)).toThrow();
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    attack(game, a, [bears, lions]);
    const before = hand(game).length;
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 1);
  });
});

describe("Voldaren Stinger", () => {
  it("has first strike only while attacking, and pumps +2/+0", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const stinger = spawn(game, "Voldaren Stinger");
    expect(keywords(game, stinger).has("first-strike")).toBe(false);
    activate(game, stinger, 0);
    expect(pt(game, stinger)).toEqual({ power: 3, toughness: 1 });
    a.declareAttackersFn = () => [{ attacker: stinger, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, stinger).has("first-strike")).toBe(true);
  });
});

describe("Stuffed Bear", () => {
  it("{2}: becomes a 4/4 green Bear artifact creature until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Stuffed Bear");
    activate(game, bear, 0);
    expect([...types(game, bear)].sort()).toEqual(["artifact", "creature"]);
    expect(subtypes(game, bear)).toEqual(["Bear"]);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect([...computeCharacteristics(game.state, game.registry, bear).colors]).toEqual(["G"]);
    nextTurn(game);
    expect(types(game, bear)).toEqual(["artifact"]);
  });
});

describe("Falkenrath Perforator", () => {
  it("deals 1 damage to the defending player as it attacks", () => {
    const { game, a } = table();
    const perforator = spawn(game, "Falkenrath Perforator");
    attack(game, a, [perforator]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Loyal Gryff", () => {
  it("may return another creature you control to its owner's hand", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const gryff = toHand(game, "Loyal Gryff");
    const seen = pickPermanents(a, bears);
    cast(game, gryff);
    expect(zone(game, gryff)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
    expect(seen.offered).not.toContain(gryff);
  });
});

describe("Mounted Dreadknight", () => {
  it("enters with a +1/+1 counter only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 10);
    const first = toHand(game, "Mounted Dreadknight");
    cast(game, first);
    expect(counters(game, first)).toBe(0);
    opponentLosesOne(game);
    const second = toHand(game, "Mounted Dreadknight");
    cast(game, second);
    expect(counters(game, second)).toBe(1);
  });
});

describe("Purifying Dragon", () => {
  it("deals 2 to a Zombie it targets as it attacks", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Purifying Dragon");
    const corpse = spawn(game, "Walking Corpse", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, corpse);
    attack(game, a, [dragon]);
    expect(zone(game, corpse)).toBe("graveyard");
  });

  it("deals 1 to a non-Zombie", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Purifying Dragon");
    spawn(game, "Walking Corpse", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Ritual of Hope", () => {
  it("+1/+1 without coven", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Elite Vanguard");
    cast(game, toHand(game, "Ritual of Hope"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("+2/+1 instead with three different powers", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    cast(game, toHand(game, "Ritual of Hope"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Mourning Patrol // Morning Apparition and Galedrifter // Waildrifter", () => {
  it("Mourning Patrol's disturb casts Morning Apparition, exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const card = toGraveyard(game, "Mourning Patrol");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], via: "disturb", face: 1 });
    settle(game);
    expect(faceName(game, card)).toBe("Morning Apparition");
    expect(pt(game, card)).toEqual({ power: 2, toughness: 1 });
    expect([...keywords(game, card)].sort()).toEqual(["flying", "vigilance"]);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });

  it("Galedrifter's disturb casts Waildrifter, exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toGraveyard(game, "Galedrifter");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], via: "disturb", face: 1 });
    settle(game);
    expect(faceName(game, card)).toBe("Waildrifter");
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Somberwald Beastmaster", () => {
  it("makes a 2/2 Wolf, a 3/3 Beast and a 4/4 Beast, and creature tokens you control have deathtouch", () => {
    const { game } = table();
    const master = enter(game, "Somberwald Beastmaster");
    const wolf = named(game, "Wolf Token", A);
    const small = named(game, "3/3 Beast Token", A);
    const big = named(game, "Beast Token", A);
    expect([wolf.length, small.length, big.length]).toEqual([1, 1, 1]);
    expect(pt(game, small[0]!)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, big[0]!)).toEqual({ power: 4, toughness: 4 });
    for (const id of [wolf[0]!, small[0]!, big[0]!]) expect(keywords(game, id).has("deathtouch")).toBe(true);
    expect(keywords(game, master).has("deathtouch")).toBe(false);
  });
});
