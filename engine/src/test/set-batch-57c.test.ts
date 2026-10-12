/**
 * The set walk, batch 57, part c (2026-10-11): Marvel Super Heroes.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  named,
  subtypes,
  types,
  pt,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, abilityIndex: number): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === abilityIndex);

/** Answer each choose-modes decision in turn from `answers`. */
const answerModes = (seat: ScriptedController, ...answers: readonly (readonly number[])[]): void => {
  let asked = 0;
  seat.chooseModesFn = () => [...(answers[asked++] ?? [])];
};

describe("Gleaming Bastion (and Hidden Lair, Gathering Place, Training Compound)", () => {
  it("makes {W} or {U} only the turn it entered, or with a basic land", () => {
    const { game } = table();
    const bastion = spawn(game, "Gleaming Bastion");
    expect(canActivate(game, bastion, 1)).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(canActivate(game, bastion, 0)).toBe(true);
    expect(canActivate(game, bastion, 1)).toBe(false);
    // A nonbasic land doesn't count.
    spawn(game, "Hidden Lair");
    expect(canActivate(game, bastion, 1)).toBe(false);
    spawn(game, "Plains");
    expect(canActivate(game, bastion, 1)).toBe(true);
  });
});

describe("Avengers Tower", () => {
  it("{4}, {T}: offers only a Hero among the top three, the rest to the bottom", () => {
    const { game, a } = table();
    const tower = spawn(game, "Avengers Tower");
    lands(game, "Wastes", 4);
    const deep = toLibrary(game, "The Vision"); // fourth from the top: not looked at
    const vision = toLibrary(game, "The Vision");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    // A second Vision deeper down is out of reach; the first is third from the top.
    const offers: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      // The Hero, then the order of the two left for the bottom.
      return offers.length === 1 ? [vision] : eligible;
    };
    activate(game, tower, 2);
    expect(offers[0]).toEqual([vision]);
    expect(zone(game, vision)).toBe("hand");
    expect(zone(game, deep)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(deep);
  });
});

describe("Villainous Hideout", () => {
  it("{3}, {T}: only a Villain you control can be the target, and it connives", () => {
    const { game, a } = table();
    const hideout = spawn(game, "Villainous Hideout");
    lands(game, "Wastes", 3);
    const doombot = spawn(game, "Doombot");
    spawn(game, "Grizzly Bears");
    spawn(game, "Doombot", B);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === hideout && x.abilityIndex === 2);
    expect(offer?.kind === "activate-ability" ? offer.targetOptions[0] : []).toEqual([ref(doombot)]);
    const before = hand(game).length;
    activate(game, hideout, 2, { targets: [ref(doombot)] });
    expect(hand(game).length).toBe(before);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, doombot)).toBe(1);
  });
});

describe("Baxter Building", () => {
  it("draws only while you control a creature with toughness 4 or greater", () => {
    const { game } = table();
    const baxter = spawn(game, "Baxter Building");
    lands(game, "Wastes", 4);
    spawn(game, "Hill Giant"); // 3/3
    expect(canActivate(game, baxter, 2)).toBe(false);
    spawn(game, "The Vision"); // 2/5: toughness, not power
    expect(canActivate(game, baxter, 2)).toBe(true);
    const before = hand(game).length;
    activate(game, baxter, 2);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Castle Doom", () => {
  it("sacrifices an artifact to make a 3/3 Robot Villain artifact creature named Doombot", () => {
    const { game } = table();
    const castle = spawn(game, "Castle Doom");
    lands(game, "Wastes", 3);
    const ring = spawn(game, "Sol Ring");
    game.dispatch({ type: "activate-ability", player: A, source: castle, abilityIndex: 2, targets: [], sacrifice: ring });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Doombot", A)).toBe(1);
    const bot = named(game, "Doombot", A)[0];
    expect(pt(game, bot)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, bot)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, bot)).toEqual(expect.arrayContaining(["Robot", "Villain"]));
  });
});

describe("The Vision", () => {
  it("each noncreature spell picks a mode not yet chosen this turn", () => {
    const { game, a } = table();
    const vision = spawn(game, "The Vision");
    lands(game, "Mountain", 2);
    // Always the first mode offered: Solar Beam, then (Solar Beam gone) Density Control.
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, vision).has("double-strike")).toBe(true);
    expect(keywords(game, vision).has("indestructible")).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, vision).has("indestructible")).toBe(true);
  });
});

describe("Jennifer Walters // The Sensational She-Hulk", () => {
  it("transforms; She-Hulk deals the damage a creature of yours was dealt, once each turn", () => {
    const { game, a } = table();
    const jen = spawn(game, "Jennifer Walters");
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    lands(game, "Wastes", 3);
    activate(game, jen, 0);
    expect(game.state.objects[jen].face).toBe(1);
    expect(game.characteristics(jen).power).toBe(6);

    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, B);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)], { source: giant });
    settle(game);
    expect(life(game, B)).toBe(19);
    // Only once each turn.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(jen)], { source: giant });
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("a declined offer doesn't use up the turn's one", () => {
    const { game, a } = table();
    const jen = spawn(game, "Jennifer Walters");
    game.state.objects[jen].face = 1;
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, B);
    answerModes(a, [], [0]);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)], { source: giant });
    settle(game);
    expect(life(game, B)).toBe(20);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(jen)], { source: giant });
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Vision of Love", () => {
  it("discarding a card draws two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Vision of Love");
    answerModes(a, [0], [1]);
    const before = hand(game).length;
    cast(game, spell);
    // Cast it (-1), discarded one (-1), drew two (+2).
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(2);
  });

  it("sacrificing an artifact draws two; choosing to sacrifice with none draws nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const ring = spawn(game, "Sol Ring");
    answerModes(a, [0], [0]);
    const before = hand(game).length;
    cast(game, toHand(game, "Vision of Love"));
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);

    answerModes(a, [0], [0]);
    const again = hand(game).length;
    cast(game, toHand(game, "Vision of Love"));
    expect(hand(game).length).toBe(again);
  });
});
