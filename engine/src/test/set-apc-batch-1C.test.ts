/**
 * Set walk batch 218, group C (2026-10-27): Apocalypse (APC).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  enter,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Dragon Arch", () => {
  it("offers only multicolored creature cards from the hand", () => {
    const { game, a } = table();
    const arch = spawn(game, "Dragon Arch");
    lands(game, "Wastes", 2);
    const elf = toHand(game, "Bloodbraid Elf");
    toHand(game, "Grizzly Bears");
    toHand(game, "Suffocating Blast");
    const picked = pickFromZone(a, elf);
    activate(game, arch);
    expect(picked.offered).toEqual([elf]);
    expect(zone(game, elf)).toBe("battlefield");
  });
});

describe("Whirlpool Drake", () => {
  it("shuffles the hand away and draws as many as went", () => {
    const { game } = table();
    const before = hand(game, A).length;
    expect(before).toBeGreaterThan(0);
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    enter(game, "Whirlpool Drake");
    expect(hand(game, A).length).toBe(before);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore);
  });
});

describe("Evasive Action", () => {
  it("counters unless its controller pays {1} per basic land type among the caster's lands", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Plains");
    spawn(game, "Forest");
    // Three basic land types: Alice's own Index costs {3} more, and two lands are left.
    const index = toHand(game, "Index");
    cast(game, index, { settle: false });
    cast(game, toHand(game, "Evasive Action"), { targets: [ref(index)] });
    expect(zone(game, index)).toBe("graveyard");
  });
});

describe("Powerstone Minefield", () => {
  it("deals 2 damage to each attacker", () => {
    const { game, a } = table();
    spawn(game, "Powerstone Minefield", B);
    const kavu = spawn(game, "Kavu Howler");
    a.declareAttackersFn = () => [{ attacker: kavu, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(game.state.objects[kavu].damageMarked).toBe(2);
  });
});

describe("Gerrard's Verdict", () => {
  it("gains 3 life for each land card discarded", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    // Bob's hand is all Wastes (the table deck).
    cast(game, toHand(game, "Gerrard's Verdict"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(26);
  });
});

describe("Gaea's Balance", () => {
  it("sacrifices five lands and finds one land per basic land type, a dual filling a slot", () => {
    const { game, a } = table();
    const own = [...lands(game, "Forest", 4), ...lands(game, "Wastes", 5)];
    const tropical = toLibrary(game, "Tropical Island");
    const plains = toLibrary(game, "Plains");
    const swamp = toLibrary(game, "Swamp");
    const mountain = toLibrary(game, "Mountain");
    const island = toLibrary(game, "Island");
    const seen = pickFromZone(a, tropical, plains, swamp, mountain, island);
    cast(game, toHand(game, "Gaea's Balance"));
    expect(seen.offered.length).toBeGreaterThan(0);
    expect(own.filter((id) => zone(game, id) === "graveyard")).toHaveLength(5);
    // The Tropical Island fills the Forest slot, the Island the Island slot.
    expect([plains, swamp, mountain, tropical, island].map((id) => zone(game, id))).toEqual(Array(5).fill("battlefield"));
  });
});

describe("Bloodfire Kavu", () => {
  it("deals 2 damage to each creature when sacrificed", () => {
    const { game } = table();
    const kavu = spawn(game, "Bloodfire Kavu");
    const bear = spawn(game, "Grizzly Bears", B);
    const howler = spawn(game, "Kavu Howler", B);
    lands(game, "Mountain", 1);
    activate(game, kavu);
    expect(zone(game, kavu)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.objects[howler].damageMarked).toBe(2);
  });
});

describe("Illusion // Reality", () => {
  it("Illusion makes a permanent the chosen colour until end of turn", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 3);
    cast(game, toHand(game, "Illusion // Reality"), { face: 1, targets: [ref(bear)] });
    expect([...computeCharacteristics(game.state, registryOf(game), bear).colors]).toEqual(["R"]);
  });

  it("Reality destroys an artifact", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const arch = spawn(game, "Dragon Arch", B);
    cast(game, toHand(game, "Illusion // Reality"), { face: 2, targets: [ref(arch)] });
    expect(zone(game, arch)).toBe("graveyard");
  });
});

describe("Kavu Howler", () => {
  it("takes every Kavu among the top four", () => {
    const { game } = table();
    const kavu = toLibrary(game, "Bloodfire Kavu");
    const before = hand(game, A).length;
    enter(game, "Kavu Howler");
    expect(zone(game, kavu)).toBe("hand");
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Dwarven Patrol", () => {
  it("untaps on a nonred spell, not on a red one", () => {
    const { game } = table();
    const patrol = spawn(game, "Dwarven Patrol", A, { tapped: true });
    lands(game, "Mountain", 4);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Bloodfire Kavu"));
    expect(game.state.objects[patrol].tapped).toBe(true);
    cast(game, toHand(game, "Index"));
    expect(game.state.objects[patrol].tapped).toBe(false);
  });
});

describe("Raka Sanctuary", () => {
  it("deals 1 with a white permanent alone, 3 with white and blue", () => {
    const { game, a } = table();
    spawn(game, "Raka Sanctuary");
    spawn(game, "Plains"); // a land is colourless: not enough
    spawn(game, "Savannah Lions");
    const one = spawn(game, "Kavu Howler", B);
    pickTargets(a, one);
    toStep(game, "draw");
    expect(game.state.objects[one].damageMarked).toBe(1);

    spawn(game, "Whirlpool Drake");
    const three = spawn(game, "Kavu Howler", B);
    pickTargets(a, three);
    toStep(game, "draw");
    expect(game.state.objects[three].damageMarked).toBe(3);
  });
});

describe("Mournful Zombie", () => {
  it("gives the target player 1 life", () => {
    const { game } = table();
    const zombie = spawn(game, "Mournful Zombie");
    lands(game, "Plains", 1);
    activate(game, zombie, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(21);
    expect(controller(game, zombie)).toBe(A);
  });
});

describe("Minotaur Tactician", () => {
  it("gets +1/+1 for a white creature and +1/+1 for a blue one", () => {
    const { game } = table();
    const minotaur = spawn(game, "Minotaur Tactician");
    expect(pt(game, minotaur)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Whirlpool Drake");
    expect(pt(game, minotaur)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Savannah Lions");
    expect(pt(game, minotaur)).toEqual({ power: 3, toughness: 3 });
  });
});
