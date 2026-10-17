/**
 * Doctor Who (WHO), batch 1, group d (2026-10-17): the companions and their
 * friends. Written on the shared table in `harness.ts`, from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Sarah Jane Smith", () => {
  it("investigates on a historic spell, only once each turn, and not on a nonhistoric one", () => {
    const { game } = table();
    spawn(game, "Sarah Jane Smith");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Clue Token")).toBe(0);
    cast(game, toHand(game, "Sol Ring"));
    expect(tokensNamed(game, "Clue Token")).toBe(1);
    cast(game, toHand(game, "Sol Ring"));
    expect(tokensNamed(game, "Clue Token")).toBe(1);
  });
});

describe("Martha Jones", () => {
  it("investigates as she enters; sacrificing a Clue makes her and up to one other target creature unblockable", () => {
    const { game, a } = table();
    const martha = enter(game, "Martha Jones");
    expect(tokensNamed(game, "Clue Token")).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    pickTargets(a, bears);
    activate(game, named(game, "Clue Token")[0], 0);
    expect(keywords(game, martha).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("still makes her unblockable with no other target, and can't target herself", () => {
    const { game, a } = table();
    const martha = enter(game, "Martha Jones");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const seen = watchTargets(a);
    activate(game, named(game, "Clue Token")[0], 0);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(martha);
    expect(keywords(game, martha).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(false);
  });
});

describe("Tegan Jovanka", () => {
  it("whenever you attack, an attacking historic creature gets +1/+1 and indestructible", () => {
    const { game, a } = table();
    const tegan = spawn(game, "Tegan Jovanka");
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter");
    const martha = spawn(game, "Martha Jones");
    const seen = watchTargets(a, () => [thopter]);
    a.declareAttackersFn = () => [bears, thopter, martha].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(seen.offered[0]).toContain(thopter);
    expect(seen.offered[0]).toContain(martha);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(tegan); // legendary, but not attacking
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, thopter).has("indestructible")).toBe(true);
  });
});

describe("Jamie McCrimmon", () => {
  it("gets +X/+X where X is the historic spell's mana value", () => {
    const { game } = table();
    const jamie = spawn(game, "Jamie McCrimmon");
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Mind Stone"));
    expect(pt(game, jamie)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Alistair, the Brigadier", () => {
  it("makes a Soldier for each historic spell; paying {8} as it attacks pumps by the historic permanents", () => {
    const { game, a } = table();
    const alistair = spawn(game, "Alistair, the Brigadier");
    lands(game, "Wastes", 9);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
    // Historic permanents: Alistair (legendary) and the Ornithopter — 2.
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: alistair, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(pt(game, alistair)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, named(game, "Soldier Token")[0])).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, named(game, "Ornithopter")[0])).toEqual({ power: 2, toughness: 4 });
    const untapped = game.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Wastes" && !game.state.objects[id].tapped,
    );
    expect(untapped).toHaveLength(1);
  });

  it("does nothing on the attack when you don't pay", () => {
    const { game, a } = table();
    const alistair = spawn(game, "Alistair, the Brigadier");
    lands(game, "Wastes", 8);
    pickModes(a);
    attack(game, a, [alistair]);
    expect(pt(game, alistair)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Susan Foreman", () => {
  it("is a Time Lord — one creature type — and taps for {G}", () => {
    const { game } = table();
    const susan = spawn(game, "Susan Foreman");
    expect(subtypes(game, susan)).toEqual(["Time Lord"]);
    activate(game, susan, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G"]);
  });
});

describe("Leela, Sevateem Warrior", () => {
  it("gets a counter when an opponent draws outside their first draw-step draw", () => {
    const { game } = table();
    const leela = spawn(game, "Leela, Sevateem Warrior");
    game.debugApplyEffect(B, { kind: "draw", amount: 2 });
    settle(game);
    expect(counters(game, leela)).toBe(2);
  });
});

describe("Ace, Fearless Rebel", () => {
  it("sacrificing an artifact puts a counter on her, then she fights a creature defending player controls", () => {
    const { game, a } = table();
    const ace = spawn(game, "Ace, Fearless Rebel");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseSacrificesFn = () => [thopter];
    pickModes(a, 0);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: ace, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, ace)).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[ace].damageMarked).toBe(2);
  });

  it("with no target chosen, still gets the counter (the ruling)", () => {
    const { game, a } = table();
    const ace = spawn(game, "Ace, Fearless Rebel");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseSacrificesFn = () => [thopter];
    pickModes(a, 0);
    pickTargets(a, null);
    a.declareAttackersFn = () => [{ attacker: ace, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(counters(game, ace)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with its target gone as it resolves, does nothing at all (the ruling)", () => {
    const { game, a } = table();
    const ace = spawn(game, "Ace, Fearless Rebel");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseSacrificesFn = () => [thopter];
    pickModes(a, 0);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: ace, defender: B }];
    // Run until the reflexive ability (with its target) is on the stack.
    game.advanceUntil(
      (s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined) && s.priority.holder === A,
    );
    destroy(game, bears);
    expect(counters(game, ace)).toBe(0);
  });
});

describe("Romana II", () => {
  it("copies, tapped, any token that entered this turn — not one from an earlier turn", () => {
    const { game } = table();
    const romana = spawn(game, "Romana II");
    lands(game, "Wastes", 1);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    const [old] = named(game, "Soldier Token", B);
    game.state.objects[old].enteredBattlefieldOnTurn = 0;
    game.debugApplyEffect(B, { kind: "create-token", token: "Clue Token", count: 1 });
    settle(game);
    const [fresh] = named(game, "Clue Token", B);
    expect(() => activate(game, romana, 0, { targets: [ref(old)] })).toThrow(/target/);
    activate(game, romana, 0, { targets: [ref(fresh)] });
    const mine = named(game, "Clue Token", A);
    expect(mine).toHaveLength(1);
    expect(game.state.objects[mine[0]].tapped).toBe(true);
  });
});

describe("Nardole, Resourceful Cyborg", () => {
  it("adds {U} for each counter of any kind on him", () => {
    const { game } = table();
    const nardole = spawn(game, "Nardole, Resourceful Cyborg");
    game.state.objects[nardole].counters = { "+1/+1": 1, charge: 2 };
    activate(game, nardole, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["U", "U", "U"]);
  });

  it("has undying", () => {
    const { game } = table();
    const nardole = spawn(game, "Nardole, Resourceful Cyborg");
    destroy(game, nardole);
    const back = named(game, "Nardole, Resourceful Cyborg");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0])).toBe(1);
  });
});

describe("Karvanista, Loyal Lupari // Lupari Shield", () => {
  it("puts a +1/+1 counter on each Human you control as he attacks", () => {
    const { game, a } = table();
    const karvanista = spawn(game, "Karvanista, Loyal Lupari");
    const human = spawn(game, "Martha Jones");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Tegan Jovanka", B);
    attack(game, a, [karvanista]);
    expect(counters(game, human)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, karvanista)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });

  it("Lupari Shield: Humans you control are indestructible until your next turn", () => {
    const { game } = table();
    const human = spawn(game, "Martha Jones");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const card = toHand(game, "Karvanista, Loyal Lupari");
    cast(game, card, { face: 1 });
    expect(zone(game, card)).toBe("exile");
    expect(keywords(game, human).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    toStep(game, "precombat-main", B);
    expect(keywords(game, human).has("indestructible")).toBe(true);
    toStep(game, "precombat-main", A);
    expect(keywords(game, human).has("indestructible")).toBe(false);
  });
});

describe("Sally Sparrow", () => {
  it("investigates once each turn when other creatures you control leave", () => {
    const { game } = table();
    spawn(game, "Sally Sparrow");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    destroy(game, one);
    expect(tokensNamed(game, "Clue Token")).toBe(1);
    destroy(game, two);
    expect(tokensNamed(game, "Clue Token")).toBe(1);
  });

  it("triggers when she leaves together with another creature (the ruling)", () => {
    const { game } = table();
    spawn(game, "Sally Sparrow");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(tokensNamed(game, "Clue Token")).toBe(1);
  });

  it("doesn't trigger on herself alone", () => {
    const { game } = table();
    const sally = spawn(game, "Sally Sparrow");
    destroy(game, sally);
    expect(tokensNamed(game, "Clue Token")).toBe(0);
  });
});

describe("Duggan, Private Detective", () => {
  it("is as big as your hand, and punches another creature for twice his power — only once", () => {
    const { game } = table();
    const duggan = spawn(game, "Duggan, Private Detective");
    toHand(game, "Wastes");
    const size = hand(game).length;
    expect(size).toBeGreaterThan(0);
    expect(pt(game, duggan)).toEqual({ power: size, toughness: size });
    const myr = spawn(game, "Darksteel Myr", B);
    lands(game, "Forest", 4);
    activate(game, duggan, 0, { targets: [ref(myr)] });
    expect(game.state.objects[myr].damageMarked).toBe(2 * size);
    game.state.objects[duggan].tapped = false;
    expect(() => activate(game, duggan, 0, { targets: [ref(myr)] })).toThrow();
  });

  it("investigates as he enters", () => {
    const { game } = table();
    enter(game, "Duggan, Private Detective");
    expect(tokensNamed(game, "Clue Token")).toBe(1);
  });
});

describe("Wilfred Mott", () => {
  it("adds a time counter each upkeep and looks at that many cards", () => {
    const { game, a } = table();
    const wilfred = spawn(game, "Wilfred Mott");
    const stone = toLibrary(game, "Mind Stone");
    const ring = toLibrary(game, "Sol Ring");
    const seen = pickFromZone(a, ring);
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    // One counter: only the top card was looked at, not the Mind Stone below.
    expect(counters(game, wilfred, "time")).toBe(1);
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, stone)).not.toBe("battlefield");
  });

  it("uses the time counters he last had if he's gone before it resolves (the ruling)", () => {
    const { game, a } = table();
    const wilfred = spawn(game, "Wilfred Mott");
    game.state.objects[wilfred].counters = { time: 2 };
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Wastes");
    pickFromZone(a, ring);
    toStep(game, "end", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.zones.shared.stack.length > 0 && s.priority.holder === A);
    destroy(game, wilfred);
    // X = 2, what he last had: the Sol Ring, second from the top, was looked at.
    expect(zone(game, ring)).toBe("battlefield");
  });
});
