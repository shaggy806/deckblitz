/**
 * Ice Age (ICE; B136), group F. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Minion of Leshrac", () => {
  it("sacrificing another creature at upkeep spares you the damage", () => {
    const { game, a } = table();
    const minion = spawn(game, "Minion of Leshrac");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    nextTurn(game);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, minion)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[minion].tapped).toBe(false);
  });

  it("declined, it deals 5 damage to you and taps", () => {
    const { game, a } = table();
    const minion = spawn(game, "Minion of Leshrac");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    nextTurn(game);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(15);
    expect(game.state.objects[minion].tapped).toBe(true);
  });
});

describe("Veldt", () => {
  it("tapping it for mana adds a depletion counter, which keeps it tapped through one untap step", () => {
    const { game } = table();
    const veldt = spawn(game, "Veldt");
    cast(game, toHand(game, "Llanowar Elves"));
    expect(game.state.objects[veldt].tapped).toBe(true);
    expect(counters(game, veldt, "depletion")).toBe(1);
    nextTurn(game); // bob's
    nextTurn(game); // alice's: no untap, then the upkeep removes the counter
    expect(game.state.objects[veldt].tapped).toBe(true);
    expect(counters(game, veldt, "depletion")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[veldt].tapped).toBe(false);
  });
});

describe("Word of Blasting", () => {
  it("destroys the Wall and deals its mana value to the Wall's controller", () => {
    const { game } = table();
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    const wall = spawn(game, "Wall of Stone", B);
    cast(game, toHand(game, "Word of Blasting"), { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Orcish Squatters", () => {
  it("unblocked, takes a land of the defending player and deals no combat damage", () => {
    const { game, a } = table();
    const squatters = spawn(game, "Orcish Squatters");
    const forest = spawn(game, "Forest", B);
    pickTargets(a, forest);
    pickModes(a, 0);
    attack(game, a, [squatters]);
    expect(controller(game, forest)).toBe(A);
    expect(life(game, B)).toBe(20);
  });
});

describe("Green Scarab", () => {
  it("gets +2/+2 only while an opponent controls a green permanent", () => {
    const { game, a } = table();
    spawn(game, "Plains");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Green Scarab"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Llanowar Elves", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Shyft", () => {
  it("becomes the chosen colours at upkeep, and stays so", () => {
    const { game, a } = table();
    const shyft = spawn(game, "Shyft");
    // The `may`'s yes, then the modal's mode: modes run single colours
    // first (W U B R G = 0-4), then pairs — "White, Blue" is 5.
    let asked = 0;
    a.chooseModesFn = () => (asked++ === 0 ? [0] : [5]);
    nextTurn(game);
    toStep(game, "draw");
    expect([...computeCharacteristics(game.state, registryOf(game), shyft).colors].sort()).toEqual(["U", "W"]);
    a.chooseModesFn = () => [];
    nextTurn(game);
    nextTurn(game);
    expect(named(game, "Shyft")).toHaveLength(1);
    expect([...computeCharacteristics(game.state, registryOf(game), shyft).colors].sort()).toEqual(["U", "W"]);
  });
});
