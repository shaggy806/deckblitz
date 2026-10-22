/**
 * The Dark, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Safe Haven", () => {
  it("exiles your creature with it, and returns it only when sacrificed at your upkeep", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const haven = spawn(game, "Safe Haven");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, haven, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    pickModes(a, 0);
    toStep(game, "draw");
    expect(zone(game, haven)).toBe("graveyard");
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].controller).toBe(A);
  });

  it("keeps the cards when you decline to sacrifice it", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const haven = spawn(game, "Safe Haven");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, haven, 0, { targets: [ref(bears)] });
    pickModes(a);
    toStep(game, "draw");
    expect(zone(game, haven)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Martyr's Cry", () => {
  it("exiles every white creature, and each controller draws one per creature of theirs", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    const theirs = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Martyr's Cry");
    const handA = hand(game, A).length - 1;
    const handB = hand(game, B).length;
    cast(game, spell);
    for (const id of [...mine, theirs]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, A).length).toBe(handA + 2);
    expect(hand(game, B).length).toBe(handB + 1);
  });
});

describe("Marsh Viper", () => {
  it("gives two poison counters for noncombat damage to a player too", () => {
    const { game } = table();
    const viper = spawn(game, "Marsh Viper");
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)], { source: viper });
    settle(game);
    expect(game.state.players[B].counters?.poison ?? 0).toBe(2);
  });
});

describe("Electric Eel", () => {
  it("deals 1 damage to you as it enters and each time it's pumped", () => {
    const { game } = table();
    const eel = enter(game, "Electric Eel");
    expect(life(game, A)).toBe(19);
    lands(game, "Mountain", 2);
    activate(game, eel, 0);
    expect(pt(game, eel)).toEqual({ power: 3, toughness: 1 });
    expect(life(game, A)).toBe(18);
  });
});

describe("Scarwood Hag", () => {
  it("makes a creature lose printed forestwalk until end of turn", () => {
    const { game } = table();
    const hag = spawn(game, "Scarwood Hag");
    const dryads = spawn(game, "Shanodin Dryads", B);
    expect(keywords(game, dryads).has("forestwalk")).toBe(true);
    activate(game, hag, 1, { targets: [ref(dryads)] });
    expect(keywords(game, dryads).has("forestwalk")).toBe(false);
  });
});

describe("Holy Light", () => {
  it("shrinks nonwhite creatures only", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const lions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Holy Light"));
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Dust to Dust", () => {
  it("exiles two different target artifacts", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Dust to Dust"), { targets: [ref(ring), ref(stone)] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, stone)).toBe("exile");
  });
});

describe("Merfolk Assassin", () => {
  it("can target only a creature with islandwalk", () => {
    const { game } = table();
    const assassin = spawn(game, "Merfolk Assassin");
    const bears = spawn(game, "Grizzly Bears", B);
    const pale = spawn(game, "Pale Bears", B);
    expect(() => activate(game, assassin, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, assassin, 0, { targets: [ref(pale)] });
    expect(zone(game, pale)).toBe("graveyard");
  });
});

describe("Hidden Path", () => {
  it("gives every green creature forestwalk, an opponent's too", () => {
    const { game } = table();
    spawn(game, "Hidden Path");
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    expect(keywords(game, bears).has("forestwalk")).toBe(true);
    expect(keywords(game, lions).has("forestwalk")).toBe(false);
  });
});
