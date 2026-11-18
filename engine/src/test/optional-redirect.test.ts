/**
 * "Until end of turn, if damage would be dealt to any creature, you may have that damage dealt to
 * you instead" (Blood of the Martyr): a `replacement-effect` redirection (rule 614.9) with `may`,
 * its controller asked each time — for each source and each creature — as a `choose-modes` of
 * `mayPreventFor` with `redirect`, before an effect deals the damage and before combat damage. A
 * redirection isn't prevention, so damage that can't be prevented is offered too.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import { A, B, attack, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

/** Records each "you may redirect" question and answers it: redirect (true) or not. */
function answerRedirect(seat: ScriptedController, game: Game, answer: (text: string) => boolean): string[] {
  const asked: string[] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-modes" || awaiting.mayPreventFor?.redirect === undefined) return [0];
    const text = texts[0] ?? "";
    asked.push(text);
    return [answer(text) ? 0 : 1];
  };
  return asked;
}

/** Alice casts Blood of the Martyr. */
function martyr(game: Game): void {
  lands(game, "Plains", 3);
  cast(game, toHand(game, "Blood of the Martyr"));
}

describe("Blood of the Martyr", () => {
  it("its controller may have a spell's damage to an opponent's creature dealt to them instead", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    martyr(game);
    lands(game, "Mountain", 1);
    const asked = answerRedirect(a, game, () => true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(asked).toEqual(["Have the 3 damage Lightning Bolt would deal to bob's Grizzly Bears dealt to you instead"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked ?? 0).toBe(0);
    expect(life(game, A)).toBe(17);
  });

  it("or let it be dealt to the creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    martyr(game);
    lands(game, "Mountain", 1);
    const asked = answerRedirect(a, game, () => false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(asked).toHaveLength(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });

  it("asks before combat damage, for each source and each creature separately", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    martyr(game);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    // Save the Giant from the Bears' 2; let the Giant's 3 kill the Bears.
    const asked = answerRedirect(a, game, (text) => text.includes("to your Hill Giant"));
    attack(game, a, [giant]);
    expect(asked).toHaveLength(2);
    expect(asked).toContain("Have the 2 damage Grizzly Bears would deal to your Hill Giant dealt to you instead");
    expect(asked).toContain("Have the 3 damage Hill Giant would deal to bob's Grizzly Bears dealt to you instead");
    expect(game.state.objects[giant].damageMarked ?? 0).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });

  it("is offered for damage that can't be prevented, which a redirection isn't", () => {
    const { game, a } = table();
    spawn(game, "Leyline of Punishment", A);
    const bears = spawn(game, "Grizzly Bears", B);
    martyr(game);
    lands(game, "Mountain", 1);
    const asked = answerRedirect(a, game, () => true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(asked).toHaveLength(1);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
  });

  it("damage to a player asks nothing", () => {
    const { game, a } = table();
    martyr(game);
    lands(game, "Mountain", 1);
    const asked = answerRedirect(a, game, () => true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(asked).toEqual([]);
    expect(life(game, B)).toBe(17);
  });

  it("ends with the turn", () => {
    const { game, a } = table();
    martyr(game);
    expect(game.state.activeReplacements.some((r) => r.replacement.event === "would-deal-damage")).toBe(true);
    answerRedirect(a, game, () => true);
    game.dispatch({ type: "pass-priority", player: A });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.activeReplacements.some((r) => r.replacement.event === "would-deal-damage")).toBe(false);
  });
});
