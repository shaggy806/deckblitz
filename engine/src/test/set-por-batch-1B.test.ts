/**
 * Portal (POR) and Portal Second Age (P02; B190), group B. One test per card
 * whose behaviour is more than a stat line or an already-tested shape, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Mobilize", () => {
  it("untaps your creatures, not an opponent's", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Mobilize"));
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Thing from the Deep", () => {
  it("is sacrificed when it attacks with no Island to sacrifice", () => {
    const { game, a } = table();
    const thing = spawn(game, "Thing from the Deep");
    attack(game, a, [thing]);
    expect(zone(game, thing)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("stays, and hits, when you sacrifice an Island", () => {
    const { game, a } = table();
    const thing = spawn(game, "Thing from the Deep");
    const [island] = lands(game, "Island", 1);
    pickModes(a, 0);
    attack(game, a, [thing]);
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, thing)).toBe("battlefield");
    expect(life(game, B)).toBe(11);
  });
});

describe("Renewing Dawn", () => {
  it("gains 2 life for each Mountain the target opponent controls", () => {
    const { game } = table();
    lands(game, "Mountain", 3, B);
    lands(game, "Mountain", 1, A);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Renewing Dawn"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(26);
  });
});

describe("Dakmor Sorceress", () => {
  it("has power equal to the Swamps you control, and toughness 4", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const sorceress = spawn(game, "Dakmor Sorceress");
    expect(pt(game, sorceress)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Sylvan Yeti", () => {
  it("has power equal to the cards in your hand", () => {
    const { game } = table();
    const yeti = spawn(game, "Sylvan Yeti");
    expect(pt(game, yeti)).toEqual({ power: hand(game).length, toughness: 4 });
    toHand(game, "Forest");
    expect(pt(game, yeti).power).toBe(hand(game).length);
  });
});

describe("Alaborn Veteran", () => {
  it("can be activated in your precombat main phase", () => {
    const { game } = table();
    const veteran = spawn(game, "Alaborn Veteran");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, veteran, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't be activated in your second main phase (attackers were declared)", () => {
    const { game } = table();
    const veteran = spawn(game, "Alaborn Veteran");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    expect(() => activate(game, veteran, 0, { targets: [ref(bears)] })).toThrow(/refused/);
  });

  it("can't be activated on an opponent's turn", () => {
    const { game } = table();
    const veteran = spawn(game, "Alaborn Veteran");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    expect(() => activate(game, veteran, 0, { targets: [ref(bears)] })).toThrow(/refused/);
  });
});

describe("Coastal Wizard", () => {
  it("returns itself and another target creature to their owners' hands", () => {
    const { game } = table();
    const wizard = spawn(game, "Coastal Wizard");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, wizard, 0, { targets: [ref(giant)] });
    expect(zone(game, wizard)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(hand(game, B)).toContain(giant);
  });

  it("can't be activated in your second main phase", () => {
    const { game } = table();
    const wizard = spawn(game, "Coastal Wizard");
    const giant = spawn(game, "Hill Giant", B);
    toStep(game, "postcombat-main");
    expect(() => activate(game, wizard, 0, { targets: [ref(giant)] })).toThrow(/refused/);
  });
});

describe("Brutal Nightstalker", () => {
  it("may have the target opponent discard a card", () => {
    const { game, a } = table();
    const before = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Brutal Nightstalker");
    expect(hand(game, B).length).toBe(before - 1);
  });
});
