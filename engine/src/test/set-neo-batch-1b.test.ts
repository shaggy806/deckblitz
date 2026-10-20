/**
 * Kamigawa: Neon Dynasty (and its Commander decks, and Crimson Vow
 * Commander), group b. One test (or two) per card, on its riskiest clause
 * and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
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
  watchTargets,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

/** The seat casts `card` when offered a cast-now (free, no targets), or
 * declines with `null`; records what was offered. */
function castNow(seat: ScriptedController, card: ObjectId | null): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    if (card === null || !offer.cards.includes(card)) return null;
    const way = offer.casts.find((c) => c.card === card)!;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Myojin of Cryptic Dreams", () => {
  it("cast from hand, it enters with an indestructible counter; the counter copies a permanent spell three times", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const myojin = toHand(game, "Myojin of Cryptic Dreams");
    cast(game, myojin);
    expect(counters(game, myojin, "indestructible")).toBe(1);
    expect(keywords(game, myojin).has("indestructible")).toBe(true);

    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    activate(game, myojin, 0, { targets: [ref(bears)] });
    expect(counters(game, myojin, "indestructible")).toBe(0);
    expect(named(game, "Grizzly Bears")).toHaveLength(4);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(3);
  });

  it("put onto the battlefield without being cast, it has no counter to remove", () => {
    const { game } = table();
    const myojin = enter(game, "Myojin of Cryptic Dreams");
    expect(counters(game, myojin, "indestructible")).toBe(0);
    expect(() => activate(game, myojin, 0, { targets: [] })).toThrow();
  });
});

describe("Myojin of Blooming Dawn", () => {
  it("makes a 1/1 colorless Spirit for each permanent you control", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const myojin = toHand(game, "Myojin of Blooming Dawn");
    cast(game, myojin);
    expect(counters(game, myojin, "indestructible")).toBe(1);
    spawn(game, "Grizzly Bears", B);
    // Eight Plains and the Myojin: nine.
    activate(game, myojin);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(9);
    expect(counters(game, myojin, "indestructible")).toBe(0);
  });
});

describe("Spring-Leaf Avenger", () => {
  it("ninjutsu in, then its combat damage returns a permanent card from your graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const ninja = toHand(game, "Spring-Leaf Avenger");
    const ring = toGraveyard(game, "Sol Ring");
    const giant = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Opt");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    const index = game.registry.get("Spring-Leaf Avenger").activated.findIndex((x) => x.ninjutsu === true);
    game.dispatch({ type: "activate-ability", player: A, source: ninja, abilityIndex: index, targets: [] });
    const seen = watchTargets(a, (offered) => [offered[0].includes(ring) ? ring : null]);
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, ninja)).toBe("battlefield");
    expect(life(game, B)).toBe(14);
    // Opt isn't a permanent card.
    expect([...seen.offered[0]].sort()).toEqual([ring, giant].sort());
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Dragonspark Reactor", () => {
  it("counts itself and each other artifact entering, then deals that much to a player and up to one creature", () => {
    const { game } = table();
    const reactor = enter(game, "Dragonspark Reactor");
    expect(counters(game, reactor, "charge")).toBe(1);
    enter(game, "Sol Ring");
    enter(game, "Grizzly Bears");
    expect(counters(game, reactor, "charge")).toBe(2);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 4);
    // Counted as it was sacrificed.
    activate(game, reactor, 0, { targets: [ref(B), ref(giant)] });
    expect(zone(game, reactor)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("the creature is optional", () => {
    const { game } = table();
    const reactor = enter(game, "Dragonspark Reactor");
    lands(game, "Mountain", 4);
    activate(game, reactor, 0, { targets: [ref(B), null] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Spinning Wheel Kick", () => {
  it("your creature deals damage equal to its power to each of X targets", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const giant = spawn(game, "Hill Giant");
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    const b3 = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spinning Wheel Kick"), { x: 2, targets: [ref(giant), ref(b1), ref(b2)] });
    expect(zone(game, b1)).toBe("graveyard");
    expect(zone(game, b2)).toBe("graveyard");
    expect(zone(game, b3)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("if your creature has left by then, it deals no damage (rule 608.2b)", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spinning Wheel Kick"), { x: 1, targets: [ref(giant), ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("the creature you control can be one of the X — it deals damage to itself", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spinning Wheel Kick"), { x: 1, targets: [ref(giant), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Explosive Entry", () => {
  it("destroys up to one artifact and puts a +1/+1 counter on up to one creature", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Explosive Entry"), { targets: [ref(ring), ref(bears)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });

  it("with no artifact, still puts the counter", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Explosive Entry"), { targets: [null, ref(bears)] });
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Imperial Recovery Unit", () => {
  it("crewed and attacking, returns a creature or Vehicle card with mana value 2 or less", () => {
    const { game, a } = table();
    const unit = spawn(game, "Imperial Recovery Unit");
    spawn(game, "Grizzly Bears");
    const bears = toGraveyard(game, "Grizzly Bears");
    const copter = toGraveyard(game, "Smuggler's Copter");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Sol Ring");
    activate(game, unit);
    expect(types(game, unit)).toContain("creature");
    const seen = watchTargets(a, () => [copter]);
    attack(game, a, [unit]);
    expect([...seen.offered[0]].sort()).toEqual([bears, copter].sort());
    expect(zone(game, copter)).toBe("hand");
  });
});

describe("Replication Specialist", () => {
  it("pays {1}{U} to copy a nontoken artifact that enters", () => {
    const { game, a } = table();
    spawn(game, "Replication Specialist");
    lands(game, "Island", 2);
    pickModes(a, 0);
    enter(game, "Sol Ring");
    expect(named(game, "Sol Ring")).toHaveLength(2);
    expect(tokensNamed(game, "Sol Ring")).toBe(1);
  });

  it("a token artifact entering doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Replication Specialist");
    lands(game, "Island", 2);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });
});

describe("Commune with Spirits", () => {
  it("offers only an enchantment or land card from the top four and bottoms the rest", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    toLibrary(game, "Grizzly Bears");
    const anthem = toLibrary(game, "Glorious Anthem");
    toLibrary(game, "Opt");
    toLibrary(game, "Sol Ring");
    const seen = pickFromZone(a, anthem);
    cast(game, toHand(game, "Commune with Spirits"));
    expect(seen.offered).toEqual([anthem]);
    expect(zone(game, anthem)).toBe("hand");
    expect(game.state.objects[library(game)[0]].cardName).toBe("Wastes");
  });
});

describe("Ambitious Assault", () => {
  it("+2/+0 to your creatures, and a card if you control a modified creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const before = hand(game).length;
    cast(game, toHand(game, "Ambitious Assault"));
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(hand(game).length).toBe(before + 1);
  });

  it("no modified creature, no card", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Ambitious Assault"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(hand(game).length).toBe(before);
  });
});

describe("Mukotai Soulripper", () => {
  it("attacking, may sacrifice another artifact or creature for a +1/+1 counter and menace", () => {
    const { game, a } = table();
    const ripper = spawn(game, "Mukotai Soulripper");
    spawn(game, "Hill Giant");
    const ring = spawn(game, "Sol Ring");
    const sacOffered: ObjectId[] = [];
    activate(game, ripper);
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      sacOffered.push(...eligible);
      return [ring];
    };
    a.declareAttackersFn = () => [{ attacker: ripper, defender: B }];
    toStep(game, "declare-blockers");
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, ripper)).toBe(1);
    expect(keywords(game, ripper).has("menace")).toBe(true);
    // "Another": never itself.
    expect(sacOffered).not.toContain(ripper);
  });
});

describe("Discover the Impossible", () => {
  it("exiles one face down, and a cheap instant may be cast free", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const opt = toLibrary(game, "Opt");
    pickFromZone(a, opt);
    const seen = castNow(a, opt);
    const before = library(game).length;
    cast(game, toHand(game, "Discover the Impossible"));
    expect(seen.offered).toEqual([[opt]]);
    expect(zone(game, opt)).toBe("graveyard");
    // Four went to the bottom; Opt's scry and draw took one more.
    expect(library(game).length).toBe(before - 2);
  });

  it("anything else goes to your hand", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    // An instant of mana value 3 (another Discover the Impossible).
    const pricey = toLibrary(game, "Discover the Impossible");
    pickFromZone(a, pricey);
    const seen = castNow(a, pricey);
    cast(game, toHand(game, "Discover the Impossible"));
    expect(seen.offered.flat()).not.toContain(pricey);
    expect(zone(game, pricey)).toBe("hand");
  });

  it("a sorcery of mana value 1 isn't offered either", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const ponder = toLibrary(game, "Ponder");
    pickFromZone(a, ponder);
    const seen = castNow(a, ponder);
    cast(game, toHand(game, "Discover the Impossible"));
    expect(seen.offered.flat()).not.toContain(ponder);
    expect(zone(game, ponder)).toBe("hand");
  });

  it("the card is exiled face down: the opponent never sees it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    castNow(a, null);
    cast(game, toHand(game, "Discover the Impossible"));
    expect(zone(game, bears)).toBe("hand");
    expect(game.viewFor(B).objects[bears]).toBeUndefined();
  });
});

describe("Suit Up", () => {
  it("a Vehicle becomes a 4/5 artifact creature until end of turn, and you draw", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const copter = spawn(game, "Smuggler's Copter");
    const before = hand(game).length;
    cast(game, toHand(game, "Suit Up"), { targets: [ref(copter)] });
    expect(types(game, copter)).toContain("creature");
    expect(pt(game, copter)).toEqual({ power: 4, toughness: 5 });
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "precombat-main", B);
    expect(types(game, copter)).not.toContain("creature");
  });

  it("a creature's +1/+1 counters still apply over the new base", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Suit Up"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 6 });
    expect(types(game, bears)).toContain("artifact");
  });
});

describe("Naomi, Pillar of Order", () => {
  it("enters or attacks with an artifact and an enchantment: a 2/2 Samurai", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Glorious Anthem");
    const naomi = enter(game, "Naomi, Pillar of Order");
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
    attack(game, a, [naomi]);
    expect(tokensNamed(game, "Samurai Token", A)).toBe(2);
  });

  it("without an enchantment, nothing", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    enter(game, "Naomi, Pillar of Order");
    expect(tokensNamed(game, "Samurai Token", A)).toBe(0);
  });
});

describe("When We Were Young", () => {
  it("+2/+2 to up to two creatures, and lifelink with an artifact and an enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Sol Ring");
    spawn(game, "Glorious Anthem");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Hill Giant");
    cast(game, toHand(game, "When We Were Young"), { targets: [ref(x), ref(y)] });
    expect(pt(game, x)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, x).has("lifelink")).toBe(true);
    expect(keywords(game, y).has("lifelink")).toBe(true);
  });

  it("without both, no lifelink", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Glorious Anthem");
    const x = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "When We Were Young"), { targets: [ref(x), null] });
    expect(pt(game, x)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, x).has("lifelink")).toBe(false);
  });
});

describe("Predators' Hour", () => {
  it("menace, and combat damage exiles that player's top card face down for you to play with any mana", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant");
    const top = toLibrary(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Predators' Hour"));
    expect(keywords(game, giant).has("menace")).toBe(true);
    attack(game, a, [giant]);
    settle(game);
    expect(zone(game, top)).toBe("exile");
    expect(game.viewFor(B).objects[top]).toBeUndefined();
    // {1}{G} with only Swamps: mana as though it were any color.
    expect(castable(game, top)).toBe(true);
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
    expect(game.state.objects[top].controller).toBe(A);
  });

  it("a creature that comes under your control afterwards doesn't gain it", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Predators' Hour"));
    const late = spawn(game, "Grizzly Bears");
    expect(keywords(game, late).has("menace")).toBe(false);
  });
});

