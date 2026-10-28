/**
 * B249 group B: cards freed by the static loss of all abilities, block limits
 * and "becomes a [type]" — Kenrith's Transformation, Trickster's Elk, Sludge
 * Monster, In Too Deep, Kormus Bell, Stop Cold, Tamiyo's Compleation,
 * Vanguard's Shield, Mistform Wall, Warden of the First Tree, Opal Acrolith,
 * Trickery Charm, Spider-Man No More, Ichthyomorphosis.
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();

const answerType = (game: Game, creatureType: string): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
  game.dispatch({ type: "choose-creature-type", player: A, creatureType });
  settle(game);
};

describe("an Aura that makes it something else", () => {
  it("Kenrith's Transformation: an artifact creature is only a green 3/3 Elk creature, and alice draws", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Kenrith's Transformation"), { targets: [ref(thopter)] });
    expect(hand(game).length).toBe(before + 1);
    expect(types(game, thopter)).toEqual(["creature"]);
    expect(subtypes(game, thopter)).toEqual(["Elk"]);
    expect(colorsOf(game, thopter)).toEqual(["G"]);
    expect(pt(game, thopter)).toEqual({ power: 3, toughness: 3 });
    expect([...keywords(game, thopter)]).toEqual([]);
  });

  it("Trickster's Elk bestowed: the enchanted Angel is a green 3/3 Elk with no flying", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 2);
    const elk = toHand(game, "Trickster's Elk");
    cast(game, elk, { targets: [ref(angel)], overload: true });
    expect(game.state.objects[elk].attachedTo).toBe(angel);
    expect(pt(game, angel)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, angel)).toEqual(["Elk"]);
    expect(colorsOf(game, angel)).toEqual(["G"]);
    expect([...keywords(game, angel)]).toEqual([]);
  });

  it("Ichthyomorphosis: a blue 0/1 Fish that keeps its other card types", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Ichthyomorphosis"), { targets: [ref(thopter)] });
    expect(types(game, thopter)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, thopter)).toEqual(["Fish"]);
    expect(colorsOf(game, thopter)).toEqual(["U"]);
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 1 });
    expect([...keywords(game, thopter)]).toEqual([]);
  });

  it("Spider-Man No More: a 1/1 Citizen with defender and nothing else, still white", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Spider-Man No More"), { targets: [ref(angel)] });
    expect(subtypes(game, angel)).toEqual(["Citizen"]);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, angel)]).toEqual(["defender"]);
    expect(colorsOf(game, angel)).toEqual(["W"]);
  });

  it("In Too Deep: a creature is a colourless Clue artifact that can be sacrificed to draw, the Aura staying on", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 4);
    const aura = toHand(game, "In Too Deep");
    cast(game, aura, { targets: [ref(bears)] });
    expect(types(game, bears)).toEqual(["artifact"]);
    expect(subtypes(game, bears)).toEqual(["Clue"]);
    expect(colorsOf(game, bears)).toEqual([]);
    expect(zone(game, aura)).toBe("battlefield");
    const sac = game
      .legalActions(A)
      .find((action) => action.kind === "activate-ability" && action.source === bears);
    expect(sac).toBeDefined();
    if (sac?.kind !== "activate-ability") return;
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: sac.abilityIndex, targets: [] });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game)).toContain(bears);
  });

  it("Stop Cold: the creature is tapped and stays tapped through its untap step", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Stop Cold"), { targets: [ref(angel)] });
    expect(game.state.objects[angel].tapped).toBe(true);
    expect([...keywords(game, angel)]).toEqual([]);
    nextTurn(game);
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("Tamiyo's Compleation on an attached Equipment taps and unattaches it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const splitter = spawn(game, "Bonesplitter", A);
    lands(game, "Island", 5);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    cast(game, toHand(game, "Tamiyo's Compleation"), { targets: [ref(splitter)] });
    expect(game.state.objects[splitter].tapped).toBe(true);
    expect(game.state.objects[splitter].attachedTo).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Tamiyo's Compleation on a creature only taps it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Tamiyo's Compleation"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("statics over many", () => {
  it("Sludge Monster: its target gets a slime counter and is a 2/2 with no abilities", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    const monster = enter(game, "Sludge Monster", A);
    expect(counters(game, angel, "slime")).toBe(1);
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
    expect([...keywords(game, angel)]).toEqual([]);
    expect(pt(game, monster)).toEqual({ power: 5, toughness: 5 });
  });

  it("Sludge Monster: a Horror with a slime counter is untouched", () => {
    const { game } = table();
    const other = spawn(game, "Sludge Monster", B);
    game.state.objects[other].counters.slime = 1;
    spawn(game, "Sludge Monster", A);
    expect(pt(game, other)).toEqual({ power: 5, toughness: 5 });
  });

  it("Kormus Bell: every Swamp is a 1/1 black creature land", () => {
    const { game } = table();
    const swamp = spawn(game, "Swamp", B);
    const island = spawn(game, "Island", B);
    spawn(game, "Kormus Bell", A);
    expect(types(game, swamp)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, swamp)).toEqual({ power: 1, toughness: 1 });
    expect(colorsOf(game, swamp)).toEqual(["B"]);
    expect(types(game, island)).toEqual(["land"]);
  });

  it("Vanguard's Shield: the equipped creature gets +0/+3", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const shield = spawn(game, "Vanguard's Shield", A);
    lands(game, "Wastes", 3);
    activate(game, shield, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("becoming a type", () => {
  it("Mistform Wall has defender only while it's a Wall", () => {
    const { game } = table();
    const wall = spawn(game, "Mistform Wall", A);
    lands(game, "Island", 1);
    expect(keywords(game, wall)).toContain("defender");
    activate(game, wall, 0, { settle: false });
    answerType(game, "Goblin");
    expect(subtypes(game, wall)).toEqual(["Goblin"]);
    expect(keywords(game, wall)).not.toContain("defender");
  });

  it("Warden of the First Tree: Warrior, then Spirit with trample and lifelink, then five counters", () => {
    const { game } = table();
    const warden = spawn(game, "Warden of the First Tree", A);
    lands(game, "Plains", 14);
    // Not yet a Spirit: the third ability does nothing.
    activate(game, warden, 2);
    expect(counters(game, warden)).toBe(0);
    activate(game, warden, 0);
    expect(subtypes(game, warden)).toEqual(["Human", "Warrior"]);
    expect(pt(game, warden)).toEqual({ power: 3, toughness: 3 });
    activate(game, warden, 1);
    expect(subtypes(game, warden)).toEqual(["Human", "Spirit", "Warrior"]);
    expect([...keywords(game, warden)].sort()).toEqual(["lifelink", "trample"]);
    expect(pt(game, warden)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    nextTurn(game);
    expect(subtypes(game, warden)).toEqual(["Human", "Spirit", "Warrior"]);
    for (const id of game.battlefield) if (game.state.objects[id].cardName === "Plains") game.state.objects[id].tapped = false;
    activate(game, warden, 2);
    expect(counters(game, warden)).toBe(5);
  });

  it("Warden of the First Tree: the second ability does nothing while it isn't a Warrior", () => {
    const { game } = table();
    const warden = spawn(game, "Warden of the First Tree", A);
    lands(game, "Plains", 4);
    activate(game, warden, 1);
    expect(subtypes(game, warden)).toEqual(["Human"]);
    expect([...keywords(game, warden)]).toEqual([]);
  });

  it("Opal Acrolith: a 2/4 Soldier creature when an opponent casts a creature, an enchantment again for {0}", () => {
    const { game } = table();
    const acrolith = spawn(game, "Opal Acrolith", A);
    lands(game, "Forest", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(types(game, acrolith)).toEqual(["creature"]);
    expect(subtypes(game, acrolith)).toEqual(["Soldier"]);
    expect(pt(game, acrolith)).toEqual({ power: 2, toughness: 4 });
    nextTurn(game);
    activate(game, acrolith, 0);
    expect(types(game, acrolith)).toEqual(["enchantment"]);
    expect(subtypes(game, acrolith)).toEqual([]);
  });

  it("Trickery Charm's second mode: the target is only the chosen creature type", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Trickery Charm"), { targets: [ref(bears)], modes: [1], settle: false });
    answerType(game, "Goblin");
    expect(subtypes(game, bears)).toEqual(["Goblin"]);
    nextTurn(game);
    expect(subtypes(game, bears)).toEqual(["Bear"]);
  });
});
