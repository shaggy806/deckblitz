/**
 * "As this enters" acting on other permanents (rule 614.1c, `AsEntersAction`):
 * Sin, Unending Cataclysm removes every counter from any number of permanents
 * its controller chooses (`removeCounters`), and Ixidron turns every other
 * nontoken creature face down (`turnFaceDown`) — both before it's on the
 * battlefield (rule 614.12), so nothing can respond between.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  lands,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const give = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

const mana = (game: Game): void => {
  for (const land of ["Forest", "Island"]) lands(game, land, 4);
};

describe("Sin, Unending Cataclysm: remove all counters from any number of permanents as it enters", () => {
  it("the chosen ones lose every counter, and it enters with two +1/+1 counters for each", () => {
    const { game, a } = table();
    mana(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const spared = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    give(game, theirs, { "+1/+1": 2, stun: 1 });
    give(game, mine, { "-1/-1": 1 });
    give(game, spared, { "+1/+1": 3 });
    give(game, land, { "+1/+1": 1 });
    const seen = pickPermanents(a, theirs, mine);
    const sin = toHand(game, "Sin, Unending Cataclysm");
    cast(game, sin);
    // Only artifacts, creatures and enchantments with a counter are offered.
    expect(seen.offered).toEqual(expect.arrayContaining([theirs, mine, spared]));
    expect(seen.offered).not.toContain(plain);
    expect(seen.offered).not.toContain(land);
    expect(game.state.objects[theirs].counters).toEqual({});
    expect(game.state.objects[mine].counters).toEqual({});
    expect(counters(game, spared)).toBe(3);
    expect(counters(game, sin)).toBe(8);
    expect(pt(game, sin)).toEqual({ power: 13, toughness: 13 });
  });

  it("choosing none, it enters a 5/5", () => {
    const { game, a } = table();
    mana(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    give(game, theirs, { "+1/+1": 2 });
    pickPermanents(a);
    const sin = toHand(game, "Sin, Unending Cataclysm");
    cast(game, sin);
    expect(counters(game, theirs)).toBe(2);
    expect(counters(game, sin)).toBe(0);
  });

  it("is asked on an entry that wasn't a cast", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    give(game, theirs, { "+1/+1": 1 });
    const sin = toGraveyard(game, "Sin, Unending Cataclysm", A);
    pickFromZone(a, sin);
    pickPermanents(a, theirs);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, sin)).toBe("battlefield");
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, sin)).toBe(2);
  });

  it("dies: its counters go on target creature you control, then it's shuffled into its owner's library", () => {
    const { game, a } = table();
    const sin = spawn(game, "Sin, Unending Cataclysm");
    const bears = spawn(game, "Grizzly Bears");
    give(game, sin, { "+1/+1": 4 });
    pickTargets(a, bears);
    destroy(game, sin);
    expect(counters(game, bears)).toBe(4);
    expect(zone(game, sin)).toBe("library");
  });
});

describe("Ixidron: turn all other nontoken creatures face down as it enters", () => {
  it("everyone's nontoken creatures turn face down; it counts every face-down creature", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    give(game, theirs, { "+1/+1": 1 });
    const ixidron = toHand(game, "Ixidron");
    cast(game, ixidron);
    expect(game.state.objects[mine].faceDown).toBeDefined();
    expect(game.state.objects[theirs].faceDown).toBeDefined();
    // A 2/2 with its counter still on it (rule 708.2a).
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(tokensNamed(game, "Soldier Token", B)).toBe(2);
    const soldier = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token");
    expect(game.state.objects[soldier!].faceDown).toBeUndefined();
    expect(game.state.objects[ixidron].faceDown).toBeUndefined();
    expect(pt(game, ixidron)).toEqual({ power: 2, toughness: 2 });
  });

  it("with nothing to turn, it's a 0/0 and dies", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const ixidron = toHand(game, "Ixidron");
    cast(game, ixidron);
    expect(zone(game, ixidron)).toBe("graveyard");
  });
});
