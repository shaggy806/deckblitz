/**
 * Alliances (ALL), group B: Ritual of the Machine, Bestial Fury, Phyrexian
 * War Beast, Insidious Bookworms, Chaos Harlequin and Soldevi Steam Beast —
 * the clause of each most likely to be wrong. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Ritual of the Machine", () => {
  it("sacrifices a creature to steal a nonartifact, nonblack creature for good", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const fodder = spawn(game, "Grizzly Bears", A);
    const target = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Ritual of the Machine"), { targets: [ref(target)], sacrifice: fodder });
    expect(graveyard(game, A)).toContain(fodder);
    expect(controller(game, target)).toBe(A);
  });
});

describe("Bestial Fury", () => {
  it("the enchanted creature gets +4/+0 and trample when it becomes blocked", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", A);
    const fury = toHand(game, "Bestial Fury");
    cast(game, fury, { targets: [ref(giant)] });
    expect(game.state.objects[fury].attachedTo).toBe(giant);
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: giant }];
    attack(game, a, [giant]);
    expect(pt(game, giant)).toEqual({ power: 7, toughness: 3 });
    expect(keywords(game, giant).has("trample")).toBe(true);
    // 7 trample damage, 2 of it lethal to the 2/2 blocker.
    expect(life(game, B)).toBe(15);
    expect(zone(game, blocker)).toBe("graveyard");
  });
});

describe("Phyrexian War Beast", () => {
  it("leaving the battlefield sacrifices a land and deals 1 damage to you", () => {
    const { game } = table();
    const [land] = lands(game, "Wastes", 1);
    const beast = spawn(game, "Phyrexian War Beast", A);
    destroy(game, beast);
    expect(zone(game, land)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
  });
});

describe("Insidious Bookworms", () => {
  it("dying, paying {1}{B} makes the target player discard a card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const worms = spawn(game, "Insidious Bookworms", A);
    const before = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    destroy(game, worms);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Chaos Harlequin", () => {
  it("gets -4/-0 for an exiled land and +2/+0 for an exiled nonland card", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const harlequin = spawn(game, "Chaos Harlequin", A);
    activate(game, harlequin, 0); // the top card is a Wastes
    expect(pt(game, harlequin).power).toBe(-2);
    const bears = toLibrary(game, "Grizzly Bears", A);
    activate(game, harlequin, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(pt(game, harlequin).power).toBe(0);
  });
});

describe("Soldevi Steam Beast", () => {
  it("becoming tapped makes the target opponent gain 2 life", () => {
    const { game, a } = table();
    const beast = spawn(game, "Soldevi Steam Beast", A);
    pickTargets(a, B);
    attack(game, a, [beast]);
    expect(life(game, B)).toBe(20 + 2 - 4);
  });
});
