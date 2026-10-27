import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

// Fifth Dawn (5DN), batch 213 group C.

describe("Battered Golem", () => {
  it("may untap when an artifact enters", () => {
    const { game, a } = table();
    const golem = spawn(game, "Battered Golem", A, { tapped: true });
    pickModes(a, 0);
    enter(game, "Ornithopter", B);
    expect(game.state.objects[golem].tapped).toBe(false);
  });
});

describe("Beacon of Creation", () => {
  it("makes an Insect per Forest, then shuffles itself into the library", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const beacon = toHand(game, "Beacon of Creation");
    cast(game, beacon);
    expect(tokensNamed(game, "Insect Token", A)).toBe(4);
    expect(zone(game, beacon)).toBe("library");
  });
});

describe("Artificer's Intuition", () => {
  it("discards an artifact card to find an artifact with mana value 1 or less", () => {
    const { game, a } = table();
    const intuition = spawn(game, "Artificer's Intuition");
    lands(game, "Island", 1);
    const thopter = toHand(game, "Ornithopter");
    const ring = toLibrary(game, "Sol Ring");
    a.chooseDiscardsFn = () => [thopter];
    pickFromZone(a, ring);
    activate(game, intuition, 0);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Blinkmoth Infusion", () => {
  it("costs {1} less per artifact you control and untaps every player's artifacts", () => {
    const { game } = table();
    const mine = [0, 1, 2].map(() => spawn(game, "Ornithopter", A, { tapped: true }));
    const theirs = spawn(game, "Ornithopter", B, { tapped: true });
    lands(game, "Island", 11); // {12}{U}{U} less three artifacts
    cast(game, toHand(game, "Blinkmoth Infusion"));
    for (const id of [...mine, theirs]) expect(game.state.objects[id].tapped).toBe(false);
  });
});

describe("Mephidross Vampire", () => {
  it("makes your creatures Vampires whose damage to a creature grows them", () => {
    const { game } = table();
    spawn(game, "Mephidross Vampire");
    const pyromancer = spawn(game, "Prodigal Pyromancer", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", B);
    expect(subtypes(game, pyromancer)).toContain("Vampire");
    expect(subtypes(game, bears)).not.toContain("Vampire");
    activate(game, pyromancer, 0, { targets: [ref(bears)] });
    expect(counters(game, pyromancer)).toBe(1);
  });

  it("doesn't grow on damage to a player", () => {
    const { game } = table();
    spawn(game, "Mephidross Vampire");
    const pyromancer = spawn(game, "Prodigal Pyromancer", A, { sick: false });
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(counters(game, pyromancer)).toBe(0);
  });
});

describe("Devour in Shadow", () => {
  it("destroys the creature and you lose life equal to its toughness", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Devour in Shadow"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game, A)).toBe(16);
  });
});

describe("Cosmic Larva", () => {
  it("stays if you sacrifice two lands in your upkeep", () => {
    const { game, a } = table();
    const larva = spawn(game, "Cosmic Larva");
    const mountains = lands(game, "Mountain", 3);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, larva)).toBe("battlefield");
    expect(mountains.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("is sacrificed with fewer than two lands", () => {
    const { game, a } = table();
    const larva = spawn(game, "Cosmic Larva");
    const mountain = lands(game, "Mountain", 1)[0];
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, larva)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("battlefield");
  });
});

describe("Bringer of the White Dawn", () => {
  it("can be cast for {W}{U}{B}{R}{G}", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    const bringer = toHand(game, "Bringer of the White Dawn");
    cast(game, bringer, { altCost: true });
    expect(zone(game, bringer)).toBe("battlefield");
  });
});

describe("Eyes of the Watcher", () => {
  it("pays {1} to scry 2 when you cast an instant", () => {
    const { game, a } = table();
    spawn(game, "Eyes of the Watcher");
    lands(game, "Mountain", 2);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(scried).toBe(2);
    expect(life(game, B)).toBe(17);
  });
});

describe("Hoverguard Sweepers", () => {
  it("returns up to two target creatures to their owners' hands", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, bears, wurm);
    pickModes(a, 0);
    enter(game, "Hoverguard Sweepers");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wurm)).toBe("hand");
  });
});

describe("Granulate", () => {
  it("destroys nonland artifacts with mana value 4 or less", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const wurmcoil = spawn(game, "Wurmcoil Engine", B);
    const seat = spawn(game, "Seat of the Synod", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Granulate"));
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, wurmcoil)).toBe("battlefield");
    expect(zone(game, seat)).toBe("battlefield");
  });
});

describe("Viridian Scout", () => {
  it("is sacrificed to deal 2 damage to a creature with flying, and only one", () => {
    const { game } = table();
    const scout = spawn(game, "Viridian Scout");
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    expect(() => activate(game, scout, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, scout, 0, { targets: [ref(birds)] });
    expect(zone(game, scout)).toBe("graveyard");
    expect(zone(game, birds)).toBe("graveyard");
  });
});

describe("Razormane Masticore", () => {
  it("may deal 3 damage to target creature at the beginning of your draw step", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Razormane Masticore");
    const bears: ObjectId = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickModes(a, 0); // discard for the upkeep, and yes to the damage
    pickTargets(a, bears);
    toStep(game, "precombat-main");
    expect(zone(game, masticore)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game, A).length).toBe(1);
  });
});
