/**
 * One answer for every attacker in the same situation (`assign-combat-damage`'s
 * `forAll`): a stack of attacking tokens each blocked alike was a prompt per
 * token (the user, 2026-10-22). Each attacker's split is still its own
 * assignment (rule 510.1c) — only the asking is shared — so one in a
 * different situation is still asked.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, spawn, table } from "./harness.js";

const assigning = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "assign-combat-damage");
const offer = (game: Game) => {
  const legal = game.legalActions(A).find((a) => a.kind === "assign-combat-damage");
  return legal?.kind === "assign-combat-damage" ? legal : undefined;
};

/** Alice's attackers, each blocked by two of Bob's Grizzly Bears. */
function blockedTwice(names: readonly string[]) {
  const t = table();
  const attackers = names.map((name) => spawn(t.game, name, A));
  const bears = attackers.flatMap(() => [spawn(t.game, "Grizzly Bears", B), spawn(t.game, "Grizzly Bears", B)]);
  t.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  t.b.declareBlockersFn = () => bears.map((blocker, i) => ({ blocker, attacker: attackers[Math.floor(i / 2)] }));
  return { ...t, attackers, bears };
}

const dead = (game: Game, ids: readonly ObjectId[]) => ids.filter((id) => game.state.objects[id]?.zone !== "battlefield").length;

describe("assigning combat damage for every attacker alike at once", () => {
  it("says how many more are alike, and one forAll answer covers them", () => {
    const { game, bears } = blockedTwice(["Hill Giant", "Hill Giant", "Hill Giant"]);
    assigning(game);
    expect(offer(game)?.alike).toBe(2);
    // 3 on the first Bear of each pair.
    game.dispatch({ type: "assign-combat-damage", player: A, assignment: [3, 0], forAll: true });
    game.advanceUntil((s) => s.awaiting?.kind === "assign-combat-damage" || s.turn.step === "end-combat");
    expect(game.state.awaiting?.kind).not.toBe("assign-combat-damage");
    expect(dead(game, bears.filter((_, i) => i % 2 === 0))).toBe(3);
    expect(dead(game, bears.filter((_, i) => i % 2 === 1))).toBe(0);
  });

  it("still asks about an attacker in a different situation", () => {
    const { game } = blockedTwice(["Hill Giant", "Hill Giant", "Craw Wurm"]);
    assigning(game);
    expect(offer(game)?.alike).toBe(1);
    game.dispatch({ type: "assign-combat-damage", player: A, assignment: [2, 1], forAll: true });
    expect(game.state.awaiting?.kind).toBe("assign-combat-damage");
    expect(offer(game)?.power).toBe(6);
    expect(offer(game)?.alike).toBeUndefined();
  });
});
