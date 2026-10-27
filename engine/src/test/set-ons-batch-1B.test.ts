/**
 * Onslaught, batch B224 group B: the cycling payoffs (Astral Slide, Lightning
 * Rift), Custody Battle's granted control-change upkeep trigger, Gustcloak
 * Savior, the tribal counts and the two Charms.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
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
  keywords,
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
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const cycle = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
};

describe("Astral Slide", () => {
  it("exiles target creature when a card is cycled and returns it at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Astral Slide");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    pickTargets(a, bears);
    cycle(game, toHand(game, "Startling Development"));
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    toStep(game, "cleanup");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Lightning Rift", () => {
  it("deals 2 damage when {1} is paid as a card is cycled", () => {
    const { game, a } = table();
    spawn(game, "Lightning Rift");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    pickTargets(a, B);
    cycle(game, toHand(game, "Startling Development"));
    expect(life(game, B)).toBe(18);
  });

  it("deals nothing when the {1} isn't paid", () => {
    const { game, a } = table();
    spawn(game, "Lightning Rift");
    lands(game, "Wastes", 2);
    pickModes(a);
    pickTargets(a, B);
    cycle(game, toHand(game, "Startling Development"));
    expect(life(game, B)).toBe(20);
  });
});

describe("Custody Battle", () => {
  it("at its controller's upkeep, the opponent gains control unless a land is sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Custody Battle"), { targets: [ref(bears)] });
    pickModes(a);
    toStep(game, "precombat-main");
    expect(controller(game, bears)).toBe(B);
  });

  it("stays put when a land is sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Custody Battle"), { targets: [ref(bears)] });
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(controller(game, bears)).toBe(A);
    expect(named(game, "Mountain", A)).toHaveLength(1);
  });
});

describe("Gustcloak Savior", () => {
  it("untaps a blocked creature you control and removes it from combat", () => {
    const { game, a, b } = table();
    spawn(game, "Gustcloak Savior");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("Heedless One and Stag Beetle", () => {
  it("Heedless One counts every Elf on the battlefield, itself included", () => {
    const { game } = table();
    const one = spawn(game, "Heedless One");
    spawn(game, "Llanowar Elves", B);
    expect(pt(game, one)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, one).has("trample")).toBe(true);
  });

  it("Stag Beetle enters with a counter for each other creature", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const beetle = enter(game, "Stag Beetle");
    expect(counters(game, beetle)).toBe(2);
  });
});

describe("Mobilization", () => {
  it("gives every Soldier vigilance and makes Soldiers", () => {
    const { game } = table();
    const mob = spawn(game, "Mobilization");
    const savior = spawn(game, "Gustcloak Savior", B);
    expect(keywords(game, savior).has("vigilance")).toBe(true);
    lands(game, "Plains", 3);
    activate(game, mob);
    const token = named(game, "Soldier Token", A)[0];
    expect(keywords(game, token).has("vigilance")).toBe(true);
  });
});

describe("Contested Cliffs", () => {
  it("your Beast fights the opponent's creature", () => {
    const { game } = table();
    const cliffs = spawn(game, "Contested Cliffs");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const beast = spawn(game, "Axebane Beast");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, cliffs, 1, { targets: [ref(bears), ref(beast)] })).toThrow();
    const giant = spawn(game, "Hill Giant");
    expect(() => activate(game, cliffs, 1, { targets: [ref(giant), ref(bears)] })).toThrow();
    activate(game, cliffs, 1, { targets: [ref(beast), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Misery Charm", () => {
  it("returns a Cleric card from your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const cleric = toGraveyard(game, "Custodi Soulbinders");
    const before = hand(game).length;
    cast(game, toHand(game, "Misery Charm"), { modes: [1], targets: [ref(cleric)] });
    expect(zone(game, cleric)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("can't destroy a non-Cleric", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Misery Charm"), { modes: [0], targets: [ref(bears)] })).toThrow();
  });
});

describe("Vitality Charm", () => {
  it("makes an Insect", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Vitality Charm"), { modes: [0] });
    expect(named(game, "Insect Token", A)).toHaveLength(1);
  });
});
