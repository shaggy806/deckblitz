/**
 * Removing counters in bulk: `remove-counter` with `amount: "all"` — every
 * counter of one kind, or with `counter: "any"` every kind, off one
 * permanent (Vampire Hexmage, Blitz Leech, Enchanted River's Grasp) — and
 * `remove-counter-all`, the same off every permanent matching a filter
 * (Oblivion Stone's fate counters, Aether Snap's everything, Pestilent
 * Haze's two loyalty counters). What came off is the resolution's `thisWay:
 * "counters-removed"`, a token stack's counted token by token. Counters are
 * markers (rule 122.1); one that's removed is a `counter-removed`, unlike a
 * card leaving, whose counters just cease to exist (rule 122.2).
 */

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, lands, life, named, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

const give = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};
const allCounters = (game: Game, id: ObjectId): Record<string, number> => ({ ...game.state.objects[id].counters });

/** Gain a life for each counter removed this way, after `effect`. */
const countingRemoved = (effect: EffectSpec): EffectSpec => ({
  kind: "sequence",
  effects: [effect, { kind: "gain-life", amount: { thisWay: "counters-removed" } }],
});

describe("remove-counter, all of them", () => {
  it("Vampire Hexmage: every counter of every kind off the target — Dark Depths loses its ice and makes Marit Lage", () => {
    const { game } = table();
    const hexmage = spawn(game, "Vampire Hexmage");
    const depths = spawn(game, "Dark Depths");
    give(game, depths, { ice: 10 });
    activate(game, hexmage, 0, { targets: [ref(depths)] });
    expect(zone(game, hexmage)).toBe("graveyard");
    expect(zone(game, depths)).toBe("graveyard");
    expect(named(game, "Marit Lage Token", A)).toHaveLength(1);
  });

  it("Vampire Hexmage: a planeswalker with no loyalty left dies (rule 704.5i), and a creature keeps nothing", () => {
    const { game } = table();
    const hexmage = spawn(game, "Vampire Hexmage");
    const liliana = spawn(game, "Liliana of the Veil", B);
    give(game, liliana, { loyalty: 5 });
    activate(game, hexmage, 0, { targets: [ref(liliana)] });
    expect(zone(game, liliana)).toBe("graveyard");

    const second = spawn(game, "Vampire Hexmage");
    const bears = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 2, stun: 1 });
    activate(game, second, 0, { targets: [ref(bears)] });
    expect(allCounters(game, bears)).toEqual({});
  });

  it("counts what came off this way, every kind; one kind's 'all' leaves the others", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 2, stun: 1 });
    const before = life(game, A);
    game.debugApplyEffect(A, countingRemoved({ kind: "remove-counter", target: 0, counter: "any", amount: "all" }), [ref(bears)]);
    expect(allCounters(game, bears)).toEqual({});
    expect(life(game, A)).toBe(before + 3);

    const other = spawn(game, "Grizzly Bears", B);
    give(game, other, { "+1/+1": 3, stun: 2 });
    game.debugApplyEffect(A, countingRemoved({ kind: "remove-counter", target: 0, counter: "+1/+1", amount: "all" }), [ref(other)]);
    expect(allCounters(game, other)).toEqual({ stun: 2 });
    expect(life(game, A)).toBe(before + 6);
  });

  it("'any' with a number removes nothing (which kind would be a choice — `remove-counters`)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 2 });
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "any", amount: 1 }, [ref(bears)]);
    expect(counters(game, bears)).toBe(2);
  });

  it("one token of a stack loses them, not the rest", () => {
    const { game } = table();
    const stack = spawn(game, "4/4 Blue Red Elemental Token", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 3;
    give(game, stack, { "+1/+1": 2 });
    const before = life(game, A);
    game.debugApplyEffect(A, countingRemoved({ kind: "remove-counter", target: 0, counter: "any", amount: "all" }), [ref(stack)]);
    expect(life(game, A)).toBe(before + 2);
    const tokens = named(game, "4/4 Blue Red Elemental Token", B);
    const withCounters = tokens.reduce((n, id) => n + (counters(game, id) > 0 ? (game.state.objects[id].stackCount ?? 1) : 0), 0);
    expect(withCounters).toBe(2);
  });

  it("Blitz Leech: -2/-2, then every counter off that creature — its +1/+1 counters no longer save it", () => {
    const { game, a } = table();
    const big = spawn(game, "Grizzly Bears", B);
    give(game, big, { "+1/+1": 2 });
    pickTargets(a, big);
    enter(game, "Blitz Leech");
    expect(zone(game, big)).toBe("graveyard");
  });

  it("Enchanted River's Grasp: taps the creature it enchants and takes every counter off it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 3, shield: 1 });
    const grasp = toHand(game, "Enchanted River's Grasp");
    pickTargets(a, bears);
    cast(game, grasp, { targets: [ref(bears)] });
    settle(game);
    expect(game.state.objects[grasp].attachedTo).toBe(bears);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(allCounters(game, bears)).toEqual({});
  });
});

describe("remove-counter-all, from every permanent matching", () => {
  it("Oblivion Stone: destroys each nonland permanent without a fate counter, then every fate counter comes off", () => {
    const { game } = table();
    const stone = spawn(game, "Oblivion Stone");
    lands(game, "Wastes", 5);
    const kept = spawn(game, "Grizzly Bears", A);
    const lost = spawn(game, "Grizzly Bears", B);
    const marked = spawn(game, "Grizzly Bears", B);
    const [land] = lands(game, "Island", 1, B);
    give(game, kept, { fate: 1, "+1/+1": 1 });
    give(game, marked, { fate: 2 });
    give(game, land, { fate: 1 });
    activate(game, stone, 1);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, lost)).toBe("graveyard");
    expect(allCounters(game, kept)).toEqual({ "+1/+1": 1 });
    expect(allCounters(game, marked)).toEqual({});
    expect(allCounters(game, land)).toEqual({});
  });

  it("Oblivion Stone: its first ability puts a fate counter on target permanent", () => {
    const { game } = table();
    const stone = spawn(game, "Oblivion Stone");
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, stone, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "fate")).toBe(1);
  });

  it("Aether Snap: every counter of every kind off every permanent, then every token exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const liliana = spawn(game, "Liliana of the Veil", B);
    give(game, liliana, { loyalty: 4 });
    const shrunk = spawn(game, "Grizzly Bears", A);
    give(game, shrunk, { "-1/-1": 1 });
    const grown = spawn(game, "Grizzly Bears", B);
    give(game, grown, { "+1/+1": 2 });
    const token = spawn(game, "4/4 Blue Red Elemental Token", B);
    game.state.objects[token].isToken = true;
    const snap = toHand(game, "Aether Snap");
    cast(game, snap);
    expect(zone(game, liliana)).toBe("graveyard");
    expect(allCounters(game, shrunk)).toEqual({});
    expect(allCounters(game, grown)).toEqual({});
    expect(named(game, "4/4 Blue Red Elemental Token", B)).toHaveLength(0);
    expect(zone(game, snap)).toBe("graveyard");
  });

  it("Pestilent Haze: two loyalty counters off each planeswalker — as many as one with fewer has", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const liliana = spawn(game, "Liliana of the Veil", B);
    give(game, liliana, { loyalty: 5 });
    const garruk = spawn(game, "Garruk Wildspeaker", A);
    give(game, garruk, { loyalty: 1 });
    const bears = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 2 });
    cast(game, toHand(game, "Pestilent Haze"), { modes: [1] });
    expect(counters(game, liliana, "loyalty")).toBe(3);
    expect(zone(game, garruk)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
  });

  it("a token stack loses them together, counted token by token this way; the filter is read before any come off", () => {
    const { game } = table();
    const stack = spawn(game, "4/4 Blue Red Elemental Token", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 3;
    give(game, stack, { "+1/+1": 2 });
    const bears = spawn(game, "Grizzly Bears", A);
    give(game, bears, { "+1/+1": 1 });
    const bare = spawn(game, "Grizzly Bears", A);
    const before = life(game, A);
    game.debugApplyEffect(
      A,
      countingRemoved({
        kind: "remove-counter-all",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: "all",
      }),
    );
    expect(life(game, A)).toBe(before + 7);
    expect(game.state.objects[stack].stackCount).toBe(3);
    expect(allCounters(game, stack)).toEqual({});
    expect(allCounters(game, bears)).toEqual({});
    expect(allCounters(game, bare)).toEqual({});
  });
});
