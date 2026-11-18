/**
 * "For each creature attacking you or a planeswalker you control, create a
 * token that's a copy of that creature and that's blocking that creature.
 * Exile those tokens at end of combat" (Mirror Match): the filter's
 * `attackingYou: "or-your-planeswalkers"` (rule 506.2, never a battle) and
 * `create-token-copy`'s `blockingWhatItCopies` (rule 509.4: each copy is
 * blocking its original, whatever restricts blocks), exiled at end of combat.
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, cast, lands, life, named, nextTurn, spawn, table, toHand, zone } from "./harness.js";

const MIRROR = "Mirror Match";

/** Bob's declare blockers step, blocks declared (none), with alice's priority. */
function toBobsBlocks(game: Game): void {
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && activePlayerOf(s) === B && s.priority.holder === A);
}

describe("Mirror Match", () => {
  it("copies each creature attacking alice or her planeswalker, each copy blocking its original, exiled at end of combat", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Island", 6);
    const walker = spawn(game, "Saheeli Rai", A);
    nextTurn(game); // bob's
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions", B);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: A },
      { attacker: giant, defender: walker },
      { attacker: lions, defender: C },
    ];
    toBobsBlocks(game);
    cast(game, toHand(game, MIRROR), { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    const copies = (name: string) => named(game, name, A).filter((id) => game.state.objects[id].isToken);
    const [bearsCopy] = copies("Grizzly Bears");
    const [giantCopy] = copies("Hill Giant");
    expect(copies("Savannah Lions")).toEqual([]); // attacking carol
    expect(game.state.objects[bearsCopy].blocking).toBe(bears);
    expect(game.state.objects[giantCopy].blocking).toBe(giant);
    // Combat damage, then end of combat: the Bears traded with its copy, the
    // Giants too; nothing of alice's was hit; the copies are gone.
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[walker].counters.loyalty).toBe(3);
    expect(copies("Grizzly Bears")).toEqual([]);
    expect(copies("Hill Giant")).toEqual([]);
  });

  it("only during the declare blockers step", () => {
    const { game } = table();
    lands(game, "Island", 6);
    expect(() => cast(game, toHand(game, MIRROR))).toThrow(/refused/);
  });

  it("attackingYou: \"or-your-planeswalkers\" adds a planeswalker you control, never a battle or another's", () => {
    const { game } = table({ players: 3 });
    const walker = spawn(game, "Saheeli Rai", A);
    const carolsWalker = spawn(game, "Saheeli Rai", C);
    const bears = spawn(game, "Grizzly Bears", B);
    const reads = (attacking: string) => {
      game.state.objects[bears].attacking = attacking as never;
      return [
        matchesFilter(game.state, game.registry, bears, { attackingYou: "or-your-planeswalkers" }, { you: A }),
        matchesFilter(game.state, game.registry, bears, { attackingYou: true }, { you: A }),
      ];
    };
    expect(reads(A)).toEqual([true, true]);
    expect(reads(walker)).toEqual([true, false]);
    expect(reads(carolsWalker)).toEqual([false, false]);
    expect(reads(C)).toEqual([false, false]);
  });
});
