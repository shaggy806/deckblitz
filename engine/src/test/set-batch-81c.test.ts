/**
 * Set walk batch 81, part c (2026-10-15): Edge of Eternities (EOE), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
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
  types,
  zone,
} from "./harness.js";

/** Alice holds priority in bob's precombat main phase (his turn 2). */
function toBobsMain(game: Game): void {
  nextTurn(game);
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
}

describe("Possibility Technician", () => {
  it("exiles your top card as it enters, and you may play it", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    enter(game, "Possibility Technician");
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("keeps the permission once it has left, usable only while you control a Kavu", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const technician = enter(game, "Possibility Technician");
    destroy(game, technician);
    lands(game, "Mountain", 1);
    expect(() => cast(game, bolt, { targets: [ref(B)], via: "impulse" })).toThrow();
    spawn(game, "Hooded Kavu");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("triggers for another Kavu you control entering, not for a non-Kavu or an opponent's Kavu", () => {
    const { game } = table();
    spawn(game, "Possibility Technician");
    const top = toLibrary(game, "Grizzly Bears");
    enter(game, "Hill Giant");
    enter(game, "Hooded Kavu", B);
    expect(zone(game, top)).toBe("library");
    enter(game, "Hooded Kavu");
    expect(zone(game, top)).toBe("exile");
  });

  it("can be cast for warp", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const technician = toHand(game, "Possibility Technician");
    cast(game, technician, { via: "warp" });
    expect(zone(game, technician)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, technician)).toBe("exile");
  });
});

describe("Radiant Strike", () => {
  it("destroys a tapped creature and gains 3 life, but can't target an untapped one", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const strike = toHand(game, "Radiant Strike");
    expect(() => cast(game, strike, { targets: [ref(untapped)] })).toThrow();
    cast(game, strike, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(life(game)).toBe(23);
  });

  it("destroys an artifact, tapped or not", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Radiant Strike"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Sunstar Expansionist", () => {
  it("makes a Lander only if an opponent controls more lands than you", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1, B);
    enter(game, "Sunstar Expansionist");
    expect(tokensNamed(game, "Lander Token", A)).toBe(0);
    lands(game, "Wastes", 1, B);
    enter(game, "Sunstar Expansionist");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
  });

  it("gets +1/+0 until end of turn for each land you control entering", () => {
    const { game } = table();
    const knight = spawn(game, "Sunstar Expansionist");
    enter(game, "Plains");
    enter(game, "Plains");
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 3 });
    enter(game, "Plains", B);
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 3 });
    nextTurn(game);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Zealous Display", () => {
  it("on your turn, pumps your creatures and leaves them tapped", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Zealous Display"));
    expect(pt(game, tapped)).toEqual({ power: 4, toughness: 2 });
    expect(game.state.objects[tapped].tapped).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("on an opponent's turn, untaps them too", () => {
    const { game } = table();
    toBobsMain(game);
    lands(game, "Plains", 3);
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Zealous Display"));
    expect(pt(game, tapped)).toEqual({ power: 4, toughness: 2 });
    expect(game.state.objects[tapped].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Territorial Bruntar", () => {
  it("exiles down to a nonland card on landfall, castable this turn only", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest");
    const keep = toLibrary(game, "Grizzly Bears");
    spawn(game, "Territorial Bruntar");
    // The first landfall finds the Bears on top.
    enter(game, "Mountain");
    expect(zone(game, keep)).toBe("exile");
    expect(zone(game, forest)).toBe("library");
    // The second exiles the Forest on its way to the Bolt; both stay exiled.
    enter(game, "Mountain");
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bolt)).toBe("exile");
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("doesn't let you cast the card on a later turn", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    spawn(game, "Territorial Bruntar");
    enter(game, "Mountain");
    expect(zone(game, bolt)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 1);
    expect(() => cast(game, bolt, { targets: [ref(B)], via: "impulse" })).toThrow();
  });
});

describe("Debris Field Crusher", () => {
  it("deals 3 damage to any target as it enters, and is a creature only at 8+", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const crusher = enter(game, "Debris Field Crusher");
    expect(life(game, B)).toBe(17);
    expect(types(game, crusher)).not.toContain("creature");
    game.state.objects[crusher].counters.charge = 8;
    expect(types(game, crusher)).toContain("creature");
    expect(keywords(game, crusher).has("flying")).toBe(true);
    expect(pt(game, crusher)).toEqual({ power: 1, toughness: 5 });
  });

  it("pumps itself +2/+0 until end of turn", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const crusher = enter(game, "Debris Field Crusher");
    game.state.objects[crusher].counters.charge = 8;
    lands(game, "Mountain", 4);
    activate(game, crusher, 1);
    activate(game, crusher, 1);
    expect(pt(game, crusher)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    expect(pt(game, crusher)).toEqual({ power: 1, toughness: 5 });
  });
});

describe("Starfighter Pilot", () => {
  it("surveils 1 whenever it becomes tapped", () => {
    const { game, a } = table();
    const pilot = spawn(game, "Starfighter Pilot");
    const top = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => cards;
    attack(game, a, [pilot]);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Red Tiger Mechan", () => {
  it("has haste, and cast for warp is exiled at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mechan = toHand(game, "Red Tiger Mechan");
    cast(game, mechan, { via: "warp" });
    expect(zone(game, mechan)).toBe("battlefield");
    expect(keywords(game, mechan).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, mechan)).toBe("exile");
  });
});

describe("Codecracker Hound", () => {
  it("puts one of the top two cards into your hand and the other into your graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, bears);
    enter(game, "Codecracker Hound");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can be cast for warp", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const hound = toHand(game, "Codecracker Hound");
    cast(game, hound, { via: "warp" });
    expect(zone(game, hound)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, hound)).toBe("exile");
  });
});

describe("Depressurize", () => {
  it("destroys a creature whose power it takes to 0 or less", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Depressurize"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    cast(game, toHand(game, "Depressurize"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Squire's Lightblade", () => {
  it("attaches to a creature you control as it enters, giving first strike this turn and +1/+0", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    toBobsMain(game);
    lands(game, "Plains", 1);
    const blade = toHand(game, "Squire's Lightblade");
    cast(game, blade);
    expect(game.state.objects[blade].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Comet Crawler", () => {
  it("may sacrifice another creature or artifact as it attacks for +2/+0", () => {
    const { game, a } = table();
    const crawler = spawn(game, "Comet Crawler");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).not.toContain(crawler);
      return [bears];
    };
    attack(game, a, [crawler]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, crawler)).toEqual({ power: 4, toughness: 3 });
    expect(life(game, B)).toBe(16);
    expect(life(game)).toBe(24);
  });
});

describe("Auxiliary Boosters", () => {
  it("makes a 2/2 Robot and attaches itself to it", () => {
    const { game } = table();
    const boosters = enter(game, "Auxiliary Boosters");
    expect(tokensNamed(game, "Robot Token", A)).toBe(1);
    const robot = game.state.objects[boosters].attachedTo!;
    expect(game.state.objects[robot].cardName).toBe("Robot Token");
    expect(pt(game, robot)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, robot).has("flying")).toBe(true);
  });
});

describe("Diplomatic Relations", () => {
  it("pumps your creature, gives it vigilance, and has it deal its power to an opponent's creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Diplomatic Relations"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Meltstrider's Gear", () => {
  it("attaches to a creature you control as it enters: +2/+1 and reach", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const gear = toHand(game, "Meltstrider's Gear");
    cast(game, gear);
    expect(game.state.objects[gear].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("reach")).toBe(true);
  });
});

describe("Starbreach Whale", () => {
  it("surveils 2 as it enters, warped for {1}{U}", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const binned = toLibrary(game, "Grizzly Bears");
    const kept = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === binned);
    const whale = toHand(game, "Starbreach Whale");
    cast(game, whale, { via: "warp" });
    expect(zone(game, whale)).toBe("battlefield");
    expect(keywords(game, whale).has("flying")).toBe(true);
    expect(zone(game, binned)).toBe("graveyard");
    expect(zone(game, kept)).toBe("library");
    nextTurn(game);
    expect(zone(game, whale)).toBe("exile");
  });
});

describe("Flight-Deck Coordinator", () => {
  it("gains 2 life at your end step with two or more tapped creatures", () => {
    const { game } = table();
    spawn(game, "Flight-Deck Coordinator");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(22);
  });

  it("does nothing with only one", () => {
    const { game } = table();
    spawn(game, "Flight-Deck Coordinator");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(20);
  });
});

describe("Weftblade Enhancer", () => {
  it("puts a +1/+1 counter on each of up to two target creatures", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    enter(game, "Weftblade Enhancer");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });

  it("can target just one, or none", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears, null);
    const enhancer = enter(game, "Weftblade Enhancer");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, enhancer)).toBe(0);
  });
});

describe("Lashwhip Predator", () => {
  it("costs {2} less while your opponents control three or more creatures between them", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 4);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const predator = toHand(game, "Lashwhip Predator");
    expect(() => cast(game, predator)).toThrow();
    spawn(game, "Grizzly Bears", C);
    cast(game, predator);
    expect(zone(game, predator)).toBe("battlefield");
    expect(keywords(game, predator).has("reach")).toBe(true);
  });

  it("doesn't count your own creatures", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Lashwhip Predator"))).toThrow();
  });
});

describe("Illvoi Infiltrator", () => {
  it("can be blocked after only one spell", () => {
    const { game, a } = table();
    const infiltrator = spawn(game, "Illvoi Infiltrator");
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    settle(game);
    const offer = blockOffer(game, a, [infiltrator]);
    expect(game.state.turn.number).toBe(1);
    expect(offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? []).toContain(infiltrator);
  });

  it("can't be blocked after the second spell, and draws a card on combat damage", () => {
    const { game, a, b } = table();
    const infiltrator = spawn(game, "Illvoi Infiltrator");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    // Both held on the stack, so the turn is still before combat.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    settle(game);
    expect(game.state.turn.number).toBe(1);
    let asked = false;
    b.declareBlockersFn = () => {
      asked = true;
      return [];
    };
    const before = hand(game).length;
    attack(game, a, [infiltrator]);
    // Bob's only creature can't block it, so he isn't even asked.
    expect(asked).toBe(false);
    expect(game.state.turn.number).toBe(1);
    expect(life(game, B)).toBe(13);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Sunset Saboteur", () => {
  it("puts a +1/+1 counter on an opponent's creature as it attacks", () => {
    const { game, a } = table();
    const saboteur = spawn(game, "Sunset Saboteur");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [saboteur]);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, saboteur).has("menace")).toBe(true);
  });
});

describe("Illvoi Operative", () => {
  it("gets a counter on your second spell each turn only, itself counted as the first", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 3);
    const operative = toHand(game, "Illvoi Operative");
    cast(game, operative);
    expect(counters(game, operative)).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, operative)).toBe(1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, operative)).toBe(1);
  });
});
