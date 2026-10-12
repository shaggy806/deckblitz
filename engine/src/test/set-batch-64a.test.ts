/**
 * The set walk, batch 64, part a (2026-10-12): Lorwyn Eclipsed's last cards.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { activePlayerOf, faceName } from "../state.js";
import { hasSubtype } from "../subtypes.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Alice's priority on bob's turn, the stack empty. */
const toOpponentsTurn = (game: Game): void =>
  game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A && s.zones.shared.stack.length === 0);

describe("Nightmare Sower", () => {
  it("puts a -1/-1 counter on up to one target creature only for a spell cast on an opponent's turn", () => {
    const { game, a } = table();
    spawn(game, "Nightmare Sower");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    pickTargets(a, bear);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, bear, "-1/-1")).toBe(0);
    toOpponentsTurn(game);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, bear, "-1/-1")).toBe(1);
    // "Up to one": declining leaves everything alone.
    pickTargets(a, null);
    toOpponentsTurn(game);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, bear, "-1/-1")).toBe(1);
  });
});

describe("Glamermite", () => {
  it("untaps target creature with its second mode", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickModes(a, 1);
    pickTargets(a, bear);
    enter(game, "Glamermite");
    expect(game.state.objects[bear].tapped).toBe(false);
  });
});

describe("Oko, Lorwyn Liege", () => {
  it("+2 gives up to one target creature every creature type, for good — past Oko leaving and the turn ending", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, Lorwyn Liege");
    game.state.objects[oko].counters.loyalty = 3;
    const bear = spawn(game, "Grizzly Bears", B);
    expect(hasSubtype(subtypes(game, bear), "Elf")).toBe(false);
    loyalty(game, oko, 2, { targets: [ref(bear)] });
    expect(game.state.objects[oko].counters.loyalty).toBe(5);
    expect(hasSubtype(subtypes(game, bear), "Elf")).toBe(true);
    expect(hasSubtype(subtypes(game, bear), "Bear")).toBe(true);
    destroy(game, oko);
    nextTurn(game);
    expect(hasSubtype(subtypes(game, bear), "Faerie")).toBe(true);
  });

  it("+1 gives -2/-0 until your next turn", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, Lorwyn Liege");
    game.state.objects[oko].counters.loyalty = 3;
    const giant = spawn(game, "Hill Giant", B);
    loyalty(game, oko, 1, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("pays {G} in your first main phase to transform, and {U} to transform back", () => {
    const { game, a } = table({ step: "upkeep" });
    const oko = spawn(game, "Oko, Lorwyn Liege");
    game.state.objects[oko].counters.loyalty = 3;
    lands(game, "Forest", 1);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(faceName(game.state.objects[oko])).toBe("Oko, Shadowmoor Scion");
    expect(game.state.objects[oko].counters.loyalty).toBe(3);
    // Next turn only blue transforms it back: a Forest alone can't pay {U}.
    toStep(game, "precombat-main");
    settle(game);
    expect(faceName(game.state.objects[oko])).toBe("Oko, Shadowmoor Scion");
    lands(game, "Island", 1);
    toStep(game, "precombat-main");
    settle(game);
    expect(faceName(game.state.objects[oko])).toBe("Oko, Lorwyn Liege");
  });
});

describe("Oko, Shadowmoor Scion", () => {
  const scion = (game: Game, loyaltyCounters: number) => {
    const oko = spawn(game, "Oko, Lorwyn Liege");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(oko)]);
    settle(game);
    game.state.objects[oko].counters.loyalty = loyaltyCounters;
    expect(faceName(game.state.objects[oko])).toBe("Oko, Shadowmoor Scion");
    return oko;
  };

  it("−1 mills three and may put a permanent card from among them into your hand", () => {
    const { game, a } = table();
    const oko = scion(game, 3);
    const milled = [toLibrary(game, "Lightning Bolt"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Opt")];
    const seen = pickFromZone(a, milled[1]);
    activate(game, oko, 0);
    expect(seen.offered).toEqual([milled[1]]);
    expect(zone(game, milled[1])).toBe("hand");
    expect(graveyard(game)).toEqual(expect.arrayContaining([milled[0], milled[2]]));
    expect(game.state.objects[oko].counters.loyalty).toBe(2);
  });

  it("−3 makes two 3/3 green Elks — even as its last loyalty, Oko dying face up again before it resolves", () => {
    const { game } = table();
    const oko = scion(game, 3);
    activate(game, oko, 1);
    expect(tokensNamed(game, "Elk Token")).toBe(2);
    const [elk] = named(game, "Elk Token");
    expect([...game.characteristics(elk).colors]).toEqual(["G"]);
    expect(pt(game, elk)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, oko)).toBe("graveyard");
  });

  it("−6's emblem pumps only your creatures of the chosen type, with vigilance and hexproof", () => {
    const { game, a } = table();
    const oko = scion(game, 6);
    const elf = spawn(game, "Llanowar Elves");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Llanowar Elves", B);
    a.chooseCreatureTypeFn = () => "Elf";
    activate(game, oko, 2);
    expect(game.state.emblems).toHaveLength(1);
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, elf).has("vigilance")).toBe(true);
    expect(keywords(game, elf).has("hexproof")).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bear).has("hexproof")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    // An Elf that arrives later gets it too.
    const later = spawn(game, "Llanowar Elves");
    expect(pt(game, later)).toEqual({ power: 4, toughness: 4 });
  });
});
