/**
 * Alliances, group D: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Phantasmal Sphere", () => {
  it("is sacrificed unpaid at upkeep and the opponent gets an Orb as big as its counters", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Phantasmal Sphere");
    pickModes(a);
    pickTargets(a, B);
    toStep(game, "draw");
    expect(zone(game, sphere)).toBe("graveyard");
    const orbs = named(game, "Orb Token", B);
    expect(orbs).toHaveLength(1);
    expect(pt(game, orbs[0])).toEqual({ power: 1, toughness: 1 });
  });

  it("stays when you pay {1} per counter", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Phantasmal Sphere");
    lands(game, "Island", 2);
    pickModes(a, 0);
    toStep(game, "draw");
    expect(zone(game, sphere)).toBe("battlefield");
    expect(counters(game, sphere)).toBe(1);
  });
});

describe("Lat-Nam's Legacy", () => {
  it("shuffles a card from hand away, then draws two at the next upkeep", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const legacy = toHand(game, "Lat-Nam's Legacy");
    const other = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    pickFromZone(a, other);
    cast(game, legacy);
    expect(zone(game, other)).toBe("library");
    expect(hand(game).length).toBe(before - 2);
    nextTurn(game, "draw");
    expect(hand(game).length).toBe(before);
  });
});

describe("Browse", () => {
  it("puts one of the top five into hand and exiles the other four", () => {
    const { game } = table();
    const browse = spawn(game, "Browse");
    lands(game, "Island", 4);
    const handBefore = hand(game).length;
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    const exileBefore = game.state.zones.shared.exile.length;
    activate(game, browse);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 4);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore - 5);
  });
});

describe("Contagion", () => {
  it("puts both -2/-1 counters on a lone target", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = spawn(game, "Grizzly Bears", B);
    const contagion = toHand(game, "Contagion");
    cast(game, contagion, { targets: [ref(giant), null] });
    // One counter leaves a 2/2 at 0/1; only both kill it.
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Hail Storm", () => {
  it("deals 1 to you and each creature you control, not to an opponent's untapped creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Hail Storm"));
    expect(life(game)).toBe(19);
    expect(game.state.objects[mine].damageMarked).toBe(1);
    expect(game.state.objects[theirs].damageMarked).toBe(0);
  });
});

describe("Viscerid Drone", () => {
  it("sacrifices a creature and a Swamp to destroy a nonartifact creature", () => {
    const { game } = table();
    const drone = spawn(game, "Viscerid Drone");
    const swamp = spawn(game, "Swamp");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, drone, 0, { targets: [ref(giant)] });
    settle(game);
    expect(zone(game, drone)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can't use the snow ability without a snow Swamp", () => {
    const { game } = table();
    const drone = spawn(game, "Viscerid Drone");
    spawn(game, "Swamp");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, drone, 1, { targets: [ref(giant)] })).toThrow();
  });
});

describe("Balduvian Dead", () => {
  it("makes a hasty 3/1 Graveborn that's sacrificed at the next end step", () => {
    const { game } = table();
    const dead = spawn(game, "Balduvian Dead");
    lands(game, "Mountain", 3);
    const corpse = game.debugSpawn("Grizzly Bears", A, "graveyard");
    activate(game, dead);
    expect(zone(game, corpse)).toBe("exile");
    expect(named(game, "Graveborn Token", A)).toHaveLength(1);
    toStep(game, "cleanup");
    expect(named(game, "Graveborn Token", A)).toHaveLength(0);
  });
});

describe("Mishra's Groundbreaker", () => {
  it("makes a land a 3/3 artifact creature land for good", () => {
    const { game } = table();
    const breaker = spawn(game, "Mishra's Groundbreaker");
    const land = spawn(game, "Forest");
    activate(game, breaker, 0, { targets: [ref(land)] });
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
    expect([...game.characteristics(land).types].sort()).toEqual(["artifact", "creature", "land"]);
    nextTurn(game);
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
  });
});
