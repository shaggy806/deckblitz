/**
 * Setting base power or base toughness alone (the
 * `effect:set-base-power-only` family): an `animate` given only a `power` or
 * only a `toughness` sets that one in layer 7b (rule 613.4b) — fixed or a
 * live amount read once as it resolves (608.2h), until end of turn or
 * indefinitely — and leaves the other as it was; counters and pumps (7c)
 * still apply on top, and a later set overrides an earlier one by timestamp
 * (613.7).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, keywords, lands, nextTurn, pt, ref, spawn, table, toGraveyard, toStep, types } from "./harness.js";

const plusOne = (game: Game, id: ObjectId): void => {
  game.state.objects[id].counters["+1/+1"] = 1;
};

describe("base power alone", () => {
  it("Island of Wak-Wak: base power 0 until end of turn, toughness kept, counters on top", () => {
    const { game } = table();
    const wak = spawn(game, "Island of Wak-Wak");
    const angel = spawn(game, "Serra Angel", B);
    plusOne(game, angel);
    expect(pt(game, angel)).toEqual({ power: 5, toughness: 5 });
    activate(game, wak, 0, { targets: [ref(angel)] });
    // Base 0/4, then the counter (7c).
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 5 });
    // Nothing became a creature or lost a type.
    expect(types(game, angel)).toEqual(["creature"]);
    nextTurn(game);
    expect(pt(game, angel)).toEqual({ power: 5, toughness: 5 });
  });

  it("Island of Wak-Wak can't target a creature without flying", () => {
    const { game } = table();
    const wak = spawn(game, "Island of Wak-Wak");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, wak, 0, { targets: [ref(bears)] })).toThrow(/refused/);
  });

  it("Turtle-Duck: its own base power 4 and trample, its toughness still 4", () => {
    const { game } = table();
    const duck = spawn(game, "Turtle-Duck");
    lands(game, "Wastes", 3);
    activate(game, duck, 0);
    expect(pt(game, duck)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, duck).has("trample")).toBe(true);
    nextTurn(game);
    expect(pt(game, duck)).toEqual({ power: 0, toughness: 4 });
  });

  it("Riptide Mangler: the target's power, read once and kept indefinitely; a later set overrides it", () => {
    const { game } = table();
    const mangler = spawn(game, "Riptide Mangler");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    activate(game, mangler, 0, { targets: [ref(giant)] });
    expect(pt(game, mangler)).toEqual({ power: 3, toughness: 3 });
    // Read once (rule 608.2h): the giant growing later doesn't move it.
    plusOne(game, giant);
    expect(pt(game, mangler)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, mangler)).toEqual({ power: 3, toughness: 3 });
    // The latest set wins (rule 613.7).
    activate(game, mangler, 0, { targets: [ref(bears)] });
    expect(pt(game, mangler)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("base toughness alone", () => {
  it("Chariot of the Sun: flying and base toughness 1 until end of turn, power kept", () => {
    const { game } = table();
    const chariot = spawn(game, "Chariot of the Sun");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 2);
    activate(game, chariot, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, giant).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Chariot of the Sun targets only a creature you control", () => {
    const { game } = table();
    const chariot = spawn(game, "Chariot of the Sun");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 2);
    expect(() => activate(game, chariot, 0, { targets: [ref(giant)] })).toThrow(/refused/);
  });

  it("Wall of Tombstones: base toughness 1 plus the creature cards in your graveyard, set each upkeep", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Tombstones");
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 1 });
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Grizzly Bears", B);
    // Not until alice's next upkeep: bob's turn first.
    nextTurn(game);
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 1 });
    toStep(game, "precombat-main", A);
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 3 });
    // Indefinitely: the graveyard growing doesn't change it until the next
    // upkeep sets it again; counters still add on top.
    toGraveyard(game, "Hill Giant");
    plusOne(game, wall);
    expect(pt(game, wall)).toEqual({ power: 1, toughness: 4 });
  });

  it("a power-only set and a toughness-only set on one creature each keep their half", () => {
    const { game } = table();
    const chariot = spawn(game, "Chariot of the Sun");
    const wak = spawn(game, "Island of Wak-Wak");
    const angel = spawn(game, "Serra Angel");
    lands(game, "Wastes", 2);
    activate(game, wak, 0, { targets: [ref(angel)] });
    activate(game, chariot, 0, { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 1 });
  });
});
