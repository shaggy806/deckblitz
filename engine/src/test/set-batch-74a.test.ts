/**
 * Set walk batch 74, part a (2026-10-14): the rest of Marvel Super Heroes
 * Commander (MSC). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  nextTurn,
  pickModes,
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

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card);

describe("Minion Missile", () => {
  it("destroys the creature and deals 2 damage to its controller, even when it survives", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    toHand(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Minion Missile"), { targets: [ref(giant)], costOption: 1 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(graveyard(game).length).toBe(2); // the discarded card and the spell

    const tough = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" }, [
      ref(tough),
    ]);
    toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Minion Missile"), { targets: [ref(tough)], costOption: 1 });
    expect(zone(game, tough)).toBe("battlefield");
    expect(life(game, B)).toBe(16);
  });
});

describe("Flora Colossus", () => {
  it("is as big as the number of lands you control", () => {
    const { game } = table();
    const colossus = spawn(game, "Flora Colossus");
    lands(game, "Forest", 5);
    lands(game, "Forest", 2, B);
    expect(pt(game, colossus)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Pick Up the Pace", () => {
  it("exiles the top card when a creature that entered this turn attacks; it's playable while you've attacked", () => {
    const { game, a } = table();
    spawn(game, "Pick Up the Pace");
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Raging Goblin");
    const bolt = toLibrary(game, "Lightning Bolt");
    attack(game, a, [goblin]);
    expect(zone(game, bolt)).toBe("exile");
    expect(castable(game, bolt)).toBe(true);
    // Next turn nobody of hers has attacked: not castable on bob's turn.
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(castable(game, bolt)).toBe(false);
  });

  it("doesn't trigger for a creature that was already there", () => {
    const { game, a } = table();
    spawn(game, "Pick Up the Pace");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].enteredBattlefieldOnTurn = 0;
    const bolt = toLibrary(game, "Lightning Bolt");
    attack(game, a, [bears]);
    expect(zone(game, bolt)).toBe("library");
  });
});

describe("Voracious Brood", () => {
  it("enters with a counter per creature card in your graveyard, and grows by that many when several arrive at once", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    const brood = enter(game, "Voracious Brood");
    expect(counters(game, brood)).toBe(2);
    toLibrary(game, "Wastes");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Serra Angel");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 });
    settle(game);
    expect(counters(game, brood)).toBe(4);
    // An opponent's graveyard doesn't count.
    toLibrary(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(counters(game, brood)).toBe(4);
  });
});

describe("Origin of Captain America", () => {
  it("I: a counter, first strike and vigilance; II: a Sturdy Shield; III: tap and stun", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Origin of Captain America");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);

    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Sturdy Shield Token", A)).toBe(1);
    const shield = game.battlefield.find((id) => game.state.objects[id].cardName === "Sturdy Shield Token")!;
    lands(game, "Plains", 2);
    activate(game, shield, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 5 });

    pickTargets(a, theirs);
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);
  });
});

describe("Strategic Intervention", () => {
  it("pumps a lone attacker and taps a creature of the player it's attacking — only that player's", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Strategic Intervention");
    const bears = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const seen = watchTargets(a, () => [bobs]);
    attack(game, a, [bears], B);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bobs);
    expect(seen.offered[0]).not.toContain(carols);
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(17);
  });
});

describe("Iceman and Firestar", () => {
  it("taps up to one target creature whenever you cast a blue spell", () => {
    const { game, a } = table();
    spawn(game, "Iceman and Firestar");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Blur of Heroism", () => {
  it("lets you cast Hero spells, and only Hero spells, as though they had flash", () => {
    const { game } = table();
    spawn(game, "Blur of Heroism");
    lands(game, "Plains", 4);
    const hero = toHand(game, "Brave Brawler");
    const bears = toHand(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    expect(castable(game, hero)).toBe(true);
    expect(castable(game, bears)).toBe(false);
  });
});

describe("Jack of Hearts, Volatile Hero", () => {
  it("powers up (discard the hand, draw three, two counters), then deals his power to each creature as he dies", () => {
    const { game } = table();
    const jack = spawn(game, "Jack of Hearts, Volatile Hero");
    game.state.objects[jack].enteredBattlefieldOnTurn = 0;
    lands(game, "Mountain", 6);
    const kept = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    activate(game, jack, 0);
    for (const card of kept) expect(zone(game, card)).toBe("graveyard");
    expect(hand(game)).toHaveLength(3);
    expect(pt(game, jack)).toEqual({ power: 4, toughness: 4 });

    const angel = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel");
    destroy(game, jack);
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Darwin, Adaptive Mutant", () => {
  it("removes two +1/+1 counters to gain indestructible", () => {
    const { game } = table();
    const darwin = spawn(game, "Darwin, Adaptive Mutant");
    expect(() => activate(game, darwin, 0)).toThrow();
    enter(game, "Hill Giant");
    enter(game, "Serra Angel");
    expect(counters(game, darwin)).toBe(2);
    activate(game, darwin, 0);
    expect(counters(game, darwin)).toBe(0);
    expect(keywords(game, darwin).has("indestructible")).toBe(true);
  });
});

describe("Fixer, Techno Terror", () => {
  it("draws for 2 life only once an artifact entered under your control this turn", () => {
    const { game } = table();
    const fixer = spawn(game, "Fixer, Techno Terror");
    enter(game, "Sol Ring", B);
    expect(() => activate(game, fixer, 0)).toThrow();
    enter(game, "Sol Ring");
    const before = hand(game).length;
    activate(game, fixer, 0);
    expect(hand(game)).toHaveLength(before + 1);
    expect(life(game)).toBe(18);
  });
});

describe("Timeline Inquiry", () => {
  it("draws three and discards one, but keeps all three when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Timeline Inquiry"));
    expect(hand(game)).toHaveLength(before + 2);
    const mid = hand(game).length;
    cast(game, toHand(game, "Timeline Inquiry"), { kicked: true, tap: [bears] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(hand(game)).toHaveLength(mid + 3);
  });
});

describe("MACH-1, Swooping Scoundrel", () => {
  it("surveils as it enters and on gaining life, but only once each turn across both", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    enter(game, "MACH-1, Swooping Scoundrel");
    expect(asked).toBe(1);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(asked).toBe(1);
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(asked).toBe(2);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(asked).toBe(2);
  });
});

describe("Doctor Spectrum", () => {
  it("can put a +1/+1 counter on each other Hero you control", () => {
    const { game, a } = table();
    const hero = spawn(game, "Brave Brawler");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Brave Brawler", B);
    pickModes(a, 1);
    const spectrum = enter(game, "Doctor Spectrum");
    expect(counters(game, hero)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, spectrum)).toBe(0);
  });
});

describe("Doctor Jane Foster", () => {
  it("returns the card to your hand, or to the battlefield if you gained life this turn", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Doctor Jane Foster");
    expect(zone(game, bears)).toBe("hand");

    const { game: g2, a: a2 } = table();
    const bears2 = toGraveyard(g2, "Grizzly Bears");
    g2.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(g2);
    pickTargets(a2, bears2);
    enter(g2, "Doctor Jane Foster");
    expect(zone(g2, bears2)).toBe("battlefield");
  });
});

describe("Ant-Man, Reformed Rogue", () => {
  it("a blue spell makes him -1/-0 and unblockable this turn", () => {
    const { game } = table();
    const ant = spawn(game, "Ant-Man, Reformed Rogue");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, ant)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, ant).has("unblockable")).toBe(true);
    expect(keywords(game, ant).has("trample")).toBe(false);
  });
});

describe("Collector's Case", () => {
  it("taps up to one target creature and puts two stun counters on it", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, theirs);
    enter(game, "Collector's Case");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(2);
  });
});

describe("Stunning Shot", () => {
  it("each optional slot does its own part", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Stunning Shot"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(2);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);

    const other = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Stunning Shot"), { targets: [null, ref(other)] });
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, other, "stun")).toBe(1);
  });
});

describe("Wakandan Tusker", () => {
  it("gains 1 life and scries 1 when it becomes tapped", () => {
    const { game, a } = table();
    const tusker = spawn(game, "Wakandan Tusker");
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    attack(game, a, [tusker]);
    expect(life(game)).toBe(21);
    expect(scried).toBe(1);
  });
});
