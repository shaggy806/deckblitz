// Shadowmoor (SHM), group B: the clause of each card most likely to be wrong.
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  registryOf,
  spawn,
  table,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colorsOf = (game: Game, id: ObjectId): readonly string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors].sort();

describe("SHM group B", () => {
  it("Thought Reflection doubles each draw, and two of them quadruple it", () => {
    const { game } = table();
    spawn(game, "Thought Reflection");
    const before = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length - before).toBe(2);
    spawn(game, "Thought Reflection");
    const mid = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length - mid).toBe(4);
  });

  it("Corrosive Mentor gives wither only to black creatures you control", () => {
    const { game } = table();
    const mentor = spawn(game, "Corrosive Mentor");
    const corpse = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Walking Corpse", B);
    expect(keywords(game, mentor).has("wither")).toBe(true);
    expect(keywords(game, corpse).has("wither")).toBe(true);
    expect(keywords(game, bears).has("wither")).toBe(false);
    expect(keywords(game, theirs).has("wither")).toBe(false);
  });

  it("Windbrisk Raptor gives lifelink to attacking creatures only", () => {
    const { game, a } = table();
    spawn(game, "Windbrisk Raptor");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("lifelink")).toBe(false);
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });

  it("Knacksaw Clique: target opponent exiles their top card and you may cast it this turn", () => {
    const { game } = table();
    const clique = spawn(game, "Knacksaw Clique", A, { tapped: true });
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const top = toLibrary(game, "Grizzly Bears", B);
    activate(game, clique, 0, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[clique].tapped).toBe(false);
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
    expect(game.state.objects[top].controller).toBe(A);
  });

  it("Knacksaw Clique's {Q} can't be paid while it's untapped", () => {
    const { game } = table();
    const clique = spawn(game, "Knacksaw Clique");
    lands(game, "Island", 2);
    expect(() => activate(game, clique, 0, { targets: [{ kind: "player", player: B }] })).toThrow();
  });

  it("Witherscale Wurm's blocker gains wither, and damage to an opponent clears its -1/-1 counters", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Witherscale Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: wurm }];
    attack(game, a, [wurm]);
    expect(counters(game, wurm, "-1/-1")).toBe(2);
    expect(pt(game, wurm)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, wurm).has("wither")).toBe(false);
    b.declareBlockersFn = () => [];
    toStep(game, "precombat-main");
    attack(game, a, [wurm]);
    expect(life(game, B)).toBe(13);
    expect(counters(game, wurm, "-1/-1")).toBe(0);
  });

  it("Scrapbasket becomes all five colours until end of turn", () => {
    const { game } = table();
    const basket = spawn(game, "Scrapbasket");
    lands(game, "Wastes", 1);
    expect(colorsOf(game, basket)).toEqual([]);
    activate(game, basket, 0);
    expect(colorsOf(game, basket)).toEqual(["B", "G", "R", "U", "W"]);
    toStep(game, "precombat-main");
    expect(colorsOf(game, basket)).toEqual([]);
  });

  it("Lurebound Scarecrow is sacrificed once you control no permanent of the chosen colour", () => {
    const { game } = table();
    const crow = spawn(game, "Lurebound Scarecrow");
    game.state.objects[crow].chosenOnEnter = "G";
    const bears = spawn(game, "Grizzly Bears");
    const corpse = spawn(game, "Walking Corpse");
    destroy(game, corpse);
    expect(zone(game, crow)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, crow)).toBe("graveyard");
  });

  it("Lurebound Scarecrow with no colour chosen never triggers", () => {
    const { game } = table();
    const crow = spawn(game, "Lurebound Scarecrow");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(zone(game, crow)).toBe("battlefield");
  });

  it("Morselhoarder enters with two -1/-1 counters and removes one for mana", () => {
    const { game } = table();
    const hoarder = enter(game, "Morselhoarder");
    expect(pt(game, hoarder)).toEqual({ power: 4, toughness: 2 });
    activate(game, hoarder, 0);
    expect(counters(game, hoarder, "-1/-1")).toBe(1);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });

  it("Mistmeadow Witch exiles a creature and returns it at the next end step", () => {
    const { game, a } = table();
    const witch = spawn(game, "Mistmeadow Witch");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    activate(game, witch, 0, { targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "precombat-main");
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back.length).toBe(1);
    expect(game.state.objects[back[0]].controller).toBe(B);
  });
});
