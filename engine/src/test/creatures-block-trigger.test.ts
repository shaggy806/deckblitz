/**
 * "Whenever one or more creatures block" — the `creatures-block` trigger
 * event (`attackers-blocked`, now carrying the blockers), `batched`: once each
 * combat as the last declaration completes, and only if a creature was
 * declared as a blocker (Tide of War's ruling). Tide of War flips; each
 * blocking creature, or each blocked creature, is sacrificed by its
 * controller (`sacrifice-all` over `blocking` / `blocked`), and an unblocked
 * attacker is neither.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { GameState } from "../state.js";
import { A, B, C, spawn, table, zone } from "./harness.js";

const TIDE = "Tide of War";

/** The declare blockers step after its triggers have resolved, alice holding
 * priority. */
const afterBlocks = (s: GameState): boolean =>
  s.turn.step === "declare-blockers" &&
  s.awaiting === null &&
  s.priority.holder === A &&
  s.zones.shared.stack.length === 0 &&
  s.pendingTriggers.length === 0;

const flips = (game: Game) => game.state.eventLog.filter((e) => e.type === "coin-flipped");

/** Alice attacks bob with a Hill Giant and a Grizzly Bears; bob blocks the
 * Giant with his own Giant (or not at all), and keeps a Bears home. */
function combat(seed: number, opts: { block?: boolean; players?: 2 | 4 } = {}) {
  const { game, a, b } = table({ seed, players: opts.players ?? 2 });
  spawn(game, TIDE, A);
  const attacker = spawn(game, "Hill Giant", A);
  const unblocked = spawn(game, "Grizzly Bears", A);
  const blocker = spawn(game, "Hill Giant", B);
  const home = spawn(game, "Grizzly Bears", B);
  a.declareAttackersFn = () => [attacker, unblocked].map((x) => ({ attacker: x, defender: B }));
  b.declareBlockersFn = () => (opts.block === false ? [] : [{ blocker, attacker }]);
  game.advanceUntil(afterBlocks);
  return { game, attacker, unblocked, blocker, home };
}

/** The first seed whose flip comes out `won`. */
function seedWhere(won: boolean): number {
  for (let seed = 1; seed < 40; seed += 1) {
    if (flips(combat(seed).game)[0]?.won === won) return seed;
  }
  throw new Error(`no seed with a ${won ? "won" : "lost"} flip`);
}

describe("Tide of War", () => {
  it("one block: one flip, by Tide of War's controller", () => {
    const { game } = combat(1);
    expect(flips(game)).toHaveLength(1);
    expect(flips(game)[0]).toMatchObject({ player: A });
  });

  it("won: each blocking creature is sacrificed, and the attacker stays blocked (the ruling)", () => {
    const { game, attacker, unblocked, blocker, home } = combat(seedWhere(true));
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, attacker)).toBe("battlefield");
    expect(game.state.objects[attacker].blocked).toBe(true);
    expect(zone(game, unblocked)).toBe("battlefield");
    expect(zone(game, home)).toBe("battlefield");
  });

  it("lost: each blocked creature is sacrificed, never an unblocked one", () => {
    const { game, attacker, unblocked, blocker } = combat(seedWhere(false));
    expect(zone(game, attacker)).toBe("graveyard");
    expect(zone(game, unblocked)).toBe("battlefield");
    expect(zone(game, blocker)).toBe("battlefield");
  });

  it("no blocks: it doesn't trigger", () => {
    const { game } = combat(1, { block: false });
    expect(flips(game)).toHaveLength(0);
  });

  it("two creatures blocking, at four players: still once", () => {
    const { game, a, b, c } = table({ players: 4 });
    spawn(game, TIDE, C);
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const first = spawn(game, "Hill Giant", B);
    const second = spawn(game, "Grizzly Bears", C);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    b.declareBlockersFn = () => [{ blocker: first, attacker: giant }];
    c.declareBlockersFn = () => [{ blocker: second, attacker: bears }];
    game.advanceUntil(afterBlocks);
    expect(flips(game)).toHaveLength(1);
    expect(flips(game)[0]).toMatchObject({ player: C });
    const won = flips(game)[0].type === "coin-flipped" && flips(game)[0].won === true;
    // Won: both blockers go; lost: both blocked attackers.
    expect([first, second].map((id) => zone(game, id))).toEqual(won ? ["graveyard", "graveyard"] : ["battlefield", "battlefield"]);
    expect([giant, bears].map((id) => zone(game, id))).toEqual(won ? ["battlefield", "battlefield"] : ["graveyard", "graveyard"]);
  });
});
