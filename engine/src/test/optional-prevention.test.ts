/**
 * "If a source would deal damage to a player, you may prevent X of that damage, where X is the
 * number of Clerics you control" (Battletide Alchemist): a damage prevention its controller
 * chooses each time (`DamageMultiplierReplacement.may`), asked before an effect deals the damage
 * and before combat damage as a `choose-modes` of `mayPreventFor` — separately for each player a
 * source would damage at once (its ruling) — with X counted as the damage would be dealt
 * (`prevent: { count }`). Where nothing can ask, it's taken for its controller's damage only.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import { A, B, attack, cast, lands, life, ref, spawn, table, toHand } from "./harness.js";

const ALCHEMIST = "Battletide Alchemist";

/** Records each "may prevent" question and answers it: prevent (true) or not. */
function answerPrevent(seat: ScriptedController, game: Game, answer: (recipient: string) => boolean): string[] {
  const asked: string[] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-modes" || awaiting.mayPreventFor === undefined) return [0];
    asked.push(texts[0] ?? "");
    return [answer(awaiting.mayPreventFor.recipient) ? 0 : 1];
  };
  return asked;
}

describe("Battletide Alchemist", () => {
  it("its controller may prevent X of a spell's damage to an opponent, or let it through", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    lands(game, "Mountain", 1);
    const asked = answerPrevent(a, game, () => false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(asked).toEqual(["Prevent 1 of the 3 damage Lightning Bolt would deal to bob"]);
    expect(life(game, B)).toBe(17);
  });

  it("X is the Clerics its controller has as the damage is dealt, and it may prevent them", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    spawn(game, "Soul Warden", A);
    lands(game, "Mountain", 1, B);
    const asked = answerPrevent(a, game, () => true);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(asked).toEqual(["Prevent 2 of the 3 damage Lightning Bolt would deal to you"]);
    expect(life(game, A)).toBe(19);
  });

  it("damage to several players at once: asked for each, separately", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    lands(game, "Mountain", 2);
    const asked = answerPrevent(a, game, (recipient) => recipient === A);
    cast(game, toHand(game, "Flame Rift"));
    expect(asked).toHaveLength(2);
    expect(asked).toContain("Prevent 1 of the 4 damage Flame Rift would deal to you");
    expect(asked).toContain("Prevent 1 of the 4 damage Flame Rift would deal to bob");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(16);
  });

  it("combat damage asks before it's dealt", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    const giant = spawn(game, "Hill Giant", A, { sick: false });
    const asked = answerPrevent(a, game, () => false);
    attack(game, a, [giant]);
    expect(asked).toEqual(["Prevent 1 of the 3 damage Hill Giant would deal to bob"]);
    expect(life(game, B)).toBe(17);
  });

  it("taking the prevention for an opponent's damage prevents it", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    const giant = spawn(game, "Hill Giant", A, { sick: false });
    answerPrevent(a, game, () => true);
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(18);
  });

  it("damage that can't be prevented asks nothing", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    lands(game, "Mountain", 2);
    const asked = answerPrevent(a, game, () => true);
    cast(game, toHand(game, "Skullcrack"), { targets: [ref(B)] });
    expect(asked).toEqual([]);
    expect(life(game, B)).toBe(17);
  });

  it("where nothing can ask, it prevents its controller's damage and not an opponent's", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, A);
    const asked = answerPrevent(a, game, () => true);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, who: "each-player" });
    expect(asked).toEqual([]);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(17);
  });
});
