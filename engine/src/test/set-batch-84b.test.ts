/**
 * Set walk batch 84, part b (2026-10-15): Aetherdrift (DFT), Aetherdrift Commander (DRC) and Foundations (FDN), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** Answer each modes question in turn with the next of `answers`. */
function modesInOrder(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  let i = 0;
  seat.chooseModesFn = () => [...(answers[Math.min(i++, answers.length - 1)] ?? [])];
}

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Fang-Druid Summoner", () => {
  it("may search the library for a creature card with no abilities — a creature with one isn't offered", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const elves = toLibrary(game, "Llanowar Elves");
    modesInOrder(a, [0], [1]);
    const seen = pickFromZone(a, bears);
    enter(game, "Fang-Druid Summoner");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(elves);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, elves)).toBe("library");
  });

  it("may search the graveyard instead", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    modesInOrder(a, [0], [2]);
    pickFromZone(a, bears);
    enter(game, "Fang-Druid Summoner");
    expect(zone(game, bears)).toBe("hand");
  });

  it("declining searches nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    modesInOrder(a, []);
    pickFromZone(a, bears);
    enter(game, "Fang-Druid Summoner");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Collision Course", () => {
  it("deals damage equal to your creatures and Vehicles, a crewed Vehicle counted once", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    crewed(game, buggy);
    spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Collision Course"), { modes: [0], targets: [ref(wurm)] });
    expect(damageOn(game, wurm)).toBe(3);
  });

  it("or destroys target artifact", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Collision Course"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Shefet Archfiend", () => {
  it("gives every other creature -2/-2 until end of turn, its own side's too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const fiend = enter(game, "Shefet Archfiend");
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, fiend)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Spin Out", () => {
  it("destroys a Vehicle that isn't a creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const buggy = spawn(game, "Rocketeer Boostbuggy", B);
    cast(game, toHand(game, "Spin Out"), { targets: [ref(buggy)] });
    expect(zone(game, buggy)).toBe("graveyard");
  });
});

describe("Ride's End", () => {
  it("costs {3} less aimed at a tapped permanent, and exiles it", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const buggy = spawn(game, "Rocketeer Boostbuggy", B, { tapped: true });
    cast(game, toHand(game, "Ride's End"), { targets: [ref(buggy)] });
    expect(zone(game, buggy)).toBe("exile");
  });

  it("costs full price aimed at an untapped one", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Ride's End"), { targets: [ref(bears)] })).toThrow();
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Midnight Mangler", () => {
  it("is an artifact creature only during turns other than yours", () => {
    const { game } = table();
    const mangler = spawn(game, "Midnight Mangler");
    expect(types(game, mangler)).not.toContain("creature");
    nextTurn(game);
    expect(types(game, mangler)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, mangler)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(types(game, mangler)).not.toContain("creature");
  });
});

describe("Wreck Remover", () => {
  it("entering, exiles up to one card from a graveyard and gains 1 life", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Wreck Remover");
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, A)).toBe(21);
  });

  it("attacking, gains the life even with no card chosen", () => {
    const { game, a } = table();
    const remover = spawn(game, "Wreck Remover");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, null);
    attack(game, a, [remover]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(17);
  });
});

describe("Greasewrench Goblin", () => {
  it("discards up to two, draws that many, and grows — once", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const goblin = spawn(game, "Greasewrench Goblin");
    const one = toHand(game, "Lightning Bolt");
    const two = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    modesInOrder(a, [2]);
    a.chooseDiscardsFn = () => [one, two];
    activate(game, goblin);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(counters(game, goblin)).toBe(1);
    expect(() => activate(game, goblin)).toThrow();
  });

  it("may discard nothing and only take the counter", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const goblin = spawn(game, "Greasewrench Goblin");
    const before = hand(game).length;
    modesInOrder(a, [0]);
    activate(game, goblin);
    expect(hand(game).length).toBe(before);
    expect(counters(game, goblin)).toBe(1);
  });

  it("asked for two with one card in hand, draws one", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const goblin = spawn(game, "Greasewrench Goblin");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    const bolt = toHand(game, "Lightning Bolt");
    const gone = graveyard(game).length;
    modesInOrder(a, [2]);
    activate(game, goblin);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(graveyard(game).length).toBe(gone + 1);
    expect(hand(game).length).toBe(1);
  });
});

describe("Cloudspire Skycycle", () => {
  it("puts one counter on each of two other creatures or Vehicles you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears, buggy]);
    const cycle = enter(game, "Cloudspire Skycycle");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, buggy]));
    expect(seen.offered[0]).not.toContain(cycle);
    expect(seen.offered[0]).toHaveLength(2);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, buggy)).toBe(1);
    expect(counters(game, cycle)).toBe(0);
  });

  it("puts both on one target when only one is chosen", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Rocketeer Boostbuggy");
    pickTargets(a, bears, null);
    enter(game, "Cloudspire Skycycle");
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Hellish Sideswipe", () => {
  it("sacrificing a Vehicle, destroys the target and draws a card", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Hellish Sideswipe");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(giant)], sacrifice: buggy });
    expect(zone(game, buggy)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("sacrificing a creature that isn't a Vehicle, draws nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Hellish Sideswipe");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(giant)], sacrifice: bears });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Plow Through", () => {
  it("has your creature fight theirs", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Plow Through"), { modes: [0], targets: [ref(giant), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(damageOn(game, giant)).toBe(2);
  });

  it("or destroys target Vehicle", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const buggy = spawn(game, "Rocketeer Boostbuggy", B);
    cast(game, toHand(game, "Plow Through"), { modes: [1], targets: [ref(buggy)] });
    expect(zone(game, buggy)).toBe("graveyard");
  });
});

describe("Rise from the Wreck", () => {
  it("returns a creature, a Mount, a Vehicle and a creature with no abilities", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const elves = toGraveyard(game, "Llanowar Elves");
    const jaguar = toGraveyard(game, "Alacrian Jaguar");
    const buggy = toGraveyard(game, "Rocketeer Boostbuggy");
    const bears = toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Rise from the Wreck");
    cast(game, card, { targets: [ref(elves), ref(jaguar), ref(buggy), ref(bears)] });
    for (const id of [elves, jaguar, buggy, bears]) expect(zone(game, id)).toBe("hand");
  });

  it("the last slot takes only a creature card with no abilities", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const elves = toGraveyard(game, "Llanowar Elves");
    const card = toHand(game, "Rise from the Wreck");
    expect(() => cast(game, card, { targets: [null, null, null, ref(elves)] })).toThrow();
  });

  it("may name the same vanilla creature card twice (rule 115.3)", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Rise from the Wreck"), { targets: [ref(bears), null, null, ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Dune Drifter", () => {
  it("returns an artifact or creature card with mana value X or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Dune Drifter"), { x: 2 });
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, ring]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("put onto the battlefield without being cast, X is 0", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a);
    enter(game, "Dune Drifter");
    expect(seen.offered[0] ?? []).not.toContain(bears);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ooze Patrol", () => {
  it("mills two, then counts the artifact and creature cards in your graveyard, the milled ones too", () => {
    const { game } = table();
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    toLibrary(game, "Forest");
    toLibrary(game, "Hill Giant");
    const ooze = enter(game, "Ooze Patrol");
    expect(counters(game, ooze)).toBe(2);
    expect(pt(game, ooze)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Lotusguard Disciple", () => {
  it("gives a Vehicle lifelink and indestructible until end of turn", () => {
    const { game, a } = table();
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    spawn(game, "Grizzly Bears");
    pickTargets(a, buggy);
    enter(game, "Lotusguard Disciple");
    expect(keywords(game, buggy).has("lifelink")).toBe(true);
    expect(keywords(game, buggy).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(keywords(game, buggy).has("lifelink")).toBe(false);
  });
});

describe("Pothole Mole", () => {
  it("mills three, then may return a land card from the graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, forest);
    enter(game, "Pothole Mole");
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickFromZone(a);
    enter(game, "Pothole Mole");
    expect(zone(game, forest)).toBe("graveyard");
  });
});
