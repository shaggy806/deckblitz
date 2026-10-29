/**
 * Batch B253, group C: cards freed by granted statics, "can't be blocked by
 * [X] this turn", rule 305.7 land-type setting, the basic land type of your
 * choice, and exchange of control.
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
} from "./harness.js";

const colors = (game: Game, id: ObjectId) => intrinsicManaColors(game.state, game.registry, game.state.objects[id]);
const abilityTexts = (game: Game, id: ObjectId): string[] =>
  game.legalActions(A).flatMap((action) => (action.kind === "activate-ability" && action.source === id ? [action.text] : []));
const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Spreading Seas", () => {
  it("draws a card, and the enchanted land is an Island with none of its own abilities (305.7)", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const wilds = spawn(game, "Evolving Wilds", A);
    expect(abilityTexts(game, wilds).some((t) => /Sacrifice/.test(t))).toBe(true);
    const seas = toHand(game, "Spreading Seas");
    const before = hand(game).length;
    cast(game, seas, { targets: [ref(wilds)] });
    expect(hand(game).length).toBe(before); // the Aura left, a card came in
    expect(subtypes(game, wilds)).toEqual(["Island"]);
    expect(colors(game, wilds)).toEqual(["U"]);
    expect(abilityTexts(game, wilds).some((t) => /Sacrifice/.test(t))).toBe(false);
  });
});

describe("Phantasmal Terrain", () => {
  it("the land becomes the type chosen as it enters, and only that", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const coast = spawn(game, "Yavimaya Coast", A);
    a.chooseCreatureTypeFn = () => "Swamp";
    cast(game, toHand(game, "Phantasmal Terrain"), { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
    expect(abilityTexts(game, coast)).toHaveLength(1);
  });
});

describe("Navigator's Compass", () => {
  it("gains 3 life; the land gains the chosen type in addition, keeping its abilities, until end of turn", () => {
    const { game, a } = table();
    const compass = enter(game, "Navigator's Compass");
    expect(life(game)).toBe(23);
    const coast = spawn(game, "Yavimaya Coast", A);
    const own = abilityTexts(game, coast).length;
    a.chooseCreatureTypeFn = () => "Swamp";
    activate(game, compass, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(abilityTexts(game, coast).length).toBe(own + 1);
    nextTurn(game);
    expect(subtypes(game, coast)).toEqual([]);
  });
});

describe("Deepwood Elder", () => {
  it("X target lands become Forests until end of turn, for a discard", () => {
    const { game } = table();
    const elder = spawn(game, "Deepwood Elder", A);
    lands(game, "Forest", 4);
    const [w1, w2] = lands(game, "Evolving Wilds", 2, B);
    const before = hand(game).length;
    activate(game, elder, 0, { x: 2, targets: [ref(w1), ref(w2)] });
    expect(hand(game).length).toBe(before - 1);
    expect(subtypes(game, w1)).toEqual(["Forest"]);
    expect(subtypes(game, w2)).toEqual(["Forest"]);
    expect(colors(game, w1)).toEqual(["G"]);
    nextTurn(game);
    expect(subtypes(game, w1)).toEqual([]);
  });
});

describe("Doorman", () => {
  it("power 2 or less, or a Wall of any power, can't block the target this turn", () => {
    const { game, a } = table();
    const doorman = spawn(game, "Doorman", A);
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Air", B);
    const theirGiant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(wall)]);
    settle(game);
    activate(game, doorman, 0, { targets: [ref(giant)] });
    const offer = blockOffer(game, a, [giant]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, wall)).toEqual([]);
    expect(canBlock(offer, theirGiant)).toEqual([giant]);
  });
});

describe("Sabertooth Alley Cat", () => {
  it("only creatures with defender can block it this turn", () => {
    const { game, a } = table();
    const cat = spawn(game, "Sabertooth Alley Cat", A);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Air", B);
    activate(game, cat, 0);
    const offer = blockOffer(game, a, [cat]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, wall)).toEqual([cat]);
  });
});

describe("exchange of control", () => {
  it("Avarice Totem trades itself for the target", () => {
    const { game } = table();
    const totem = spawn(game, "Avarice Totem", A);
    lands(game, "Wastes", 5);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, totem, 0, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, totem)).toBe(B);
  });

  it("Conjured Currency trades itself at your upkeep if you choose to", () => {
    const { game, a } = table();
    const currency = spawn(game, "Conjured Currency", A);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, currency)).toBe(B);
  });
});
