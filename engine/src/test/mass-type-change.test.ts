/**
 * A mass change of types, `become` under `for-each-permanent`: everything matching changes, its P/T left
 * alone — "Vehicles you control become artifact creatures" (Start Your Engines,
 * The Thanos-Copter), "lands you control gain all basic land types"
 * (Energybending), "creatures you control gain all creature types" (Volatile
 * Claws), "each land you control becomes that type" (Terraformer), "each land
 * of the first chosen type becomes the second chosen type" (Vision Charm).
 * Rules 205.1a and b, 305.6, 305.7, 611.2c.
 */

import { describe, expect, it } from "vitest";

import { hasSubtype } from "../subtypes.js";
import { intrinsicManaColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  registryOf,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const choose = (game: Game, player: PlayerId, answer: string): void => {
  game.dispatch({ type: "choose-creature-type", player, creatureType: answer });
};
const isType = (game: Game, id: ObjectId, subtype: string): boolean => hasSubtype(subtypes(game, id), subtype);

describe("Vehicles you control become artifact creatures", () => {
  it("Start Your Engines: its own P/T, its other types, +2/+0 for each, until end of turn", () => {
    const { game } = table();
    const mine = spawn(game, "Smuggler's Copter");
    const theirs = spawn(game, "Smuggler's Copter", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Start Your Engines"));
    expect(types(game, mine)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, mine)).toContain("Vehicle");
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(types(game, theirs)).toEqual(["artifact"]);
    nextTurn(game);
    expect(types(game, mine)).toEqual(["artifact"]);
  });

  it("The Thanos-Copter: every Vehicle on its entry, itself included, and it draws when a Vehicle connects", () => {
    const { game, a } = table();
    const copter = spawn(game, "Smuggler's Copter", A, { sick: false });
    const thanos = enter(game, "The Thanos-Copter");
    expect(types(game, thanos)).toContain("creature");
    expect(types(game, copter)).toContain("creature");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const cards = hand(game).length;
    const before = life(game, B);
    attack(game, a, [thanos, copter]);
    expect(life(game, B)).toBe(before - 5 - 3);
    // The Thanos-Copter's own trigger, once a Vehicle, and the Copter's looting.
    expect(hand(game).length).toBeGreaterThanOrEqual(cards + 2);
  });

  it("reaches every token of a stack", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Thopter Token", count: 8 });
    game.debugApplyEffect(A, {
      kind: "for-each-permanent",
      filter: { subtype: "Thopter", controlledBy: "you" },
      simultaneous: true,
      effect: { kind: "become", target: 0, addSubtypes: ["Vehicle"], duration: "end-of-turn" },
    });
    const tokens = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Thopter Token");
    const total = tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(total).toBe(8);
    for (const id of tokens) expect(subtypes(game, id)).toContain("Vehicle");
  });

  it("fixed as it resolves: a Vehicle arriving later isn't one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Start Your Engines"));
    const later = spawn(game, "Smuggler's Copter");
    expect(types(game, later)).toEqual(["artifact"]);
  });
});

describe("gain all basic land types", () => {
  it("Energybending: each land is all five in addition, with their mana, and a card is drawn", () => {
    const { game } = table();
    const wastes = spawn(game, "Wastes");
    const forge = spawn(game, "Urza's Tower");
    const other = spawn(game, "Forest", B);
    lands(game, "Wastes", 2);
    toLibrary(game, "Island");
    const cards = hand(game).length;
    cast(game, toHand(game, "Energybending"));
    for (const land of [wastes, forge]) {
      for (const t of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) expect(subtypes(game, land)).toContain(t);
    }
    expect(subtypes(game, forge)).toContain("Urza's");
    expect(subtypes(game, forge)).toContain("Tower");
    expect(subtypes(game, other)).toEqual(["Forest"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[wastes]).length).toBe(5);
    expect(hand(game).length).toBe(cards + 1);
    nextTurn(game);
    expect(subtypes(game, wastes)).toEqual([]);
  });
});

describe("gain all creature types", () => {
  it("Volatile Claws: +2/+0 and every creature type, on creatures you control now", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Volatile Claws"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(isType(game, bears, "Sliver")).toBe(true);
    expect(isType(game, bears, "Bear")).toBe(true);
    expect(isType(game, theirs, "Sliver")).toBe(false);
    const later = spawn(game, "Grizzly Bears");
    expect(isType(game, later, "Sliver")).toBe(false);
    nextTurn(game);
    expect(isType(game, bears, "Sliver")).toBe(false);
  });
});

describe("each land you control becomes that type", () => {
  it("Terraformer: chosen as it resolves, replacing every land type and its text (305.7)", () => {
    const { game } = table();
    const former = spawn(game, "Terraformer");
    const forest = spawn(game, "Forest");
    const dual = spawn(game, "Underground Sea");
    const other = spawn(game, "Forest", B);
    lands(game, "Wastes", 1);
    activate(game, former, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    choose(game, A, "Mountain");
    expect(subtypes(game, forest)).toEqual(["Mountain"]);
    expect(subtypes(game, dual)).toEqual(["Mountain"]);
    expect(subtypes(game, other)).toEqual(["Forest"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[dual])).toEqual(["R"]);
    nextTurn(game);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
  });
});

describe("Vision Charm", () => {
  const charm = (game: Game): void => {
    lands(game, "Island", 1);
    cast(game, toHand(game, "Vision Charm"), { modes: [1], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
  };

  it("each land of the first chosen type, anyone's, becomes the second", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    const dual = spawn(game, "Tropical Island");
    const swamp = spawn(game, "Swamp");
    charm(game);
    choose(game, A, "Forest");
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    choose(game, A, "Plains");
    for (const land of [forest, theirs, dual]) expect(subtypes(game, land)).toEqual(["Plains"]);
    expect(subtypes(game, swamp)).toEqual(["Swamp"]);
    nextTurn(game);
    expect(subtypes(game, dual)).toEqual(expect.arrayContaining(["Forest", "Island"]));
  });

  it("the first choice is any land type, the second only a basic", () => {
    const { game } = table();
    charm(game);
    const first = game.state.awaiting;
    expect(first?.kind === "choose-creature-type" ? first.options : []).toContain("Gate");
    choose(game, A, "Gate");
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    const second = game.state.awaiting;
    expect(second?.kind === "choose-creature-type" ? second.options : []).toEqual([
      "Plains",
      "Island",
      "Swamp",
      "Mountain",
      "Forest",
    ]);
  });

  it("its other modes: mills four; phases an artifact out", () => {
    const { game } = table();
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island", B);
    const copter = spawn(game, "Smuggler's Copter", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Vision Charm"), { modes: [0], targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].graveyard.length).toBeGreaterThanOrEqual(4);
    cast(game, toHand(game, "Vision Charm"), { modes: [2], targets: [ref(copter)] });
    expect(zone(game, copter)).toBe("phased-out");
  });
});
