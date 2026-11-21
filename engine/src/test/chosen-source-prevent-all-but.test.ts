import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, life, pickPermanents, ref, settle, spawn, table, toStep } from "./harness.js";

// The chosen-source shield (rule 609.7) preventing all but 1 of the next
// combat damage — Forcefield: `prevent-damage-from-chosen-source` with
// `allBut: 1`, `combatOnly`, and an unblocked creature the source. The
// creature is chosen as the ability resolves (609.7a); one that would prevent
// none of it isn't used up (609.7b).

/** Alice attacks bob with `attackers`, unblocked, stopping in the declare
 * blockers step with bob's priority. */
function attackUntilBlocks(game: Game, a: import("../controller.js").ScriptedController, attackers: readonly ObjectId[]): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.priority.holder === B && s.awaiting === null && s.zones.shared.stack.length === 0,
  );
}

describe("Forcefield", () => {
  it("prevents all but 1 of the chosen unblocked creature's combat damage to you", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const ogre = spawn(game, "Gray Ogre", A);
    const field = spawn(game, "Forcefield", B);
    spawn(game, "Wastes", B);
    attackUntilBlocks(game, a, [giant, ogre]);
    const seen = pickPermanents(b, giant);
    activate(game, field, 0, { player: B });
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([giant, ogre]));
    toStep(game, "postcombat-main");
    // The Giant's 3 becomes 1; the Ogre's 2 isn't touched.
    expect(life(game, B)).toBe(20 - 1 - 2);
  });

  it("with nothing unblocked yet, there's nothing to choose and nothing happens", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const field = spawn(game, "Forcefield", B);
    spawn(game, "Wastes", B);
    let asked = 0;
    b.choosePermanentsFn = (_view, eligible) => {
      asked += 1;
      return [eligible[0]];
    };
    // Before blockers: the creature is attacking but not yet unblocked.
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === B && s.awaiting === null);
    activate(game, field, 0, { player: B });
    settle(game);
    expect(asked).toBe(0);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
  });

  it("noncombat damage from the creature isn't prevented", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const field = spawn(game, "Forcefield", B);
    spawn(game, "Wastes", B);
    attackUntilBlocks(game, a, [giant]);
    pickPermanents(b, giant);
    activate(game, field, 0, { player: B });
    settle(game);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(B)], { source: giant });
    expect(life(game, B)).toBe(17);
    // The shield is still there for its combat damage.
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);
  });

  it("1 combat damage isn't touched, and the shield isn't used up by it (609.7b)", () => {
    const { game, a, b } = table();
    const elf = spawn(game, "Llanowar Elves", A);
    const field = spawn(game, "Forcefield", B);
    spawn(game, "Wastes", B);
    attackUntilBlocks(game, a, [elf]);
    pickPermanents(b, elf);
    activate(game, field, 0, { player: B });
    settle(game);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(19);
    expect(game.state.activeReplacements.some((r) => r.source === field)).toBe(true);
  });
});
