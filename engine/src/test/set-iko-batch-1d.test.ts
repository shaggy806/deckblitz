/**
 * Ikoria: Lair of Behemoths (IKO) — group d, each on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
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
  toStep,
  zone,
} from "./harness.js";

describe("Chevill, Bane of Monsters", () => {
  it("puts a bounty counter at upkeep only while no opponent's permanent has one", () => {
    const { game, a } = table();
    spawn(game, "Chevill, Bane of Monsters");
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bear);
    toStep(game, "upkeep", A);
    settle(game);
    expect(counters(game, bear, "bounty")).toBe(1);
    pickTargets(a, giant);
    toStep(game, "upkeep", A);
    settle(game);
    expect(counters(game, giant, "bounty")).toBe(0);
  });

  it("gains 3 life and draws when a permanent with a bounty counter dies", () => {
    const { game } = table();
    spawn(game, "Chevill, Bane of Monsters");
    const bear = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "bounty", amount: 1 }, [ref(bear)]);
    settle(game);
    const before = hand(game, A).length;
    destroy(game, plain);
    expect(life(game, A)).toBe(20);
    destroy(game, bear);
    expect(life(game, A)).toBe(23);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Fight as One", () => {
  it("both modes: a Human and a non-Human each get +1/+1 and indestructible", () => {
    const { game } = table();
    spawn(game, "Plains");
    const human = spawn(game, "Elite Vanguard");
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Fight as One"), { modes: [0, 1], targets: [ref(human), ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("indestructible")).toBe(true);
    expect(keywords(game, human).has("indestructible")).toBe(true);
  });

  it("the Human mode can't target a non-Human", () => {
    const { game } = table();
    spawn(game, "Plains");
    const bear = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Fight as One"), { modes: [0], targets: [ref(bear)] })).toThrow();
  });
});

describe("Barrier Breach", () => {
  it("exiles up to three target enchantments", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const e1 = spawn(game, "Sanctuary Lockdown", B);
    const e2 = spawn(game, "Sanctuary Lockdown", B);
    cast(game, toHand(game, "Barrier Breach"), { targets: [ref(e1), ref(e2)] });
    expect(zone(game, e1)).toBe("exile");
    expect(zone(game, e2)).toBe("exile");
  });
});

describe("Blood Curdle", () => {
  it("destroys the target, then puts a menace counter on a chosen creature you control", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const victim = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a, giant);
    cast(game, toHand(game, "Blood Curdle"), { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(counters(game, giant, "menace")).toBe(1);
  });
});

describe("Sanctuary Lockdown", () => {
  it("pumps Humans and taps an opponent's creature by tapping two Humans", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const lockdown = spawn(game, "Sanctuary Lockdown");
    const h1 = spawn(game, "Elite Vanguard");
    const h2 = spawn(game, "Elite Vanguard");
    const bear = spawn(game, "Grizzly Bears");
    expect(pt(game, h1)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    const foe = spawn(game, "Hill Giant", B);
    activate(game, lockdown, 0, { targets: [ref(foe)] });
    expect(game.state.objects[foe].tapped).toBe(true);
    expect(game.state.objects[h1].tapped).toBe(true);
    expect(game.state.objects[h2].tapped).toBe(true);
  });
});

describe("Tentative Connection", () => {
  it("costs {R} with a menace creature and steals, untaps and hastes the target", () => {
    const { game } = table();
    spawn(game, "Mountain");
    spawn(game, "Boggart Brute"); // menace
    const foe = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Tentative Connection"), { targets: [ref(foe)] });
    expect(game.state.objects[foe].controller).toBe(A);
    expect(game.state.objects[foe].tapped).toBe(false);
    expect(keywords(game, foe).has("haste")).toBe(true);
  });

  it("costs full price without a menace creature", () => {
    const { game } = table();
    spawn(game, "Mountain");
    const foe = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Tentative Connection"), { targets: [ref(foe)] })).toThrow();
  });
});

describe("Stormwild Capridor", () => {
  it("prevents noncombat damage and gets that many +1/+1 counters", () => {
    const { game } = table();
    spawn(game, "Mountain");
    const goat = spawn(game, "Stormwild Capridor");
    cast(game, toHand(game, "Shock"), { targets: [ref(goat)] });
    expect(zone(game, goat)).toBe("battlefield");
    expect(counters(game, goat)).toBe(2);
    expect(game.state.objects[goat].damageMarked).toBe(0);
  });
});

describe("Exuberant Wolfbear", () => {
  it("may set a Human's base power and toughness to its own as it attacks", () => {
    const { game, a } = table();
    const wolfbear = spawn(game, "Exuberant Wolfbear");
    const human = spawn(game, "Elite Vanguard");
    pickTargets(a, human);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: wolfbear, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(pt(game, human)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Wingfold Pteron", () => {
  it("enters with the chosen keyword counter", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    a.chooseCreatureTypeFn = () => "hexproof";
    const pteron = toHand(game, "Wingfold Pteron");
    cast(game, pteron);
    expect(counters(game, pteron, "hexproof")).toBe(1);
    expect(counters(game, pteron, "flying")).toBe(0);
    expect(keywords(game, pteron).has("hexproof")).toBe(true);
  });
});

describe("Alert Heedbonder", () => {
  it("gains 1 life for each creature you control with vigilance at your end step", () => {
    const { game } = table();
    spawn(game, "Alert Heedbonder");
    spawn(game, "Alert Heedbonder");
    spawn(game, "Grizzly Bears");
    toStep(game, "end", A);
    settle(game);
    // Two triggers, each counting both vigilant Heedbonders.
    expect(life(game, A)).toBe(24);
  });
});

describe("Unbreakable Bond", () => {
  it("returns a creature card with a lifelink counter", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Unbreakable Bond"), { targets: [ref(giant)] });
    const back = named(game, "Hill Giant", A)[0];
    expect(back).toBeDefined();
    expect(counters(game, back, "lifelink")).toBe(1);
    expect(keywords(game, back).has("lifelink")).toBe(true);
  });
});
