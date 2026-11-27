/**
 * Damage reflected (rules 614.1a, 614.9): a replacement that lets the damage
 * through and deals that much more beside it (Eye for an Eye — the chosen
 * source's `also`), a static redirection back to the damaging spell's
 * controller (Harsh Judgment's `"damage-source-controller"`), and a one-shot
 * redirection back onto the attacker itself (Shield Dancer's
 * `"source-itself"`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, cast, lands, life, nextTurn, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

describe("Eye for an Eye", () => {
  function cast_(): { game: Game; goblin: ObjectId } {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Eye for an Eye"));
    return { game, goblin };
  }

  it("the damage is still dealt to you, and that much is dealt to the source's controller", () => {
    const { game, goblin } = cast_();
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });

  it("the second hit is just a hit: only the next time", () => {
    const { game, goblin } = cast_();
    hit(game, goblin, ref(A), 3);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(17);
  });

  it("Eye for an Eye deals the reflected damage, not the source", () => {
    const { game, goblin } = cast_();
    const before = game.state.eventLog.length;
    hit(game, goblin, ref(A), 3);
    const dealt = game.state.eventLog
      .slice(before)
      .filter((e) => e.type === "damage-dealt")
      .map((e) => (e as { source: ObjectId; target: TargetRef }).target);
    expect(dealt).toEqual(expect.arrayContaining([ref(A), ref(B)]));
    const toB = game.state.eventLog
      .slice(before)
      .find((e) => e.type === "damage-dealt" && (e as { target: TargetRef }).target.kind === "player" && (e as { target: { player: string } }).target.player === B) as
      | { source: ObjectId }
      | undefined;
    expect(toB?.source).not.toBe(goblin);
    expect(game.state.objects[toB!.source]?.cardName).toBe("Eye for an Eye");
  });

  it("damage from another source isn't reflected", () => {
    const { game } = cast_();
    const other = spawn(game, "Grizzly Bears", B);
    hit(game, other, ref(A), 2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("isn't prevention: damage that can't be prevented is reflected too", () => {
    const { game, goblin } = cast_();
    game.debugApplyEffect(B, { kind: "damage-cant-be-prevented" }, []);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Harsh Judgment", () => {
  function judged(color: string): Game {
    const { game } = table();
    const judgment = spawn(game, "Harsh Judgment");
    game.state.objects[judgment].chosenOnEnter = color;
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    return game;
  }

  it("a spell of the chosen color deals its damage to you to its controller instead", () => {
    const game = judged("R");
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });

  it("a spell of another color hits you", () => {
    const game = judged("U");
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("a creature of the chosen color isn't an instant or sorcery spell", () => {
    const game = judged("R");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });
});

describe("Shield Dancer", () => {
  it("the target attacker's next combat damage to the Dancer is dealt to the attacker itself", () => {
    const { game, b, a } = table();
    const dancer = spawn(game, "Shield Dancer");
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: dancer, attacker: bears }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    activate(game, dancer, 0, { targets: [ref(bears)] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.objects[dancer]?.zone).toBe("battlefield");
    expect(game.state.objects[dancer]?.damageMarked).toBe(0);
    expect(game.state.objects[bears]?.zone).toBe("graveyard");
  });
});
