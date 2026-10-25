/**
 * Commander 2016 (C16) and Kaladesh (KLD), group D. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Evolutionary Escalation", () => {
  it("puts three counters on your creature and three on an opponent's each upkeep", () => {
    const { game, a } = table();
    spawn(game, "Evolutionary Escalation");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    toStep(game, "precombat-main");
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, giant)).toBe(3);
  });
});

describe("Verdurous Gearhulk", () => {
  it("distributes four counters as chosen, itself included", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    const gearhulk = toHand(game, "Verdurous Gearhulk");
    cast(game, gearhulk, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(gearhulk)], division: [3, 1] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, gearhulk)).toBe(1);
  });
});

describe("Morbid Curiosity", () => {
  it("draws cards equal to the sacrificed permanent's mana value", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon");
    lands(game, "Swamp", 3);
    const card = toHand(game, "Morbid Curiosity");
    const before = hand(game).length;
    cast(game, card, { sacrifice: dragon });
    expect(zone(game, dragon)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before - 1 + 6);
  });
});

describe("Sequestered Stash", () => {
  it("mills five, then puts an artifact card from the graveyard on top of the library", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const stash = spawn(game, "Sequestered Stash");
    lands(game, "Wastes", 4);
    pickFromZone(a, ring);
    activate(game, stash, 1);
    expect(zone(game, stash)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(ring);
    // The five milled Wastes and the sacrificed land.
    expect(graveyard(game)).toHaveLength(6);
  });
});

describe("Deadlock Trap", () => {
  it("enters tapped with {E}{E}, then taps a creature and stops its activated abilities", () => {
    const { game } = table();
    const trap = enter(game, "Deadlock Trap");
    expect(game.state.objects[trap].tapped).toBe(true);
    expect(game.state.players[A].energy).toBe(2);
    toStep(game, "precombat-main");
    const dragon = spawn(game, "Shivan Dragon");
    lands(game, "Mountain", 1);
    const pump = { type: "activate-ability", player: A, source: dragon, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(pump)).toBeNull();
    activate(game, trap, 0, { targets: [ref(dragon)] });
    expect(game.state.objects[dragon].tapped).toBe(true);
    expect(game.state.players[A].energy).toBe(1);
    expect(game.canDispatch(pump)).not.toBeNull();
  });
});

describe("Janjeet Sentry", () => {
  it("pays {E}{E} to untap target creature", () => {
    const { game, a } = table();
    const sentry = enter(game, "Janjeet Sentry");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickModes(a, 1);
    activate(game, sentry, 0, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Durable Handicraft", () => {
  it("pays {1} as a creature enters to put a counter on it", () => {
    const { game, a } = table();
    spawn(game, "Durable Handicraft");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Master Trinketeer", () => {
  it("makes Servos and pumps them", () => {
    const { game } = table();
    const trinketeer = spawn(game, "Master Trinketeer");
    lands(game, "Plains", 4);
    activate(game, trinketeer, 0);
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
    const [servo] = named(game, "Servo Token", A);
    expect(pt(game, servo)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Voltaic Brawler", () => {
  it("pays {E} as it attacks for +1/+1 and trample", () => {
    const { game, a } = table();
    const brawler = enter(game, "Voltaic Brawler");
    expect(game.state.players[A].energy).toBe(2);
    pickModes(a, 0);
    attack(game, a, [brawler]);
    expect(game.state.players[A].energy).toBe(1);
    expect(life(game, B)).toBe(16);
    expect(keywords(game, brawler).has("trample")).toBe(true);
  });
});

describe("Engineered Might", () => {
  it("second mode: creatures you control get +2/+2 and vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Engineered Might"), { modes: [1] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});
