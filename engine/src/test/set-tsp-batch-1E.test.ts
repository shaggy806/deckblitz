/**
 * Time Spiral (TSP; B205) — group E.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  B,
  attack,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
} from "./harness.js";

describe("Might of Old Krosa", () => {
  it("gives +4/+4 cast in your main phase", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Might of Old Krosa"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });

  it("gives only +2/+2 cast during combat", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const might = toHand(game, "Might of Old Krosa");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, might, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Clockwork Hydra", () => {
  it("enters with four counters, and attacking removes one to deal 1 damage", () => {
    const { game, a } = table();
    const hydra = enter(game, "Clockwork Hydra");
    expect(counters(game, hydra)).toBe(4);
    pickTargets(a, B);
    attack(game, a, [hydra]);
    expect(counters(game, hydra)).toBe(3);
    // 1 from the trigger, 3 combat damage from the now-3/3 Hydra.
    expect(life(game, B)).toBe(16);
  });
});

describe("Hivestone and Fury Sliver", () => {
  it("make your creatures Slivers, and every Sliver has double strike", () => {
    const { game } = table();
    spawn(game, "Fury Sliver", B);
    spawn(game, "Hivestone");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(subtypes(game, mine)).toContain("Sliver");
    expect(keywords(game, mine).has("double-strike")).toBe(true);
    expect(keywords(game, theirs).has("double-strike")).toBe(false);
  });
});

describe("Primal Forcemage", () => {
  it("pumps another creature that enters under your control, not itself", () => {
    const { game } = table();
    const mage = enter(game, "Primal Forcemage");
    expect(pt(game, mage)).toEqual({ power: 2, toughness: 2 });
    const bears = enter(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const theirs = enter(game, "Grizzly Bears", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Strength in Numbers", () => {
  it("gives trample and +X/+X for the attacking creatures", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Strength in Numbers");
    a.declareAttackersFn = () => [
      { attacker: one, defender: B },
      { attacker: two, defender: B },
    ];
    toStep(game, "declare-blockers");
    cast(game, spell, { targets: [ref(one)] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, one).has("trample")).toBe(true);
  });
});

describe("Moonlace", () => {
  it("makes a permanent colorless for good", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Moonlace"), { targets: [ref(bears)] });
    expect(computeCharacteristics(game.state, registryOf(game), bears).colors.size).toBe(0);
    toStep(game, "precombat-main", B);
    expect(computeCharacteristics(game.state, registryOf(game), bears).colors.size).toBe(0);
  });
});
