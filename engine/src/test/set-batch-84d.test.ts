/**
 * Set walk batch 84, part d (2026-10-15): Aetherdrift (DFT), Aetherdrift Commander (DRC) and Foundations (FDN), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
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
  watchTargets,
  zone,
} from "./harness.js";

const energy = (game: ReturnType<typeof table>["game"], player = A): number => game.state.players[player].energy;

describe("Peema Trailblazer", () => {
  it("gets energy equal to the combat damage it deals to a player", () => {
    const { game, a } = table();
    const peema = spawn(game, "Peema Trailblazer");
    attack(game, a, [peema]);
    expect(life(game, B)).toBe(17);
    expect(energy(game)).toBe(3);
  });

  it("exhaust: pays six energy for two counters, then draws equal to the greatest power counting them — once", () => {
    const { game } = table();
    const peema = spawn(game, "Peema Trailblazer");
    spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm", B);
    game.state.players[A].energy = 7;
    const before = hand(game).length;
    activate(game, peema, 0);
    expect(counters(game, peema)).toBe(2);
    expect(hand(game).length).toBe(before + 5);
    expect(energy(game)).toBe(1);
    game.state.players[A].energy = 6;
    expect(() => activate(game, peema, 0)).toThrow();
  });

  it("can't exhaust with fewer than six energy", () => {
    const { game } = table();
    const peema = spawn(game, "Peema Trailblazer");
    game.state.players[A].energy = 5;
    expect(() => activate(game, peema, 0)).toThrow();
  });
});

describe("Priest of the Crossing", () => {
  it("at each end step, X counters on each creature you control — X your creatures that died this turn", () => {
    const { game } = table();
    const priest = spawn(game, "Priest of the Crossing");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Hill Giant"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, priest)).toBe(2);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
  });

  it("on an opponent's end step too, and nothing when none of yours died", () => {
    const { game } = table();
    const priest = spawn(game, "Priest of the Crossing");
    toStep(game, "end");
    settle(game);
    expect(counters(game, priest)).toBe(0);
    nextTurn(game);
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end", B);
    settle(game);
    expect(counters(game, priest)).toBe(1);
  });
});

describe("Faebloom Trick", () => {
  it("creates two Faeries, then its reflexive ability taps a creature an opponent controls", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Faebloom Trick"));
    expect(tokensNamed(game, "Faerie Token", A)).toBe(2);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([giant, bears].sort());
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
  });

  it("still makes the Faeries with no opposing creature to tap", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Faebloom Trick"));
    expect(tokensNamed(game, "Faerie Token", A)).toBe(2);
  });
});

describe("Vampire Gourmand", () => {
  it("attacking, may sacrifice another creature to draw and be unblockable this turn", () => {
    const { game, a, b } = table();
    const gourmand = spawn(game, "Vampire Gourmand");
    const fodder = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    a.choosePermanentsFn = () => [fodder];
    a.chooseSacrificesFn = () => [fodder];
    let blockAsked = false;
    b.declareBlockersFn = () => {
      blockAsked = true;
      return [];
    };
    const before = hand(game).length;
    attack(game, a, [gourmand]);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(keywords(game, gourmand).has("unblockable")).toBe(true);
    // Nothing could block it, so the Giant was never asked.
    expect(blockAsked).toBe(false);
    expect(zone(game, blocker)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });

  it("declining draws nothing and it can be blocked", () => {
    const { game, a } = table();
    const gourmand = spawn(game, "Vampire Gourmand");
    const fodder = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Hill Giant", B);
    pickModes(a);
    const before = hand(game).length;
    const offer = blockOffer(game, a, [gourmand]);
    expect(zone(game, fodder)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
    expect(offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? []).toContain(gourmand);
  });
});

describe("Sphinx of Forgotten Lore", () => {
  it("attacking, gives an instant or sorcery card in your graveyard flashback at its mana cost", () => {
    const { game, a } = table();
    const sphinx = spawn(game, "Sphinx of Forgotten Lore");
    expect(keywords(game, sphinx).has("flash")).toBe(true);
    const shock = toGraveyard(game, "Shock");
    const theirs = toGraveyard(game, "Shock", B);
    toGraveyard(game, "Grizzly Bears");
    attack(game, a, [sphinx]);
    expect(game.state.objects[shock].grantedFlashback?.cost).toBe("{R}");
    expect(game.state.objects[theirs].grantedFlashback?.cost).toBeUndefined();
    lands(game, "Mountain", 1);
    cast(game, shock, { targets: [ref(B)], via: "flashback" });
    expect(life(game, B)).toBe(20 - 3 - 2);
    expect(zone(game, shock)).toBe("exile");
  });
});

describe("Quick-Draw Katana", () => {
  it("equipped creature gets +2/+0 and first strike during your turn only", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const katana = spawn(game, "Quick-Draw Katana");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, katana, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Fleeting Flight", () => {
  it("a +1/+1 counter, flying this turn, and no combat damage to it — other damage still lands", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Fleeting Flight"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    b.declareBlockersFn = () => [{ blocker: angel, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.objects[angel].damageMarked).toBe(3);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    nextTurn(game);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Ashroot Animist", () => {
  it("attacking, another creature you control gains trample and +X/+X, X its power as the ability resolves", () => {
    const { game, a } = table();
    const animist = spawn(game, "Ashroot Animist");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [animist]);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    // X was fixed as it resolved.
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [
      ref(animist),
    ]);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Inspiration from Beyond", () => {
  it("mills three, then returns an instant or sorcery card from your graveyard — milled or not — to your hand", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Hill Giant");
    const shock = toGraveyard(game, "Shock");
    const seen = pickFromZone(a, shock);
    const spell = toHand(game, "Inspiration from Beyond");
    cast(game, spell);
    expect([...seen.offered].sort()).toEqual([bolt, shock].sort());
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(graveyard(game)).toHaveLength(4);
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("flashback {5}{U}{U}, then exiled", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const spell = toGraveyard(game, "Inspiration from Beyond");
    cast(game, spell, { via: "flashback" });
    expect(zone(game, spell)).toBe("exile");
  });
});

describe("Arbiter of Woe", () => {
  it("costs a creature to cast; entering, each opponent discards and loses 2, you draw and gain 2", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears");
    const arbiter = toHand(game, "Arbiter of Woe");
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    cast(game, arbiter, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, arbiter)).toBe("battlefield");
    expect(hand(game, B)).toHaveLength(theirs - 1);
    expect(life(game, B)).toBe(18);
    expect(hand(game)).toHaveLength(mine - 1 + 1);
    expect(life(game)).toBe(22);
  });

  it("can't be cast with no creature to sacrifice", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    expect(() => cast(game, toHand(game, "Arbiter of Woe"))).toThrow();
  });
});

describe("Claws Out", () => {
  it("costs {1} less for each Cat you control and gives your creatures +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Felidar Savior", B);
    expect(() => cast(game, toHand(game, "Claws Out"))).toThrow();
    spawn(game, "Felidar Savior");
    spawn(game, "Felidar Savior");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Claws Out"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fiendish Panda", () => {
  it("grows as you gain life; dying, returns a non-Bear creature card with mana value up to the power it died with", () => {
    const { game, a } = table();
    const panda = spawn(game, "Fiendish Panda");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(counters(game, panda)).toBe(2);
    const angel = toGraveyard(game, "Serra Angel");
    const giant = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm");
    toGraveyard(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [angel]);
    destroy(game, panda);
    expect([...seen.offered[0]].sort()).toEqual([angel, giant].sort());
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Vanguard Seraph", () => {
  it("surveils 1 for the first life gain each turn only", () => {
    const { game, a } = table();
    spawn(game, "Vanguard Seraph");
    let surveils = 0;
    a.chooseScryFn = (_view, cards, mode) => {
      if (mode === "surveil") surveils += 1;
      return cards;
    };
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(surveils).toBe(1);
    expect(graveyard(game)).toHaveLength(1);
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(surveils).toBe(2);
  });

  it("doesn't trigger in a turn you'd gained life before it arrived", () => {
    const { game, a } = table();
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    spawn(game, "Vanguard Seraph");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(surveils).toBe(0);
  });
});

describe("Luminous Rebuke", () => {
  it("costs {3} less aimed at a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const untapped = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Luminous Rebuke"), { targets: [ref(untapped)] })).toThrow();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Luminous Rebuke"), { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });
});

describe("Dreadwing Scavenger", () => {
  it("loots as it enters and as it attacks", () => {
    const { game, a } = table();
    const before = hand(game).length;
    const scavenger = enter(game, "Dreadwing Scavenger");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(1);
    attack(game, a, [scavenger]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(2);
  });

  it("threshold: +1/+1 and deathtouch with seven or more cards in your graveyard", () => {
    const { game } = table();
    const scavenger = spawn(game, "Dreadwing Scavenger");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, scavenger)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, scavenger).has("deathtouch")).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, scavenger)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, scavenger).has("deathtouch")).toBe(true);
  });
});

describe("Felidar Savior", () => {
  it("entering, a +1/+1 counter on each of up to two other creatures you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears, giant]);
    const savior = enter(game, "Felidar Savior");
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, savior)).toBe(0);
    expect(keywords(game, savior).has("lifelink")).toBe(true);
  });

  it("up to two: may choose fewer", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    watchTargets(a, () => [bears, null]);
    enter(game, "Felidar Savior");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Arcane Epiphany", () => {
  it("draws three, costing {1} less while you control a Wizard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    expect(() => cast(game, toHand(game, "Arcane Epiphany"))).toThrow();
    spawn(game, "Drake Hatcher");
    const spell = toHand(game, "Arcane Epiphany");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Felling Blow", () => {
  it("a +1/+1 counter, then that creature deals damage equal to its power to a creature an opponent controls", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Felling Blow"), { targets: [ref(bears), ref(giant)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("still puts the counter on when the other target is gone", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Felling Blow"), { targets: [ref(bears), ref(giant)], settle: false });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(giant)]);
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Inspiring Paladin", () => {
  it("during your turn, it and your creatures with +1/+1 counters have first strike", () => {
    const { game } = table();
    const paladin = spawn(game, "Inspiring Paladin");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters = { "+1/+1": 1 };
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters = { "+1/+1": 1 };
    const fs = (id: ObjectId): boolean => keywords(game, id).has("first-strike");
    expect([fs(paladin), fs(countered), fs(plain), fs(theirs)]).toEqual([true, true, false, false]);
    nextTurn(game);
    expect([fs(paladin), fs(countered), fs(plain), fs(theirs)]).toEqual([false, false, false, false]);
  });
});

describe("Drake Hatcher", () => {
  it("gets incubation counters equal to its combat damage to a player, prowess included; vigilance", () => {
    const { game, a } = table();
    const hatcher = spawn(game, "Drake Hatcher");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, hatcher)).toEqual({ power: 2, toughness: 4 });
    attack(game, a, [hatcher]);
    expect(counters(game, hatcher, "incubation")).toBe(2);
    expect(game.state.objects[hatcher].tapped).toBe(false);
  });

  it("removes three incubation counters to create a 2/2 flying Drake", () => {
    const { game } = table();
    const hatcher = spawn(game, "Drake Hatcher");
    game.state.objects[hatcher].counters = { incubation: 2 };
    expect(() => activate(game, hatcher, 0)).toThrow();
    game.state.objects[hatcher].counters = { incubation: 4 };
    activate(game, hatcher, 0);
    expect(tokensNamed(game, "Drake Token", A)).toBe(1);
    expect(counters(game, hatcher, "incubation")).toBe(1);
  });
});
