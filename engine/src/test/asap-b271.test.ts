// B271: the cards flagged "Build ASAP" that wait on a mill (rule 701.17) —
// Mirelurk Queen and The Wise Mothman's "whenever one or more nonland cards
// are milled" (the `mills` trigger), and Tato Farmer's "a land card in a
// graveyard that was milled this turn" (`milledThisTurn`).

import { describe, expect, it } from "vitest";
import {
  A,
  activate,
  B,
  counters,
  hand,
  ref,
  settle,
  spawn,
  table,
  toLibrary,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const mill = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "mill", target: "you", amount }, []);
  settle(game);
};

describe("Mirelurk Queen", () => {
  it("draws and grows once a turn when nonland cards are milled, any player's", () => {
    const { game } = table();
    const queen = spawn(game, "Mirelurk Queen");
    toLibrary(game, "Grizzly Bears", B);
    const before = hand(game).length;
    mill(game, B, 1);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, queen)).toBe(1);
    // Only once each turn.
    toLibrary(game, "Grizzly Bears", B);
    mill(game, B, 1);
    expect(counters(game, queen)).toBe(1);
  });

  it("ignores a mill of only lands, and a surveil", () => {
    const { game, a } = table({ deck: "Forest" });
    const queen = spawn(game, "Mirelurk Queen");
    mill(game, A, 3);
    expect(counters(game, queen)).toBe(0);
    toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => cards;
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 }, []);
    settle(game);
    expect(counters(game, queen)).toBe(0);
  });
});

describe("The Wise Mothman", () => {
  it("targets up to X creatures, X the nonland cards that one mill milled", () => {
    const { game, a } = table({ deck: "Forest" });
    spawn(game, "The Wise Mothman");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    // Top of B's library: two nonland cards over the Forests.
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return bears.slice(0, 2).map(ref);
    };
    mill(game, B, 3);
    expect(max).toBe(2);
    expect(bears.map((id) => counters(game, id))).toEqual([1, 1, 0]);
  });
});

describe("Tato Farmer", () => {
  it("puts a land milled this turn onto the battlefield tapped under your control", () => {
    const { game } = table();
    const farmer = spawn(game, "Tato Farmer");
    const forest = toLibrary(game, "Forest", B);
    mill(game, B, 1);
    activate(game, farmer, 0, { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(A);
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("can't target a land surveilled into a graveyard (the ruling), or one milled last turn", () => {
    const { game, a } = table();
    const farmer = spawn(game, "Tato Farmer");
    const surveilled = toLibrary(game, "Forest");
    a.chooseScryFn = (_view, cards) => cards;
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 }, []);
    settle(game);
    expect(zone(game, surveilled)).toBe("graveyard");
    const offered = (): boolean =>
      game
        .legalActions(A)
        .some((o) => o.kind === "activate-ability" && o.source === farmer);
    // Nothing milled this turn: no legal target, so no activation.
    expect(offered()).toBe(false);
    const milled = toLibrary(game, "Forest", B);
    mill(game, B, 1);
    expect(offered()).toBe(true);
    expect(game.state.objects[milled].milledOnTurn).toBe(game.state.turn.number);
  });
});
