/**
 * Devour on a token (rule 702.82a): "as this object enters", so a token made with it asks as it is
 * created, the way any permanent entering does. Dragon Broodmother's Dragons are the printed case.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import { A, counters, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const DEVOURER = "Test Devouring Dragon";
const devourer = defineCard({
  name: DEVOURER,
  types: ["creature"],
  subtypes: ["Dragon"],
  colors: ["R", "G"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: "Flying\nDevour 2",
});
const registry = createDefaultRegistry().register(devourer);

const create = (game: Game, count: number): void => {
  game.debugApplyEffect(A, { kind: "create-token", token: DEVOURER, count });
  settle(game);
};
const dragons = (game: Game): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === DEVOURER);

describe("a token with devour (rule 702.82a)", () => {
  it("is asked as it's created, and enters with the counters", () => {
    const { game, a } = table({ registry });
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const kept = spawn(game, "Hill Giant");
    let offered: readonly ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [bears, elves];
    };
    create(game, 1);
    expect(offered).toContain(kept);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, kept)).toBe("battlefield");
    const [dragon] = dragons(game);
    expect(game.state.objects[dragon].isToken).toBe(true);
    expect(counters(game, dragon)).toBe(4);
  });

  it("devouring nothing, it enters with no counters", () => {
    const { game, a } = table({ registry });
    spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [];
    create(game, 1);
    expect(counters(game, dragons(game)[0])).toBe(0);
  });

  it("two made at once each choose, and neither can devour the other: it isn't on the battlefield yet", () => {
    const { game, a } = table({ registry });
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return [offers.length === 1 ? bears : elves];
    };
    create(game, 2);
    expect(offers).toHaveLength(2);
    expect(offers[0]).toEqual([bears, elves]);
    expect(offers[1]).toEqual([elves]);
    const made = dragons(game);
    expect(made).toHaveLength(2);
    expect(made.map((d) => counters(game, d))).toEqual([2, 2]);
  });
});
