/**
 * Cards banned in Commander for power, added for casual play (2026-10-11), part b.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  named,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const poolOf = (game: ReturnType<typeof table>["game"]): string[] =>
  game.state.players[A].manaPool.map((unit) => unit.type);

describe("Mox Ruby, Tolarian Academy, Rofellos, Llanowar Emissary", () => {
  it("add their colour: one from a Mox, one per artifact from the Academy, one per Forest from Rofellos", () => {
    const { game } = table();
    const mox = spawn(game, "Mox Ruby");
    activate(game, mox);
    expect(poolOf(game)).toEqual(["R"]);
    game.state.players[A].manaPool = [];

    // The Academy isn't an artifact; the Mox and two rocks are.
    spawn(game, "Sol Ring");
    spawn(game, "Mind Stone");
    const academy = spawn(game, "Tolarian Academy");
    activate(game, academy);
    expect(poolOf(game)).toEqual(["U", "U", "U"]);
    game.state.players[A].manaPool = [];

    // A Breeding Pool is a Forest; an Island and Bob's Forest aren't counted.
    lands(game, "Forest", 2);
    spawn(game, "Breeding Pool");
    settle(game); // its "you may pay 2 life" as it enters
    spawn(game, "Island");
    spawn(game, "Forest", B);
    const rofellos = spawn(game, "Rofellos, Llanowar Emissary");
    activate(game, rofellos);
    expect(poolOf(game)).toEqual(["G", "G", "G"]);
  });
});

describe("Paradox Engine", () => {
  it("untaps your nonland permanents when you cast a spell, before the spell resolves, but not your lands", () => {
    const { game } = table();
    spawn(game, "Paradox Engine");
    const ring = spawn(game, "Sol Ring", A, { tapped: true });
    const elves = spawn(game, "Llanowar Elves", A, { tapped: true });
    const theirs = spawn(game, "Sol Ring", B, { tapped: true });
    const forests = lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // The trigger is above the spell.
    expect(game.state.zones.shared.stack).toHaveLength(2);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[ring].tapped).toBe(false);
    expect(game.state.objects[elves].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(true);
    for (const forest of forests) expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Prophet of Kruphix", () => {
  it("untaps your creatures and lands, not your artifacts, in another player's untap step, and gives creature spells flash", () => {
    const { game } = table();
    spawn(game, "Prophet of Kruphix");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const forests = [spawn(game, "Forest", A, { tapped: true }), spawn(game, "Forest", A, { tapped: true })];
    const ring = spawn(game, "Sol Ring", A, { tapped: true });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(false);
    for (const forest of forests) expect(game.state.objects[forest].tapped).toBe(false);
    expect(game.state.objects[ring].tapped).toBe(true);

    // In Bob's upkeep: a creature spell, yes; a sorcery, no.
    const sorcery = toHand(game, "Divination");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === sorcery)).toBe(false);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Recurring Nightmare", () => {
  it("sacrifices a creature and returns itself to hand as costs, reanimating the target, only as a sorcery", () => {
    const { game } = table();
    const nightmare = spawn(game, "Recurring Nightmare");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const offer = game
      .legalActions(A)
      .find((x): x is Extract<LegalAction, { kind: "activate-ability" }> => x.kind === "activate-ability" && x.source === nightmare);
    expect(offer?.sacrifice?.choices).toEqual([bears]);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: nightmare,
      abilityIndex: 0,
      targets: [ref(giant)],
      sacrifice: bears,
    });
    // Costs: both paid before anyone can respond.
    expect(zone(game, nightmare)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");

    // Not in an upkeep.
    const again = spawn(game, "Recurring Nightmare");
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    const offered = game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === again);
    expect(offered).toBe(false);
  });
});

describe("Tinker", () => {
  it("can't be cast without an artifact to sacrifice, and puts an artifact from the library onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const tinker = toHand(game, "Tinker");
    const castable = (): boolean => game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === tinker);
    expect(castable()).toBe(false);
    const ring = spawn(game, "Sol Ring");
    expect(castable()).toBe(true);
    const stone = toLibrary(game, "Mind Stone");
    pickFromZone(a, stone);
    cast(game, tinker);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Primeval Titan", () => {
  it("may fetch up to two lands tapped as it enters, and again as it attacks", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const pool = toLibrary(game, "Breeding Pool");
    pickModes(a, 0);
    pickFromZone(a, forest, pool);
    const titan = enter(game, "Primeval Titan");
    for (const land of [forest, pool]) {
      expect(zone(game, land)).toBe("battlefield");
      expect(game.state.objects[land].tapped).toBe(true);
    }
    // Attacking: declined this time — nothing found, nothing moved.
    const island = toLibrary(game, "Island");
    pickModes(a);
    attack(game, a, [titan]);
    expect(zone(game, island)).toBe("library");
    // Accepted, next turn.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const another = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, another);
    attack(game, a, [titan]);
    expect(zone(game, another)).toBe("battlefield");
    expect(game.state.objects[another].tapped).toBe(true);
  });
});

describe("Upheaval", () => {
  it("returns every permanent, each player's, to its owner's hand, tokens included", () => {
    const { game } = table();
    const islands = lands(game, "Island", 6);
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    const stolen = spawn(game, "Hill Giant", B);
    game.state.objects[stolen].controller = A;
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(named(game, "Soldier Token")).toHaveLength(1);
    const upheaval = toHand(game, "Upheaval");
    cast(game, upheaval);
    expect(game.state.zones.shared.battlefield).toHaveLength(0);
    for (const id of [...islands, ring]) expect(hand(game, A)).toContain(id);
    expect(hand(game, B)).toContain(theirs);
    expect(hand(game, B)).toContain(stolen);
    expect(named(game, "Soldier Token")).toHaveLength(0);
    expect(zone(game, upheaval)).toBe("graveyard");
  });
});

describe("Time Walk", () => {
  it("gives you the next turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "Time Walk"));
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(activePlayerOf(game.state)).toBe(A);
  });
});
