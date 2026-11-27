import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { A, B, nextTurn, pickModes, settle, spawn, table, toStep } from "./harness.js";

/** On from the beginning of combat until the attackers are declared. */
const declare = (game: Game): void =>
  game.advanceUntil((s) => s.turn.step !== "begin-combat" && s.turn.step !== "declare-attackers");

// Johan: "At the beginning of combat on your turn, you may have Johan gain
// 'Johan can't attack' until end of combat. If you do, attacking doesn't
// cause creatures you control to tap this combat if Johan is untapped." —
// the `player-effect`'s `attacksWithoutTapping`, read as the attackers are
// declared (rule 508.1f), before any of them taps.
describe("attacking doesn't cause creatures you control to tap (Johan)", () => {
  const setUp = () => {
    const { game, a } = table();
    const johan = spawn(game, "Johan", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    return { game, a, johan, bears, giant };
  };

  it("with it chosen, Johan can't attack", () => {
    const { game, a, johan, bears } = setUp();
    pickModes(a, 0); // "you may": yes
    toStep(game, "begin-combat");
    settle(game);
    a.declareAttackersFn = () => [
      { attacker: johan, defender: B },
      { attacker: bears, defender: B },
    ];
    expect(() => declare(game)).toThrow(/attack/i);
  });

  it("spares every attacker it covers, this combat only", () => {
    const { game, a, johan, bears, giant } = setUp();
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    declare(game);
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(game.state.objects[johan].tapped).toBe(false);
    // Gone with the combat: the next turn's attackers tap, Johan declined.
    a.declareAttackersFn = () => [];
    pickModes(a);
    nextTurn(game);
    expect(game.state.playerEffects ?? []).toEqual([]);
    toStep(game, "begin-combat");
    settle(game);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    declare(game);
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("declined, attacking taps as usual, and Johan may attack", () => {
    const { game, a, johan, bears } = setUp();
    pickModes(a); // no
    toStep(game, "begin-combat");
    settle(game);
    a.declareAttackersFn = () => [
      { attacker: johan, defender: B },
      { attacker: bears, defender: B },
    ];
    declare(game);
    expect(game.state.objects[johan].attacking).toBe(B);
    expect(game.state.objects[johan].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("with Johan tapped as the attackers are declared, they tap", () => {
    const { game, a, johan, bears } = setUp();
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [{ kind: "object", object: johan }]);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    declare(game);
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
