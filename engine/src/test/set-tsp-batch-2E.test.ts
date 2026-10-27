/**
 * Time Spiral (TSP; B228) — group E.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  C,
  activate,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("Ghostflame Sliver", () => {
  it("makes every Sliver colorless, anyone's, and nothing else", () => {
    const { game } = table();
    const ghost = spawn(game, "Ghostflame Sliver");
    const theirs = spawn(game, "Plague Sliver", B);
    const bears = spawn(game, "Grizzly Bears");
    const colors = (id: string) => [...computeCharacteristics(game.state, registryOf(game), id as never).colors];
    expect(colors(ghost)).toEqual([]);
    expect(colors(theirs)).toEqual([]);
    expect(colors(bears)).toEqual(["G"]);
  });
});

describe("Plague Sliver", () => {
  it("each Sliver deals 1 damage to its own controller in their upkeep", () => {
    const { game } = table();
    spawn(game, "Plague Sliver");
    spawn(game, "Ghostflame Sliver", B);
    nextTurn(game); // bob's turn: his Sliver hits him
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    nextTurn(game); // alice's turn: hers hits her
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Weatherseed Totem", () => {
  it("returns to hand if it was a creature as it went to the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const totem = spawn(game, "Weatherseed Totem");
    activate(game, totem, 1);
    expect(pt(game, totem)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, totem).has("trample")).toBe(true);
    destroy(game, totem);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Weatherseed Totem")).toBe(true);
  });

  it("stays in the graveyard if it wasn't a creature", () => {
    const { game } = table();
    const totem = spawn(game, "Weatherseed Totem");
    destroy(game, totem);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Weatherseed Totem")).toBe(true);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Weatherseed Totem")).toBe(false);
  });
});

describe("Sarpadian Empires, Vol. VII", () => {
  it("makes the token it chose as it entered", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const book = toHand(game, "Sarpadian Empires, Vol. VII");
    game.dispatch({ type: "cast-spell", player: A, card: book, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-creature-type");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "black Thrull" });
    settle(game);
    expect(game.state.objects[book].chosenOnEnter).toBe("black Thrull");
    activate(game, book, 0);
    expect(tokensNamed(game, "1/1 Thrull Token", A)).toBe(1);
    expect(tokensNamed(game, "White Citizen Token", A)).toBe(0);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(0);
    const thrull = game.battlefield.find((id) => game.state.objects[id].cardName === "1/1 Thrull Token");
    expect(pt(game, thrull!)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Faceless Devourer", () => {
  it("exiles only another creature with shadow, and returns it when it leaves", () => {
    const { game, a } = table();
    const slayer = spawn(game, "Dauthi Slayer", B);
    const horror = spawn(game, "Dauthi Horror", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [slayer]);
    const devourer = enter(game, "Faceless Devourer");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(slayer);
    expect(seen.offered[0]).toContain(horror);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(devourer);
    expect(zone(game, slayer)).toBe("exile");
    destroy(game, devourer);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Dauthi Slayer")).toBe(true);
  });
});

describe("Urborg Syphon-Mage", () => {
  it("drains each other player for 2 after a discard", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const mage = spawn(game, "Urborg Syphon-Mage");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: mage, abilityIndex: 0, targets: [] });
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(24);
  });
});

describe("Goblin Skycutter", () => {
  it("sacrifices to deal 2 to a flier, which loses flying", () => {
    const { game } = table();
    const skycutter = spawn(game, "Goblin Skycutter");
    const angel = spawn(game, "Serra Angel", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: skycutter,
      abilityIndex: 0,
      targets: [ref(angel)],
      sacrifice: skycutter,
    });
    settle(game);
    expect(zone(game, skycutter)).toBe("graveyard");
    expect(game.state.objects[angel].damageMarked).toBe(2);
    expect(keywords(game, angel).has("flying")).toBe(false);
  });
});

describe("Firemaw Kavu", () => {
  it("deals 4 damage to a target creature when it leaves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Craw Wurm", B);
    pickTargets(a, giant);
    const kavu = enter(game, "Firemaw Kavu");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    destroy(game, kavu);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
