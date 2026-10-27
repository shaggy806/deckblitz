/**
 * Mirrodin (MRD; B215), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
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
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Chalice of the Void", () => {
  it("enters with X charge counters and counters spells of exactly that mana value", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const chalice = toHand(game, "Chalice of the Void");
    cast(game, chalice, { x: 1 });
    expect(counters(game, chalice, "charge")).toBe(1);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Grab the Reins", () => {
  it("entwined, steals a creature and then sacrifices it to deal its power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Grab the Reins"), { kicked: true, modes: [0, 1], targets: [ref(giant), ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Farsight Mask", () => {
  it("draws when an opponent's source damages you while untapped", () => {
    const { game, a, b } = table();
    spawn(game, "Farsight Mask");
    const attacker = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const before = hand(game, A).length;
    pickModes(a, 0);
    attack(game, b, [attacker], A);
    expect(life(game, A)).toBe(18);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("does nothing while tapped", () => {
    const { game, b } = table();
    spawn(game, "Farsight Mask", A, { tapped: true });
    const attacker = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const before = hand(game, A).length;
    attack(game, b, [attacker], A);
    expect(life(game, A)).toBe(18);
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Tangleroot", () => {
  it("gives the creature spell's caster {G}", () => {
    const { game } = table();
    spawn(game, "Tangleroot");
    nextTurn(game);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(game.state.players[B].manaPool.map((u) => u.type)).toEqual(["G"]);
    expect(game.state.players[A].manaPool).toEqual([]);
  });
});

describe("Clockwork Beetle", () => {
  it("loses a +1/+1 counter at end of combat after attacking", () => {
    const { game, a } = table();
    const beetle = enter(game, "Clockwork Beetle");
    expect(counters(game, beetle)).toBe(2);
    attack(game, a, [beetle]);
    expect(life(game, B)).toBe(18);
    expect(counters(game, beetle)).toBe(1);
  });
});

describe("Altar of Shadows", () => {
  it("destroys the creature and then gets a charge counter", () => {
    const { game } = table();
    const altar = spawn(game, "Altar of Shadows");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 7);
    activate(game, altar, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, altar, "charge")).toBe(1);
  });
});

describe("Fractured Loyalty", () => {
  it("gives the enchanted creature to whoever's spell targets it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Fractured Loyalty"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Copperhoof Vorrac", () => {
  it("counts only opponents' untapped permanents", () => {
    const { game } = table();
    const vorrac = spawn(game, "Copperhoof Vorrac");
    lands(game, "Wastes", 3, B);
    spawn(game, "Wastes", B, { tapped: true });
    lands(game, "Wastes", 2, A);
    expect(pt(game, vorrac)).toEqual({ power: 5, toughness: 5 });
  });
});
