/**
 * Shards of Alara and Magic 2011 (B174), group B. One test per card whose
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
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Fire Servant", () => {
  it("doubles a red instant's damage", () => {
    const { game } = table();
    spawn(game, "Fire Servant");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Ooze Garden", () => {
  it("makes an Ooze as big as the sacrificed creature's power", () => {
    const { game } = table();
    const garden = spawn(game, "Ooze Garden");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 2);
    game.dispatch({ type: "activate-ability", player: A, source: garden, abilityIndex: 0, targets: [], sacrifice: giant });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    const [ooze] = named(game, "Ooze Token (Convert to Slime)", A);
    expect(ooze).toBeDefined();
    expect(pt(game, ooze)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Mighty Emergence", () => {
  it("puts two counters on an entering creature with power 5 or greater, not on a smaller one", () => {
    const { game, a } = table();
    spawn(game, "Mighty Emergence");
    pickModes(a, 0);
    const wurm = enter(game, "Craw Wurm");
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, wurm)).toBe(2);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Archdemon of Unx", () => {
  it("sacrifices itself when it's the only non-Zombie, and still makes a Zombie", () => {
    const { game } = table();
    const demon = spawn(game, "Archdemon of Unx");
    const zombies = spawn(game, "Scathe Zombies");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("graveyard");
    expect(zone(game, zombies)).toBe("battlefield");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Cyclops Gladiator", () => {
  it("deals its power to the defender's creature and takes that creature's power back", () => {
    const { game, a } = table();
    const cyclops = spawn(game, "Cyclops Gladiator");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a, 0);
    attack(game, a, [cyclops]);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, cyclops)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Resounding Thunder", () => {
  it("cycled, deals 6 damage to any target and draws", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 5);
    const thunder = toHand(game, "Resounding Thunder");
    const before = hand(game).length;
    pickTargets(a, B);
    game.dispatch({ type: "cycle", player: A, card: thunder });
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(zone(game, thunder)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Sphinx's Herald", () => {
  it("sacrifices a white, a blue (itself) and a black creature to search", () => {
    const { game } = table();
    const herald = spawn(game, "Sphinx's Herald");
    const lions = spawn(game, "Savannah Lions");
    const corpse = spawn(game, "Walking Corpse");
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    activate(game, herald);
    expect(zone(game, herald)).toBe("graveyard");
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, corpse)).toBe("graveyard");
  });
});
