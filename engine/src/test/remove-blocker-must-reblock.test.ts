/**
 * `remove-from-combat`'s `thenMustBlock` — "then it blocks an attacking
 * creature of your choice" (Balduvian Warlord): False Orders' removal and
 * unblocking, with the new block mandatory (one attacker chosen, the one it
 * was blocking among them, the ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, life, ref, spawn, table, zone } from "./harness.js";

const toBlocks = (game: Game, holder: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === holder && s.awaiting === null);

const board = () => {
  const t = table();
  const { game, a, b } = t;
  const warlord = spawn(game, "Balduvian Warlord", A);
  const giant = spawn(game, "Hill Giant", A);
  const angel = spawn(game, "Serra Angel", A); // flying
  const wall = spawn(game, "Grizzly Bears", B);
  a.declareAttackersFn = () => [
    { attacker: giant, defender: B },
    { attacker: angel, defender: B },
  ];
  b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
  return { ...t, warlord, giant, angel, wall };
};

describe("Balduvian Warlord", () => {
  it("the blocker must block an attacker of the activator's choice, flying or not", () => {
    const { game, a, warlord, giant, angel, wall } = board();
    let asked: { offered: readonly ObjectId[]; min: number; max: number } | undefined;
    a.choosePermanentsFn = (_view, eligible, min, max) => {
      asked = { offered: eligible, min, max };
      return [angel];
    };
    toBlocks(game, A);
    activate(game, warlord, 0, { targets: [ref(wall)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(asked?.min).toBe(1);
    expect(asked?.max).toBe(1);
    expect(asked?.offered).toEqual(expect.arrayContaining([giant, angel]));
    // The Giant's 3 through, the Angel blocked and the Bears dead.
    expect(life(game, B)).toBe(17);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("it may block the attacker it was blocking, which is blocked again", () => {
    const { game, a, warlord, giant, wall } = board();
    a.choosePermanentsFn = () => [giant];
    toBlocks(game, A);
    activate(game, warlord, 0, { targets: [ref(wall)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    // The Angel's 4 alone; the Giant blocked.
    expect(life(game, B)).toBe(16);
    expect(zone(game, wall)).toBe("graveyard");
  });
});
