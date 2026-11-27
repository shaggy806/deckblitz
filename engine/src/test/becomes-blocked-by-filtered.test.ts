/**
 * "Whenever [it] becomes blocked by one or more [kind of] creatures"
 * (rule 509.3c): `becomes-blocked`'s `blockers.filter`, read as the
 * declaration completes, once however many block — on an Equipment's
 * equipped creature (Hedron Blade's "colorless") and on the creature itself
 * beside its "blocks one or more" half (Dwarven Soldier's Orcs, Amphibious
 * Kavu's "blue and/or black").
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, attack, keywords, lands, pt, ref, spawn, table, toStep } from "./harness.js";

describe("Hedron Blade", () => {
  function equipped() {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears");
    const blade = spawn(t.game, "Hedron Blade");
    lands(t.game, "Island", 2);
    activate(t.game, blade, 0, { targets: [ref(bears)] });
    return { ...t, bears };
  }

  it("gives +1/+1", () => {
    const { game, bears } = equipped();
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("blocked by a colorless creature, the equipped creature gains deathtouch", () => {
    const { game, a, b, bears } = equipped();
    const thopter = spawn(game, "Ornithopter", B);
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [
      { blocker: thopter, attacker: bears },
      { blocker: wall, attacker: bears },
    ];
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });

  it("blocked only by colored creatures, nothing", () => {
    const { game, a, b, bears } = equipped();
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
    expect(game.state.objects[wall].zone).toBe("battlefield");
  });
});

describe("Amphibious Kavu", () => {
  it("becomes blocked by a blue creature: +3/+3", () => {
    const { game, a, b } = table();
    const kavu = spawn(game, "Amphibious Kavu");
    const merfolk = spawn(game, "Coral Merfolk", B);
    b.declareBlockersFn = () => [{ blocker: merfolk, attacker: kavu }];
    attack(game, a, [kavu]);
    expect(pt(game, kavu)).toEqual({ power: 5, toughness: 5 });
  });

  it("blocks a black creature: +3/+3", () => {
    const { game, a, b } = table();
    const kavu = spawn(game, "Amphibious Kavu");
    const bats = spawn(game, "Gravedigger", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareBlockersFn = () => [{ blocker: kavu, attacker: bats }];
    toStep(game, "precombat-main", B);
    attack(game, b, [bats, bears], A);
    expect(pt(game, kavu)).toEqual({ power: 5, toughness: 5 });
  });

  it("blocked by a green creature: nothing", () => {
    const { game, a, b } = table();
    const kavu = spawn(game, "Amphibious Kavu");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: kavu }];
    attack(game, a, [kavu]);
    expect(pt(game, kavu)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Dwarven Soldier", () => {
  it("becomes blocked by an Orc: +0/+2", () => {
    const { game, a, b } = table();
    const soldier = spawn(game, "Dwarven Soldier");
    const orc = spawn(game, "Orcish Artillery", B);
    b.declareBlockersFn = () => [{ blocker: orc, attacker: soldier }];
    attack(game, a, [soldier]);
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 3 });
  });

  it("blocked by a non-Orc: nothing", () => {
    const { game, a, b } = table();
    const soldier = spawn(game, "Dwarven Soldier");
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: soldier }];
    attack(game, a, [soldier]);
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 1 });
  });
});
