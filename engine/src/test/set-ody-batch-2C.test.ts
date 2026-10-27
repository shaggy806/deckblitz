/**
 * Odyssey (ODY; B231), group C. One test per card whose behaviour is more
 * than a stat line or an already-tested pattern, on the clause most likely
 * to be wrong.
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
  lands,
  life,
  pickModes,
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

describe("Iridescent Angel", () => {
  it("can't be the target of a red spell", () => {
    const { game } = table();
    const angel = spawn(game, "Iridescent Angel", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    expect(() => cast(game, bolt, { targets: [ref(angel)] })).toThrow();
  });
});

describe("Zombie Cannibal", () => {
  it("exiles the chosen card from the damaged player's graveyard", () => {
    const { game, a } = table();
    const zombie = spawn(game, "Zombie Cannibal");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    pickModes(a, 0);
    attack(game, a, [zombie]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Nomad Decoy", () => {
  it("taps two creatures only with threshold", () => {
    const { game } = table();
    const decoy = spawn(game, "Nomad Decoy");
    lands(game, "Plains", 2);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, decoy, 1, { targets: [ref(x), ref(y)] })).toThrow();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    activate(game, decoy, 1, { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
  });
});

describe("Bloodcurdler", () => {
  it("with threshold is 2/2 and exiles two graveyard cards at your end step", () => {
    const { game } = table();
    const horror = spawn(game, "Bloodcurdler");
    expect(pt(game, horror)).toEqual({ power: 1, toughness: 1 });
    for (let i = 0; i < 8; i++) toGraveyard(game, "Wastes");
    expect(pt(game, horror)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "end");
    settle(game);
    expect(graveyard(game)).toHaveLength(6);
  });
});

describe("Junk Golem", () => {
  it("removes a counter to stay, or is sacrificed", () => {
    const { game, a } = table();
    const golem = enter(game, "Junk Golem");
    expect(counters(game, golem)).toBe(3);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, golem)).toBe(2);
    pickModes(a); // decline the "may"
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, golem)).toBe("graveyard");
  });
});

describe("Muscle Burst", () => {
  it("gives +X/+X with X 3 plus the Muscle Bursts in graveyards", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Muscle Burst", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Muscle Burst"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Life Burst", () => {
  it("target player gains 4 plus 4 for each Life Burst in each graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Life Burst", A);
    toGraveyard(game, "Life Burst", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Life Burst"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(32);
    expect(life(game, A)).toBe(20);
  });
});

describe("Mind Burst", () => {
  it("target player discards one plus the Mind Bursts in all graveyards", () => {
    const { game } = table();
    toGraveyard(game, "Mind Burst", B);
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Mind Burst"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Phantom Whelp", () => {
  it("returns to its owner's hand at end of combat after attacking", () => {
    const { game, a } = table();
    const whelp = spawn(game, "Phantom Whelp");
    attack(game, a, [whelp]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, whelp)).toBe("hand");
  });
});

describe("Pulsating Illusion", () => {
  it("pumps +4/+4 for a discard, only once each turn", () => {
    const { game } = table();
    const illusion = spawn(game, "Pulsating Illusion");
    activate(game, illusion, 0);
    expect(pt(game, illusion)).toEqual({ power: 4, toughness: 5 });
    expect(() => activate(game, illusion, 0)).toThrow();
  });
});
