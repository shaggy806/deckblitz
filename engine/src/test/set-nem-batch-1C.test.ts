/**
 * Nemesis (NEM; B223) — group C: fading, spellshapers, the free-cast and
 * tap-a-creature alternative costs, and a few searches.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Fading (Skyshroud Behemoth)", () => {
  it("enters tapped with two fade counters, loses one each upkeep, then is sacrificed", () => {
    const { game } = table();
    const behemoth = enter(game, "Skyshroud Behemoth");
    expect(game.state.objects[behemoth].tapped).toBe(true);
    expect(counters(game, behemoth, "fade")).toBe(2);
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect(counters(game, behemoth, "fade")).toBe(1);
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect(counters(game, behemoth, "fade")).toBe(0);
    expect(zone(game, behemoth)).toBe("battlefield");
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect(zone(game, behemoth)).toBe("graveyard");
  });
});

describe("Jolting Merfolk", () => {
  it("spends a fade counter to tap target creature", () => {
    const { game } = table();
    const merfolk = enter(game, "Jolting Merfolk");
    expect(counters(game, merfolk, "fade")).toBe(4);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, merfolk, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, merfolk, "fade")).toBe(3);
  });
});

describe("Massacre", () => {
  it("is free only while an opponent controls a Plains and you control a Swamp", () => {
    const { game } = table();
    const card = toHand(game, "Massacre");
    const freeOffered = (): boolean =>
      game.legalActions(A).some((act) => act.kind === "cast-spell" && act.card === card && act.free === true);
    spawn(game, "Swamp");
    expect(freeOffered()).toBe(false);
    spawn(game, "Plains", B);
    expect(freeOffered()).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, card, { free: true });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Lashknife", () => {
  it("is cast by tapping an untapped creature only while you control a Plains", () => {
    const { game } = table();
    const knife = toHand(game, "Lashknife");
    const bears = spawn(game, "Grizzly Bears");
    const altOffered = (): boolean =>
      game.legalActions(A).some((act) => act.kind === "cast-spell" && act.card === knife && act.altCost === true);
    expect(altOffered()).toBe(false);
    spawn(game, "Plains");
    expect(altOffered()).toBe(true);
    cast(game, knife, { altCost: true, targets: [ref(bears)] });
    expect(zone(game, knife)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Pack Hunt", () => {
  it("finds cards with the target creature's name, and only those", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Llanowar Elves");
    const target = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    const card = toHand(game, "Pack Hunt");
    const seen = pickFromZone(a, one, two);
    cast(game, card, { targets: [ref(target)] });
    expect([...seen.offered].sort()).toEqual([one, two].sort());
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
  });
});

describe("Belbe's Portal", () => {
  it("puts only a creature card of the chosen type from hand onto the battlefield", () => {
    const { game, a } = table();
    const portal = spawn(game, "Belbe's Portal");
    game.state.objects[portal].chosenCreatureType = "Bear";
    lands(game, "Wastes", 3);
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Llanowar Elves");
    const seen = pickFromZone(a, bears);
    activate(game, portal, 0);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Eye of Yawgmoth", () => {
  it("reveals cards equal to the sacrificed creature's power, keeps one and exiles the rest", () => {
    const { game, a } = table();
    const eye = spawn(game, "Eye of Yawgmoth");
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    const third = toLibrary(game, "Plains");
    const second = toLibrary(game, "Island");
    const first = toLibrary(game, "Swamp");
    pickFromZone(a, second);
    game.dispatch({ type: "activate-ability", player: A, source: eye, abilityIndex: 0, targets: [], sacrifice: bears });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, third)).toBe("library");
  });

  it("reveals nothing for a 0-power creature", () => {
    const { game } = table();
    const eye = spawn(game, "Eye of Yawgmoth");
    lands(game, "Wastes", 3);
    const thopter = spawn(game, "Ornithopter");
    const top = toLibrary(game, "Swamp");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: eye, abilityIndex: 0, targets: [], sacrifice: thopter });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, top)).toBe("library");
    expect(hand(game).length).toBe(before);
  });
});

describe("Avenger en-Dal", () => {
  it("exiles an attacking creature and its controller gains life equal to its toughness", () => {
    const { game, b } = table();
    const avenger = spawn(game, "Avenger en-Dal");
    lands(game, "Plains", 3);
    nextTurn(game);
    const giant = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    const before = hand(game).length;
    activate(game, avenger, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, B)).toBe(23);
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Flowstone Slide", () => {
  it("gives all creatures +X/-X", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Flowstone Slide"), { x: 1 });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 2 });
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });
});
