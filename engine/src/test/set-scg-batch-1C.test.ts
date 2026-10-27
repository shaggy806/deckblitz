/**
 * Scourge (SCG; B216) — group c: Soldier and Elf lords, a Decree, Karona,
 * the graveyard-returning Dragon Auras and the morph punisher.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
  enter,
} from "./harness.js";

describe("Daru Warchief", () => {
  it("gives Soldiers you control +1/+2, itself included, and only Soldiers", () => {
    const { game } = table();
    const chief = spawn(game, "Daru Warchief");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, chief)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Decree of Silence", () => {
  it("counters an opponent's spell, and goes with its third depletion counter", () => {
    const { game } = table();
    const decree = spawn(game, "Decree of Silence");
    game.state.objects[decree].counters.depletion = 2;
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, decree)).toBe("graveyard");
  });
});

describe("Ambush Commander", () => {
  it("makes only your Forests 1/1 green Elf creatures that are still lands", () => {
    const { game } = table();
    spawn(game, "Ambush Commander");
    const [forest] = lands(game, "Forest", 1);
    const [theirs] = lands(game, "Forest", 1, B);
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Elf"]));
    expect(pt(game, forest)).toEqual({ power: 1, toughness: 1 });
    expect(game.characteristics(forest).colors).toEqual(new Set(["G"]));
    expect(types(game, theirs)).not.toContain("creature");
  });
});

describe("Karona, False God", () => {
  it("each player untaps it and gains control of it in their upkeep", () => {
    const { game } = table();
    const karona = spawn(game, "Karona, False God", A, { tapped: true });
    nextTurn(game);
    expect(controller(game, karona)).toBe(B);
    expect(game.state.objects[karona].tapped).toBe(false);
  });

  it("pumps every creature of the chosen type when it attacks", () => {
    const { game, a } = table();
    const karona = spawn(game, "Karona, False God");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = () => "Bear";
    attack(game, a, [karona]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, karona)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Bladewing's Thrall", () => {
  it("returns from your graveyard when an opponent's Dragon enters, under your control", () => {
    const { game, a } = table();
    const thrall = toGraveyard(game, "Bladewing's Thrall");
    pickModes(a, 0);
    enter(game, "Shivan Dragon", B);
    expect(zone(game, thrall)).toBe("battlefield");
    expect(controller(game, thrall)).toBe(A);
    // You don't control a Dragon: no flying.
    expect(keywords(game, thrall).has("flying")).toBe(false);
  });
});

describe("Dragon Wings", () => {
  it("returns attached to a creature with mana value 6 or greater, not a smaller one", () => {
    const { game, a } = table();
    const wings = toGraveyard(game, "Dragon Wings");
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(zone(game, wings)).toBe("graveyard");
    const dragon = enter(game, "Shivan Dragon", B);
    expect(zone(game, wings)).toBe("battlefield");
    expect(game.state.objects[wings].attachedTo).toBe(dragon);
    expect(controller(game, wings)).toBe(A);
  });
});

describe("Accelerated Mutation", () => {
  it("pumps by the greatest mana value among your permanents", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    spawn(game, "Shivan Dragon", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Ambush Commander");
    const spell = toHand(game, "Accelerated Mutation");
    cast(game, spell, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Extra Arms", () => {
  it("the enchanted creature deals 2 damage to any target when it attacks", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const arms = toHand(game, "Extra Arms");
    cast(game, arms, { targets: [ref(bears)] });
    expect(game.state.objects[arms].attachedTo).toBe(bears);
    pickTargets(a, B);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 2 - 2);
    // Both hits — the trigger's and combat's — come from the creature, never the Aura.
    const sources = game.state.eventLog.flatMap((e) => (e.type === "damage-dealt" ? [e.source] : []));
    expect(sources).toEqual([bears, bears]);
  });
});

describe("Kurgadon", () => {
  it("gets three counters for a creature spell of mana value 6 or more only", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 6);
    const kurgadon = spawn(game, "Kurgadon");
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, kurgadon)).toBe(0);
    cast(game, toHand(game, "Shivan Dragon"));
    expect(counters(game, kurgadon)).toBe(3);
  });
});

describe("Fatal Mutation", () => {
  it("destroys the enchanted creature as it's turned face up", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    lands(game, "Island", 1);
    const alchemist = toHand(game, "Aphetto Alchemist");
    cast(game, alchemist, { via: "face-down" });
    const mutation = toHand(game, "Fatal Mutation");
    cast(game, mutation, { targets: [ref(alchemist)] });
    expect(game.state.objects[mutation].attachedTo).toBe(alchemist);
    game.dispatch({ type: "turn-face-up", player: A, permanent: alchemist, morph: true } as Action);
    settle(game);
    expect(graveyard(game)).toContain(alchemist);
  });
});
