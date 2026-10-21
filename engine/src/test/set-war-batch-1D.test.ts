/**
 * War of the Spark (WAR; B123), group D. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  attack,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const planeswalker = (game: Game, name: string, player: PlayerId, n: number): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].counters.loyalty = n;
  return id;
};

describe("Dreadhorde Arcanist", () => {
  it("casts an instant or sorcery card with mana value up to its power from your graveyard free, then exiles it", () => {
    const { game, a } = table();
    const arcanist = spawn(game, "Dreadhorde Arcanist");
    const opt = toGraveyard(game, "Opt");
    const divination = toGraveyard(game, "Divination");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [opt]);
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: opt,
      targets: [],
      via: offer.casts.find((c) => c.card === opt)!.via,
      ...(offer.free ? { free: true } : {}),
    });
    const before = hand(game).length;
    attack(game, a, [arcanist]);
    // Power 1: Opt (mana value 1) but not Divination (3).
    expect(seen.offered[0]).toEqual(expect.arrayContaining([opt, bolt]));
    expect(seen.offered[0]).not.toContain(divination);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, opt)).toBe("exile");
  });
});

describe("Courage in Crisis", () => {
  it("puts a +1/+1 counter on the creature, then proliferates it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    a.chooseProliferateFn = (_view, eligible) => eligible;
    cast(game, toHand(game, "Courage in Crisis"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Guildpact Informant", () => {
  it("proliferates after dealing combat damage to a planeswalker", () => {
    const { game, a } = table();
    const informant = spawn(game, "Guildpact Informant");
    const nissa = planeswalker(game, "Nissa, Who Shakes the World", B, 5);
    a.chooseProliferateFn = (_view, eligible) => eligible;
    attack(game, a, [informant], nissa);
    // 5 − 1 damage, then proliferated back up by one.
    expect(counters(game, nissa, "loyalty")).toBe(5);
  });
});

describe("Bond of Insight", () => {
  it("returns a card it just milled, then exiles itself", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    lands(game, "Island", 4);
    const bond = toHand(game, "Bond of Insight");
    const theirs = graveyard(game, B).length;
    pickFromZone(a, bolt, divination);
    cast(game, bond);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, divination)).toBe("hand");
    expect(graveyard(game, B).length).toBe(theirs + 4);
    expect(zone(game, bond)).toBe("exile");
  });
});

describe("Tolsimir, Friend to Wolves", () => {
  it("makes Voja, whose entry gains 3 life and fights a creature you don't control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Tolsimir, Friend to Wolves");
    const [voja] = named(game, "Voja, Friend to Elves", A);
    expect(voja).toBeDefined();
    expect(life(game)).toBe(23);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[voja].damageMarked).toBe(2);
  });
});

describe("Vraska, Swarm's Eminence", () => {
  it("grows a deathtouch creature that deals damage to a player", () => {
    const { game, a } = table();
    spawn(game, "Vraska, Swarm's Eminence");
    const rats = spawn(game, "Typhoid Rats");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [rats, bears]);
    expect(counters(game, rats)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("−2 makes an Assassin that destroys a planeswalker it deals damage to", () => {
    const { game, a } = table();
    const vraska = spawn(game, "Vraska, Swarm's Eminence");
    loyalty(game, vraska, -2, { atLeast: 5 });
    const [token] = named(game, "Assassin Token (Vraska, Swarm's Eminence)", A);
    expect(token).toBeDefined();
    game.state.objects[token].summoningSick = false;
    const nissa = planeswalker(game, "Nissa, Who Shakes the World", B, 5);
    attack(game, a, [token], nissa);
    expect(zone(game, nissa)).toBe("graveyard");
    // Vraska's own trigger: a deathtouch creature dealt damage to a planeswalker.
    expect(counters(game, token)).toBe(1);
  });
});

describe("Vivien's Grizzly", () => {
  it("takes a creature card, and puts anything else on the bottom", () => {
    const { game, a } = table();
    const grizzly = spawn(game, "Vivien's Grizzly");
    lands(game, "Forest", 8);
    const library = (): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, grizzly, 0);
    expect(zone(game, bears)).toBe("hand");
    const opt = toLibrary(game, "Opt");
    const top = library().indexOf(opt);
    const before = hand(game).length;
    pickFromZone(a);
    activate(game, grizzly, 0);
    expect(hand(game).length).toBe(before);
    expect(library().indexOf(opt)).toBe(top === 0 ? library().length - 1 : 0);
  });
});

describe("Nissa's Triumph", () => {
  it("finds only basic Forests without a Nissa", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Nissa's Triumph"));
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
  });

  it("finds up to three land cards of any kind with a Nissa", () => {
    const { game, a } = table();
    planeswalker(game, "Nissa, Who Shakes the World", A, 5);
    lands(game, "Forest", 2);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Nissa's Triumph"));
    // The Triumph left the hand; three Wastes came in.
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Domri's Ambush", () => {
  it("grows your creature, then it deals damage equal to its power to a planeswalker", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const nissa = planeswalker(game, "Nissa, Who Shakes the World", B, 5);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Domri's Ambush"), { targets: [ref(bears), ref(nissa)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, nissa, "loyalty")).toBe(2);
  });
});

describe("Tenth District Legionnaire", () => {
  it("gets a +1/+1 counter when you cast a spell that targets it", () => {
    const { game } = table();
    const legionnaire = spawn(game, "Tenth District Legionnaire");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(legionnaire)] });
    expect(counters(game, legionnaire)).toBe(1);
    expect(pt(game, legionnaire)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Mizzium Tank", () => {
  it("becomes a 4/3 artifact creature when you cast a noncreature spell", () => {
    const { game } = table();
    const tank = spawn(game, "Mizzium Tank");
    expect(types(game, tank)).not.toContain("creature");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(types(game, tank)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, tank)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Cyclops Electromancer", () => {
  it("deals damage equal to the instant and sorcery cards in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Cyclops Electromancer");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Kronch Wrangler", () => {
  it("grows when a creature with power 4 or greater enters under your control", () => {
    const { game } = table();
    const wrangler = spawn(game, "Kronch Wrangler");
    enter(game, "Grizzly Bears");
    expect(counters(game, wrangler)).toBe(0);
    enter(game, "Craw Wurm");
    expect(counters(game, wrangler)).toBe(1);
    enter(game, "Craw Wurm", B);
    expect(counters(game, wrangler)).toBe(1);
  });
});
