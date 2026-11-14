/**
 * Karplusan Minotaur: cumulative upkeep paid by flipping a coin per age
 * counter (`cumulativeUpkeep({ doing: { kind: "flip-coin" } })`, rule
 * 702.24a), "whenever you win a coin flip, … any target", and "whenever you
 * lose a coin flip, … any target of an opponent's choice" — a triggered
 * ability's `targetsChosenBy: "an-opponent"`: its controller names the
 * opponent (asked only among two or more), who chooses the target (rule
 * 603.3d). The coins come from the game's seeded stream, so each case reads
 * the flips back off the log.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, C, cast, counters, lands, life, nextTurn, pickModes, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const flips = (game: Game): boolean[] =>
  game.state.eventLog.flatMap((e) => (e.type === "coin-flipped" && e.player === A && e.won !== undefined ? [e.won] : []));

/** The seat aims every target it chooses at `at`. */
function aimAt(seat: ScriptedController, at: PlayerId): void {
  seat.chooseTargetsFn = (_view, _source, _specs, options) =>
    options.map((slot) => slot.find((t) => t.kind === "player" && t.player === at) ?? slot[0]);
}

describe("Karplusan Minotaur", () => {
  it("flips once per age counter; a win hits the controller's target, a loss the opponent's", () => {
    let sawWin = false;
    let sawLoss = false;
    for (let seed = 1; seed <= 12 && !(sawWin && sawLoss); seed++) {
      const { game, a, b } = table({ seed });
      const minotaur = spawn(game, "Karplusan Minotaur");
      pickModes(a, 0);
      aimAt(a, B);
      aimAt(b, A);
      nextTurn(game);
      nextTurn(game);
      nextTurn(game);
      nextTurn(game);
      // Two upkeeps: one flip, then two.
      expect(counters(game, minotaur, "age")).toBe(2);
      const results = flips(game);
      expect(results).toHaveLength(3);
      const won = results.filter((w) => w).length;
      expect(life(game, B)).toBe(20 - won);
      expect(life(game, A)).toBe(20 - (results.length - won));
      sawWin ||= won > 0;
      sawLoss ||= won < results.length;
    }
    expect(sawWin && sawLoss).toBe(true);
  });

  it("declining the upkeep flips nothing and sacrifices it", () => {
    const { game, a } = table();
    const minotaur = spawn(game, "Karplusan Minotaur");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(flips(game)).toHaveLength(0);
    expect(game.state.objects[minotaur].zone).toBe("graveyard");
  });

  it("with two opponents, its controller names the one who chooses a lost flip's target", () => {
    let checked = false;
    for (let seed = 1; seed <= 12 && !checked; seed++) {
      const { game, a, b, c } = table({ players: 3, seed });
      spawn(game, "Karplusan Minotaur");
      pickModes(a, 0);
      const offered: string[][] = [];
      a.chooseCreatureTypeFn = (_view, _source, options) => {
        offered.push([...options]);
        return C;
      };
      aimAt(a, B);
      // Bob would hit carol; carol, named, hits alice.
      aimAt(b!, C);
      aimAt(c!, A);
      nextTurn(game);
      nextTurn(game);
      nextTurn(game);
      const results = flips(game);
      expect(results).toHaveLength(1);
      if (results[0]) {
        expect(offered).toHaveLength(0);
        expect(life(game, B)).toBe(19);
        continue;
      }
      expect(offered).toEqual([[B, C]]);
      expect(life(game, A)).toBe(19);
      expect(life(game, C)).toBe(20);
      checked = true;
    }
    expect(checked).toBe(true);
  });
});

describe("Mausoleum Turnkey", () => {
  it("the opponent picks which of the controller's creature cards comes back", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    let offered: readonly TargetRef[] = [];
    b.chooseTargetsFn = (_view, _source, _specs, options) => {
      offered = options[0] ?? [];
      return [ref(bears)];
    };
    cast(game, toHand(game, "Mausoleum Turnkey"));
    expect(offered.map((t) => (t.kind === "object" ? t.object : t.kind)).sort()).toEqual([bears, giant].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
