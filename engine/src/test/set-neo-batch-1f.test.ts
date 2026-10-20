/**
 * Kamigawa: Neon Dynasty (with NEC and VOC), group f. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
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
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Put `n` counters of `kind` on `id`, as though alice's effect did. */
const addCounter = (game: Game, id: ObjectId, n = 1, kind = "+1/+1"): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: kind, amount: n }, [ref(id)]);
  settle(game);
};

const kill = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  settle(game);
};

const manaPool = (game: Game): string[] => game.state.players[A].manaPool.map((u) => u.type);

describe("One with the Kami", () => {
  it("the enchanted creature dying makes Spirits equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const giant = spawn(game, "Hill Giant"); // 3/3
    cast(game, toHand(game, "One with the Kami"), { targets: [ref(giant)] });
    kill(game, giant);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(3);
  });

  it("another modified creature counts; an unmodified one doesn't", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const host = spawn(game, "Grizzly Bears");
    const countered = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Hill Giant");
    cast(game, toHand(game, "One with the Kami"), { targets: [ref(host)] });
    addCounter(game, countered); // a 3/3 now
    kill(game, plain);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(0);
    kill(game, countered);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(3);
  });
});

describe("Concord with the Kami", () => {
  it("chooses all three modes: a counter, a draw for an enchanted creature, no Spirit without an equipped one", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    addCounter(game, giant);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] });
    spawn(game, "Concord with the Kami");
    pickModes(a, 0, 1, 2);
    pickTargets(a, giant);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(counters(game, giant)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(0);
  });

  it("an illegal target for the first mode stops the other modes too", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    addCounter(game, giant);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] });
    spawn(game, "Concord with the Kami");
    pickModes(a, 0, 1);
    pickTargets(a, giant);
    const before = hand(game).length;
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    // The giant leaves in response.
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(giant)]);
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("You Are Already Dead", () => {
  it("destroys a creature dealt damage this turn and draws a card", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "You Are Already Dead");
    expect(() => cast(game, card, { targets: [ref(bears)] })).toThrow();
    const shooter = spawn(game, "Memnite");
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(giant)], { source: shooter });
    settle(game);
    const before = hand(game).length;
    cast(game, card, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before); // the card left, one drawn
  });
});

describe("Return to Action", () => {
  it("+1/+0 and lifelink, and the creature comes back tapped when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Return to Action"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    kill(game, bears);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(keywords(game, back).has("lifelink")).toBe(false);
  });
});

describe("Clawing Torment", () => {
  it("on a creature: -1/-1, can't block, and its controller loses 1 life each upkeep", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Clawing Torment"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock ?? []).toEqual([]);
    expect(offer.eligible.find((e) => e.blocker === other)?.canBlock ?? []).toEqual([bears]);
    toStep(game, "postcombat-main");
    const afterCombat = life(game, B); // the unblocked Bears' 2
    toStep(game, "precombat-main", B);
    expect(life(game, B)).toBe(afterCombat - 1);
    expect(life(game, A)).toBe(20);
  });

  it("on an artifact: no P/T change, but its controller still loses life", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Clawing Torment"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    toStep(game, "precombat-main", B);
    expect(life(game, B)).toBe(19);
  });
});

const RAT = "Rat Rogue Token (Tribute to Horobi)";

/** Cast Tribute to Horobi and run it through chapter III; returns the
 * permanent, now Echo of Death's Wail. */
const throughTribute = (game: Game): ObjectId => {
  lands(game, "Swamp", 2);
  cast(game, toHand(game, "Tribute to Horobi"));
  toStep(game, "precombat-main");
  settle(game);
  toStep(game, "precombat-main");
  settle(game);
  const [echo] = named(game, "Tribute to Horobi", A);
  return echo;
};

describe("Tribute to Horobi", () => {
  it("I and II give each opponent a Rat Rogue; III returns it as Echo of Death's Wail, which takes all Rat tokens", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Tribute to Horobi"));
    expect(tokensNamed(game, RAT, B)).toBe(1);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, RAT, B)).toBe(2);
    const ratCard = spawn(game, "Nezumi Prowler", B); // a Rat, but not a token
    toStep(game, "precombat-main");
    settle(game);
    const [echo] = named(game, "Tribute to Horobi", A);
    expect(echo).toBeDefined();
    expect(game.state.objects[echo].face).toBe(1);
    expect(keywords(game, echo).has("flying")).toBe(true);
    expect(tokensNamed(game, RAT, B)).toBe(0);
    expect(tokensNamed(game, RAT, A)).toBe(2);
    expect(game.state.objects[ratCard].controller).toBe(B);
  });

  it("Echo of Death's Wail: attacking, you may sacrifice another creature to draw", () => {
    const { game, a } = table();
    const echo = throughTribute(game);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    a.chooseSacrificesFn = () => [bears];
    const before = hand(game).length;
    attack(game, a, [echo]);
    expect(life(game, B)).toBe(17); // it has haste
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Orochi Merge-Keeper", () => {
  it("taps for {G}; once modified, it also has {T}: Add {G}{G}", () => {
    const { game } = table();
    const keeper = spawn(game, "Orochi Merge-Keeper");
    expect(() => activate(game, keeper, 1, { settle: false })).toThrow();
    addCounter(game, keeper);
    activate(game, keeper, 1, { settle: false });
    expect(manaPool(game)).toEqual(["G", "G"]);
  });
});

describe("Twinshot Sniper", () => {
  it("deals 2 damage to any target as it enters", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Twinshot Sniper");
    expect(life(game, B)).toBe(18);
  });

  it("channel: discard it to deal 2 damage", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const card = toHand(game, "Twinshot Sniper");
    activate(game, card, 0, { targets: [ref(B)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Careful Cultivation", () => {
  it("+1/+3, reach and {T}: Add {G}{G} on a creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Careful Cultivation"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    activate(game, bears, 0, { settle: false });
    expect(manaPool(game)).toEqual(["G", "G"]);
  });

  it("channel: a Human Monk token", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const card = toHand(game, "Careful Cultivation");
    activate(game, card, 0);
    expect(zone(game, card)).toBe("graveyard");
    expect(tokensNamed(game, "Human Monk Token", A)).toBe(1);
  });
});

describe("Banishing Slash", () => {
  it("destroys a tapped creature, not an untapped one, and makes a Samurai with an artifact and an enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    spawn(game, "Sol Ring");
    spawn(game, "Rhystic Study");
    const card = toHand(game, "Banishing Slash");
    expect(() => cast(game, card, { targets: [ref(untapped)] })).toThrow();
    cast(game, card, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
    expect(tokensNamed(game, "Samurai Token", A)).toBe(1);
  });

  it("with no target and only an artifact, it does nothing", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Sol Ring");
    cast(game, toHand(game, "Banishing Slash"), { targets: [null] });
    expect(tokensNamed(game, "Samurai Token", A)).toBe(0);
  });
});

describe("Boon of Boseiju", () => {
  it("+X/+X by the greatest mana value among your permanents, and untaps it", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Hill Giant", B, {}); // an opponent's doesn't count
    spawn(game, "Grizzly Bears"); // mana value 2
    spawn(game, "Sol Ring"); // mana value 1
    const target = spawn(game, "Memnite", A, { tapped: true });
    cast(game, toHand(game, "Boon of Boseiju"), { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[target].tapped).toBe(false);
  });
});

describe("Walking Skyscraper", () => {
  it("costs {1} less for each modified creature you control; hexproof only while untapped", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears"); // unmodified
    addCounter(game, one);
    addCounter(game, two);
    const card = toHand(game, "Walking Skyscraper");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("hexproof")).toBe(true);
    game.state.objects[card].tapped = true;
    expect(keywords(game, card).has("hexproof")).toBe(false);
  });
});

describe("Kaito's Pursuit", () => {
  it("target player discards two; Ninjas and Rogues you control as it resolves gain menace", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const ninja = spawn(game, "Dokuchi Shadow-Walker");
    const rogue = spawn(game, "Laurine, the Diversion");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, B).length;
    cast(game, toHand(game, "Kaito's Pursuit"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
    expect(keywords(game, ninja).has("menace")).toBe(true);
    expect(keywords(game, rogue).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
    // A Ninja arriving afterwards isn't among them (the ruling).
    const late = spawn(game, "Dokuchi Shadow-Walker");
    expect(keywords(game, late).has("menace")).toBe(false);
  });
});

describe("Upriser Renegade", () => {
  it("+2/+0 for each other modified creature you control", () => {
    const { game } = table();
    const renegade = spawn(game, "Upriser Renegade");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounter(game, renegade); // itself doesn't count
    addCounter(game, theirs);
    expect(pt(game, renegade)).toEqual({ power: 2, toughness: 4 });
    addCounter(game, one);
    addCounter(game, two);
    expect(pt(game, renegade)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Dokuchi Shadow-Walker", () => {
  it("ninjutsu {3}{B}: swaps for an unblocked attacker, tapped and attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const ninja = toHand(game, "Dokuchi Shadow-Walker");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, ninja, 0, { settle: false });
    expect(zone(game, bears)).toBe("hand");
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, ninja)).toBe("battlefield");
    expect(game.state.objects[ninja].tapped).toBe(true);
    expect(life(game, B)).toBe(15);
  });
});

describe("Skyswimmer Koi", () => {
  it("an artifact you control entering lets you draw, then discard", () => {
    const { game, a } = table();
    spawn(game, "Skyswimmer Koi");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    enter(game, "Sol Ring");
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(graveBefore + 1);
  });

  it("an opponent's artifact doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Skyswimmer Koi");
    pickModes(a, 0);
    const handBefore = hand(game).length;
    enter(game, "Sol Ring", B);
    expect(hand(game).length).toBe(handBefore);
  });
});

describe("Gift of Wrath", () => {
  it("+2/+2 and menace on a creature, and a 2/2 menace Spirit when it leaves", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toHand(game, "Gift of Wrath");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("menace")).toBe(true);
    kill(game, bears);
    // The state-based check puts the Aura into the graveyard (704.5m).
    toStep(game, "end");
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    expect(tokensNamed(game, "2/2 Red Spirit Token", A)).toBe(1);
  });
});

describe("Seismic Wave", () => {
  it("2 to any target, 1 to each nonartifact creature the target opponent controls", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const memnite = spawn(game, "Memnite", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Seismic Wave"), { targets: [ref(giant), ref(B)] });
    // The giant took 2 + 1.
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[memnite].damageMarked).toBe(0);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Heir of the Ancient Fang", () => {
  it("enters with a +1/+1 counter only if you control a modified creature", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const first = toHand(game, "Heir of the Ancient Fang");
    cast(game, first);
    expect(counters(game, first)).toBe(0);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    const second = toHand(game, "Heir of the Ancient Fang");
    cast(game, second);
    expect(counters(game, second)).toBe(1);
  });
});

describe("Geothermal Kami", () => {
  it("returning an enchantment you control gains 3 life; declining gains none", () => {
    const { game, a } = table();
    const study = spawn(game, "Rhystic Study");
    pickPermanents(a, study);
    enter(game, "Geothermal Kami");
    expect(zone(game, study)).toBe("hand");
    expect(life(game)).toBe(23);

    spawn(game, "Rhystic Study");
    pickPermanents(a);
    enter(game, "Geothermal Kami");
    expect(life(game)).toBe(23);
  });
});

describe("Kamber, the Plunderer", () => {
  it("an opponent's creature dying gains 1 life and makes a Blood token; yours doesn't", () => {
    const { game } = table();
    spawn(game, "Kamber, the Plunderer");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    kill(game, mine);
    expect(life(game)).toBe(20);
    kill(game, theirs);
    expect(life(game)).toBe(21);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Timin, Youthful Geist", () => {
  it("at the beginning of each combat, taps up to one target creature", () => {
    const { game, a } = table();
    spawn(game, "Timin, Youthful Geist");
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Laurine, the Diversion", () => {
  it("{2}, sacrifice an artifact or creature: goad target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const laurine = spawn(game, "Laurine, the Diversion");
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Hill Giant", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: laurine,
      abilityIndex: 0,
      targets: [ref(theirs)],
      sacrifice: ring,
    });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(game.state.objects[theirs].goadedBy).toContain(A);
  });
});
