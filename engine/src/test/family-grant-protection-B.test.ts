/**
 * Group B of the cards the grant-protection family freed: the target's
 * controller choosing the colour (Wishmonger, Pale Wayfarer), a graveyard
 * activation over a filter (Glory), protection from a creature filter (Spare
 * from Evil), a threshold-granted enters trigger (Teroh's Vanguard), "until
 * your next turn" off a transform (Sygg), and a rider on the target's type
 * (Angelic Intervention).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, keywords, lands, nextTurn, pickModes, pickTargets, ref, registryOf, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const protectedFrom = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors].sort();
/** `source` deals 2 damage to `target`. */
const ping = (game: Game, source: ObjectId, target: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, target: 0 }, [ref(target)], {
    source,
  });

describe("the colour of its controller's choice", () => {
  it("Wishmonger: alice activates at bob's creature, and bob picks the colour", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 2);
    const monger = spawn(game, "Wishmonger");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => {
      throw new Error("alice was asked");
    };
    let offered: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [3];
    };
    activate(game, monger, 0, { targets: [ref(bears)] });
    expect(offered).toEqual(["White", "Blue", "Black", "Red", "Green"]);
    expect(protectedFrom(game, bears)).toEqual(["R"]);
    nextTurn(game);
    expect(protectedFrom(game, bears)).toEqual([]);
  });

  it("Pale Wayfarer: its own controller picks for its own creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const wayfarer = spawn(game, "Pale Wayfarer", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    activate(game, wayfarer, 0, { targets: [ref(bears)] });
    expect(game.state.objects[wayfarer].tapped).toBe(false);
    expect(protectedFrom(game, bears)).toEqual(["B"]);
  });
});

describe("over a filter", () => {
  it("Glory activates from the graveyard, stays there, and covers only your creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const glory = toGraveyard(game, "Glory");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 3);
    activate(game, glory, 0);
    expect(zone(game, glory)).toBe("graveyard");
    expect(protectedFrom(game, bears)).toEqual(["R"]);
    expect(protectedFrom(game, theirs)).toEqual([]);
  });

  it("Spare from Evil stops a non-Human creature's damage but not a Human's", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const human = spawn(game, "Benevolent Bodyguard", B);
    cast(game, toHand(game, "Spare from Evil"));
    ping(game, goblin, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    ping(game, human, bears);
    expect(game.state.objects[bears].damageMarked).toBe(2);
  });

  it("Teroh's Vanguard protects your creatures from black only with threshold", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Teroh's Vanguard");
    expect(protectedFrom(game, bears)).toEqual([]);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    const vanguard = enter(game, "Teroh's Vanguard");
    expect(protectedFrom(game, bears)).toEqual(["B"]);
    expect(protectedFrom(game, vanguard)).toEqual(["B"]);
  });
});

describe("the rest", () => {
  it("Angelic Intervention: colorless first, and a +1/+1 counter on a creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [0];
    };
    cast(game, toHand(game, "Angelic Intervention"), { targets: [ref(bears)] });
    expect(offered[0]).toBe("Protection from colorless");
    expect(counters(game, bears)).toBe(1);
    const thopter = spawn(game, "Ornithopter", B);
    ping(game, thopter, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("Sygg, Wanderbrine Shield: protection from each colour until alice's next turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sygg = spawn(game, "Sygg, Wanderwine Wisdom");
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(sygg)]);
    settle(game);
    expect(game.state.objects[sygg].face ?? 0).toBe(1);
    expect(protectedFrom(game, bears)).toEqual(["B", "G", "R", "U", "W"]);
    nextTurn(game);
    expect(protectedFrom(game, bears)).toEqual(["B", "G", "R", "U", "W"]);
    nextTurn(game);
    expect(protectedFrom(game, bears)).toEqual([]);
  });

  it("Grotesque Hybrid gains flying and protection from green and from white", () => {
    const { game } = table();
    const hybrid = spawn(game, "Grotesque Hybrid");
    toHand(game, "Wastes");
    activate(game, hybrid, 0);
    expect(keywords(game, hybrid).has("flying")).toBe(true);
    expect(protectedFrom(game, hybrid)).toEqual(["G", "W"]);
  });
});
