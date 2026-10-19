/**
 * The Brothers' War Commander (BRC), set batch 1 (2026-10-19).
 * Written from the Oracle text on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sardian Avenger", () => {
  it("attacks with +X/+0 for the artifacts its controller's opponents control", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Sardian Avenger");
    spawn(game, "Memnite");
    spawn(game, "Ornithopter", B);
    spawn(game, "Memnite", B);
    attack(game, a, [avenger]);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 1 });
    expect(life(game, B)).toBe(17);
    toStep(game, "upkeep", B);
    expect(pt(game, avenger)).toEqual({ power: 1, toughness: 1 });
  });

  it("deals 1 damage to an opponent whose artifact goes to the graveyard, not for its controller's own", () => {
    const { game } = table();
    spawn(game, "Sardian Avenger");
    const theirs = spawn(game, "Memnite", B);
    const mine = spawn(game, "Memnite");
    destroy(game, theirs);
    expect(life(game, B)).toBe(19);
    destroy(game, mine);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
  });
});

describe("Thopter Shop", () => {
  it("makes a 1/1 flying Thopter", () => {
    const { game } = table();
    const shop = spawn(game, "Thopter Shop");
    lands(game, "Plains", 3);
    activate(game, shop);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    const thopter = named(game, "Thopter Token", A)[0];
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, thopter).has("flying")).toBe(true);
  });

  it("draws once each turn when artifact creatures you control die, not for other creatures", () => {
    const { game } = table();
    spawn(game, "Thopter Shop");
    const bears = spawn(game, "Grizzly Bears");
    const first = spawn(game, "Memnite");
    const second = spawn(game, "Ornithopter");
    const start = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(start);
    destroy(game, first);
    expect(hand(game).length).toBe(start + 1);
    destroy(game, second);
    expect(hand(game).length).toBe(start + 1);
  });
});

describe("Terisiare's Devastation", () => {
  it("costs X life, makes X tapped Powerstones, then shrinks every creature by the artifacts you control", () => {
    const { game } = table();
    spawn(game, "Ornithopter");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Terisiare's Devastation"), { x: 2 });
    expect(life(game, A)).toBe(18);
    const stones = named(game, "Powerstone Token", A);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
    for (const stone of stones) expect(game.state.objects[stone].tapped).toBe(true);
    // The Ornithopter and two Powerstones: -3/-3.
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("The Archimandrite", () => {
  it("gains life at upkeep for cards in hand past four, which pumps your Advisors, Artificers and Monks", () => {
    const { game } = table();
    const arch = spawn(game, "The Archimandrite");
    const sculptor = spawn(game, "Etherium Sculptor");
    const pilgrim = spawn(game, "Avacyn's Pilgrim");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    for (let i = 0; i < 6; i++) toHand(game, "Wastes");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(22);
    expect(pt(game, arch)).toEqual({ power: 2, toughness: 5 });
    expect(pt(game, sculptor)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, pilgrim)).toEqual({ power: 3, toughness: 1 });
    for (const id of [arch, sculptor, pilgrim]) expect(keywords(game, id).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });

  it("gains no life, and so pumps nothing, with four or fewer cards in hand", () => {
    const { game } = table();
    const arch = spawn(game, "The Archimandrite");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    for (let i = 0; i < 3; i++) toHand(game, "Wastes");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(pt(game, arch)).toEqual({ power: 0, toughness: 5 });
  });

  it("taps three Advisors, Artificers and/or Monks — itself and summoning-sick ones included — to draw", () => {
    const { game } = table();
    const arch = spawn(game, "The Archimandrite", A, { sick: true });
    const sculptor = spawn(game, "Etherium Sculptor", A, { sick: true });
    const pilgrim = spawn(game, "Avacyn's Pilgrim");
    spawn(game, "Grizzly Bears");
    const start = hand(game).length;
    activate(game, arch);
    expect(hand(game).length).toBe(start + 1);
    for (const id of [arch, sculptor, pilgrim]) expect(game.state.objects[id].tapped).toBe(true);
    expect(() => activate(game, arch)).toThrow(/refused/);
  });
});
