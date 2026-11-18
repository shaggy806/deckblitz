/**
 * "Can't be blocked" that an effect or another permanent's static says about
 * a creature is not an ability of that creature (rule 113.10: an effect that
 * adds an ability says "gains" or "has"), so "creatures lose all abilities"
 * leaves it. Card files write both as the `unblockable` keyword; the fold
 * adds the `cant-be-blocked` word beside it, which a loss doesn't take. A
 * creature's own "This creature can't be blocked" is its ability, and goes.
 * Found by the 2026-11-18 review (Marchesa's Smuggler, Aqueous Form).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { B, activate, cast, keywords, lands, ref, spawn, table, toHand } from "./harness.js";

/** Why B can't block `attacker` with `blocker` once blockers are asked for, or
 * `null` when the block is legal. */
function blockRefusal(game: Game, a: ReturnType<typeof table>["a"], attacker: ObjectId, blocker: ObjectId): string | null {
  // A second attacker anyone can block, so B is asked in this very combat
  // even when `attacker` can't be blocked at all (alone, B would never be
  // asked, and the next turn's combat would be after the effect ended).
  const other = spawn(game, "Hill Giant");
  const turn = game.state.turn.number;
  a.declareAttackersFn = () => [
    { attacker, defender: B },
    { attacker: other, defender: B },
  ];
  game.advanceUntil((s) => s.awaiting?.kind === "blockers");
  expect(game.state.awaiting?.kind).toBe("blockers");
  expect(game.state.turn.number).toBe(turn);
  return game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker, attacker }] } as Action);
}

describe("\"can't be blocked\" from an effect or an Aura is not the creature's ability", () => {
  it("Marchesa's Smuggler's effect holds through Dress Down, while the haste it gave is lost", () => {
    const { game, a } = table();
    const smuggler = spawn(game, "Marchesa's Smuggler");
    const bear = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    activate(game, smuggler, 0, { targets: [ref(bear)] });
    spawn(game, "Dress Down", B); // a later timestamp than the effect
    expect(keywords(game, bear).has("haste")).toBe(false);
    expect(blockRefusal(game, a, bear, blocker)).not.toBeNull();
  });

  it("Aqueous Form's static holds through Dress Down: the Aura is no creature and keeps it", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Aqueous Form"), { targets: [ref(bear)] });
    spawn(game, "Dress Down", B);
    expect(blockRefusal(game, a, bear, blocker)).not.toBeNull();
  });

  it("without Dress Down both are refused too", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Aqueous Form"), { targets: [ref(bear)] });
    expect(blockRefusal(game, a, bear, blocker)).not.toBeNull();
  });

  it("a creature's own \"can't be blocked\" is its ability: Dress Down takes it, and it can be blocked", () => {
    const { game, a } = table();
    const warrior = spawn(game, "Phantom Warrior");
    const blocker = spawn(game, "Grizzly Bears", B);
    expect(blockRefusal(game, a, warrior, blocker)).not.toBeNull();

    const second = table();
    const lost = spawn(second.game, "Phantom Warrior");
    const blocks = spawn(second.game, "Grizzly Bears", B);
    spawn(second.game, "Dress Down", B);
    expect(blockRefusal(second.game, second.a, lost, blocks)).toBeNull();
  });
});
