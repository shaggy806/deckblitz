/**
 * Core Set 2021 (M21) — group c: Basri's, Chandra's, Liliana's, Garruk's and
 * Teferi's planeswalker-deck cards and the rest.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Basri's Lieutenant", () => {
  it("a creature you control dying with a +1/+1 counter makes a Knight; one without doesn't", () => {
    const { game } = table();
    spawn(game, "Basri's Lieutenant");
    const marked = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(marked)]);
    destroy(game, plain);
    expect(tokensNamed(game, "Knight Token", A)).toBe(0);
    destroy(game, marked);
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });

  it("its own death counts too", () => {
    const { game } = table();
    const lieutenant = spawn(game, "Basri's Lieutenant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(lieutenant)]);
    destroy(game, lieutenant);
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });
});

describe("Thieves' Guild Enforcer", () => {
  it("another Rogue entering mills each opponent two, and so does its own entry", () => {
    const { game } = table();
    const first = spawn(game, "Thieves' Guild Enforcer");
    enter(game, "Thieves' Guild Enforcer");
    expect(graveyard(game, B)).toHaveLength(4);
    expect(pt(game, first)).toEqual({ power: 1, toughness: 1 });
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes", B);
    expect(pt(game, first)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, first).has("deathtouch")).toBe(true);
  });
});

describe("Chandra, Flame's Catalyst", () => {
  it("−2 casts a red instant from the graveyard, paying for it, and exiles it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const chandra = spawn(game, "Chandra, Flame's Catalyst");
    const bolt = toGraveyard(game, "Lightning Bolt");
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: bolt,
      targets: [ref(B)],
      via: offer.casts.find((c) => c.card === bolt)!.via,
    });
    loyalty(game, chandra, -2, { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("−8 discards the hand, draws seven, and lets spells from hand be cast free this turn", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flame's Catalyst");
    expect(hand(game).length).toBeGreaterThan(0);
    loyalty(game, chandra, -8, { atLeast: 8 });
    expect(hand(game)).toHaveLength(7);
    const wurm = toHand(game, "Craw Wurm");
    cast(game, wurm, { free: true });
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Keral Keep Disciples", () => {
  it("a Chandra's loyalty ability deals 1 damage to each opponent", () => {
    const { game } = table();
    spawn(game, "Keral Keep Disciples");
    const chandra = spawn(game, "Chandra, Flame's Catalyst");
    loyalty(game, chandra, 1, { atLeast: 5 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Niambi, Esteemed Speaker", () => {
  it("returns another creature and gains life equal to its mana value", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    pickModes(a, 0);
    enter(game, "Niambi, Esteemed Speaker");
    expect(zone(game, giant)).toBe("hand");
    expect(life(game)).toBe(24);
  });

  it("declining returns nothing and gains nothing", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    pickModes(a);
    enter(game, "Niambi, Esteemed Speaker");
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game)).toBe(20);
  });
});

describe("Liliana's Scrounger", () => {
  it("after a creature died, puts a loyalty counter on a Liliana at the end step", () => {
    const { game, a } = table();
    spawn(game, "Liliana's Scrounger");
    const liliana = spawn(game, "Liliana Vess");
    const before = counters(game, liliana, "loyalty");
    destroy(game, spawn(game, "Grizzly Bears", B));
    pickPermanents(a, liliana);
    toStep(game, "end");
    settle(game);
    expect(counters(game, liliana, "loyalty")).toBe(before + 1);
  });
});

describe("Ornery Dilophosaur", () => {
  it("gets +2/+2 attacking only while you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    const dino = spawn(game, "Ornery Dilophosaur");
    attack(game, a, [dino]);
    expect(pt(game, dino)).toEqual({ power: 2, toughness: 2 });
  });

  it("with a 6-power creature beside it", () => {
    const { game, a } = table();
    const dino = spawn(game, "Ornery Dilophosaur");
    spawn(game, "Craw Wurm");
    attack(game, a, [dino]);
    expect(pt(game, dino)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Gloom Sower", () => {
  it("the blocker's controller loses 2 and you gain 2", () => {
    const { game, a, b } = table();
    const sower = spawn(game, "Gloom Sower");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: sower }];
    attack(game, a, [sower]);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
  });
});

describe("Bad Deal", () => {
  it("you draw two, each opponent discards two, everyone loses 2", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const deal = toHand(game, "Bad Deal");
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    cast(game, deal);
    expect(hand(game)).toHaveLength(mine - 1 + 2);
    expect(hand(game, B)).toHaveLength(theirs - 2);
    expect(life(game)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Traitorous Greed", () => {
  it("steals and untaps a creature with haste, and adds two mana of one colour", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Traitorous Greed"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    const pool = game.state.players[A].manaPool.map((u) => u.type);
    expect(pool).toHaveLength(2);
    expect(pool[0]).toBe(pool[1]);
  });
});

describe("Radha, Heart of Keld", () => {
  it("gets +X/+X for the lands you control", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 4);
    const radha = spawn(game, "Radha, Heart of Keld");
    activate(game, radha, 0);
    expect(pt(game, radha)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Sabertooth Mauler", () => {
  it("at your end step after a death, gets a counter and untaps", () => {
    const { game } = table();
    const mauler = spawn(game, "Sabertooth Mauler", A, { tapped: true });
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, mauler)).toBe(1);
    expect(game.state.objects[mauler].tapped).toBe(false);
  });
});

describe("Secure the Scene", () => {
  it("exiles the permanent and its controller gets the Soldier", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Secure the Scene"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });
});

describe("Basri's Aegis", () => {
  it("puts a counter on each of two target creatures, the search declined", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    cast(game, toHand(game, "Basri's Aegis"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Historian of Zhalfir", () => {
  it("draws on attack only with a Teferi planeswalker", () => {
    const { game, a } = table();
    const historian = spawn(game, "Historian of Zhalfir");
    spawn(game, "Teferi, Hero of Dominaria");
    const before = hand(game).length;
    attack(game, a, [historian]);
    expect(hand(game)).toHaveLength(before + 1);
  });
});
