import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, hand, lands, life, pickPermanents, ref, settle, spawn, table, toHand, toLibrary } from "./harness.js";

// A prevention shield's follow-up as a triggered ability — New Way Forward's
// "When damage is prevented this way, …", which the spell's resolution
// created (rule 603.7a): the shield's `then` a `reflexive-trigger`, it
// triggers as the damage is prevented and uses the stack, unlike Deflecting
// Palm's "If damage is prevented this way", which happens right away (rule
// 615.5).

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

function shielded(): { game: Game; goblin: ObjectId } {
  const { game, a } = table();
  for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
  for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
  lands(game, "Island", 1);
  lands(game, "Mountain", 1);
  lands(game, "Plains", 3);
  const goblin = spawn(game, "Raging Goblin", B);
  pickPermanents(a, goblin);
  cast(game, toHand(game, "New Way Forward"));
  return { game, goblin };
}

describe("New Way Forward", () => {
  it("prevents the chosen source's next damage to you; the reflexive ability uses the stack", () => {
    const { game, goblin } = shielded();
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(20);
    // Not yet: the reflexive ability waits to be put on the stack.
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(0);
    game.dispatch({ type: "pass-priority", player: A });
    const stack = game.state.zones.shared.stack;
    expect(stack.length).toBe(1);
    expect(game.state.objects[stack[0]].kind).toBe("ability");
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(3);
  });

  it("only the next time: a second hit isn't prevented", () => {
    const { game, goblin } = shielded();
    hit(game, goblin, ref(A), 2);
    settle(game);
    hit(game, goblin, ref(A), 2);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(2);
  });

  it("nothing prevented, nothing triggers", () => {
    const { game, goblin } = shielded();
    const other = spawn(game, "Raging Goblin", B);
    hit(game, other, ref(A), 2);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(0);
    expect(game.state.objects[goblin].zone).toBe("battlefield");
  });
});
