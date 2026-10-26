/**
 * Morningtide (MOR; B186), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Rhys the Exiled", () => {
  it("gains 1 life per Elf you control, itself included, as it attacks", () => {
    const { game, a } = table();
    const rhys = spawn(game, "Rhys the Exiled");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    attack(game, a, [rhys]);
    expect(life(game, A)).toBe(23);
  });
});

describe("Diviner's Wand", () => {
  it("attaches to an entering Wizard, whose granted draw pumps it and gives flying", () => {
    const { game, a } = table();
    const wand = spawn(game, "Diviner's Wand");
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    const sorcerer = enter(game, "Prodigal Sorcerer");
    expect(game.state.objects[wand].attachedTo).toBe(sorcerer);
    const before = hand(game).length;
    activate(game, sorcerer, 1);
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, sorcerer)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, sorcerer).has("flying")).toBe(true);
  });
});

describe("Orchard Warden", () => {
  it("may gain life equal to another entering Treefolk's toughness", () => {
    const { game, a } = table();
    spawn(game, "Orchard Warden");
    pickModes(a, 0);
    enter(game, "Blanchwood Treefolk");
    expect(life(game, A)).toBe(25);
  });
});

describe("Graceful Reprieve", () => {
  it("returns the creature once when it dies this turn, not a second time", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Graceful Reprieve"), { targets: [ref(bears)] });
    destroy(game, bears);
    settle(game);
    const back = named(game, "Grizzly Bears", A).filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(1);
    destroy(game, back[0]);
    settle(game);
    expect(named(game, "Grizzly Bears", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(0);
  });
});

describe("Coordinated Barrage", () => {
  it("deals damage equal to the permanents of the type chosen on resolution", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    for (let i = 0; i < 3; i += 1) spawn(game, "Llanowar Elves");
    lands(game, "Plains", 1);
    a.chooseCreatureTypeFn = () => "Elf";
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    cast(game, toHand(game, "Coordinated Barrage"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Pack's Disdain", () => {
  it("counts kindred permanents of the chosen type, not only creatures", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Diviner's Wand");
    spawn(game, "Prodigal Sorcerer");
    spawn(game, "Llanowar Elves");
    lands(game, "Swamp", 2);
    a.chooseCreatureTypeFn = () => "Wizard";
    cast(game, toHand(game, "Pack's Disdain"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Countryside Crusher", () => {
  it("mills lands off the top until a nonland card, which stays on top, and grows per land", () => {
    const { game } = table();
    const crusher = spawn(game, "Countryside Crusher");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const gyBefore = graveyard(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game).length).toBe(gyBefore + 2);
    expect(counters(game, crusher)).toBe(2);
    const library = game.state.zones.perPlayer[A].library;
    expect(zone(game, bears)).toBe("library");
    expect(library[library.length - 1] === bears || library[0] === bears).toBe(true);
    // It's the next card drawn.
    toStep(game, "precombat-main");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Rage Forger", () => {
  it("counters other Shamans, then one with a counter may ping as it attacks", () => {
    const { game, a } = table();
    const drill = spawn(game, "Akki Drillmaster");
    const forger = enter(game, "Rage Forger");
    expect(counters(game, drill)).toBe(1);
    expect(counters(game, forger)).toBe(0);
    pickTargets(a, B);
    pickModes(a, 0);
    attack(game, a, [drill]);
    expect(life(game, B)).toBe(20 - 1 - 3);
  });
});
