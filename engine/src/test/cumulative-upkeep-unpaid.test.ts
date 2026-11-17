/**
 * Cumulative upkeep paid by exiling the top card of your library for each age
 * counter — all of it or none, so not with fewer cards than age counters
 * (rules 702.24a, 118.3) — and "when a player doesn't pay this enchantment's
 * cumulative upkeep" (the `cumulative-upkeep-unpaid` event, announced as the
 * "if you don't" begins, before the sacrifice): Thought Lash.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  activate,
  cast,
  counters,
  lands,
  life,
  pickModes,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const library = (game: Game): number => game.state.zones.perPlayer[A].library.length;

describe("Thought Lash", () => {
  it("cumulative upkeep: the top card of the library exiled for each age counter", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    pickModes(a, 0);
    toStep(game, "upkeep");
    let before = library(game);
    settle(game);
    expect(counters(game, lash, "age")).toBe(1);
    expect(library(game)).toBe(before - 1);
    toStep(game, "upkeep");
    before = library(game);
    settle(game);
    expect(counters(game, lash, "age")).toBe(2);
    expect(library(game)).toBe(before - 2);
    expect(zone(game, lash)).toBe("battlefield");
  });

  it("unpaid: sacrificed, then its controller exiles their whole library", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    pickModes(a);
    toStep(game, "upkeep");
    const exiledBefore = game.state.zones.shared.exile.length;
    const before = library(game);
    settle(game);
    expect(zone(game, lash)).toBe("graveyard");
    expect(library(game)).toBe(0);
    expect(game.state.zones.shared.exile.length).toBe(exiledBefore + before);
  });

  it("with fewer cards than age counters, it can't be paid", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, lash, "age")).toBe(1);
    // One card left as the next upkeep asks for two.
    for (const id of game.state.zones.perPlayer[A].library.slice(1)) game.debugMove(id, "graveyard");
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [0];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(asked.flat().some((t) => /exile the top card/i.test(t))).toBe(false);
    expect(zone(game, lash)).toBe("graveyard");
    expect(library(game)).toBe(0);
  });

  it("another permanent's unpaid cumulative upkeep doesn't trigger it", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    const snap = spawn(game, "Cold Snap");
    // Pay Thought Lash's; Cold Snap's {2} can't be paid without mana.
    a.chooseModesFn = (_view, _min, _max, texts) => (texts.some((t) => /exile the top card/i.test(t)) ? [0] : []);
    toStep(game, "upkeep");
    const before = library(game);
    settle(game);
    expect(zone(game, snap)).toBe("graveyard");
    expect(zone(game, lash)).toBe("battlefield");
    expect(library(game)).toBe(before - 1);
  });

  it("exile the top card: prevent the next 1 damage to you; not with an empty library", () => {
    const { game } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    lands(game, "Mountain", 1);
    const before = library(game);
    activate(game, lash, 0);
    expect(library(game)).toBe(before - 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: A }] });
    expect(life(game, A)).toBe(18);
    for (const id of [...game.state.zones.perPlayer[A].library]) game.debugMove(id, "graveyard");
    expect(() => activate(game, lash, 0)).toThrow();
  });
});
