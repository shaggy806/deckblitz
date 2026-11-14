/**
 * "Creatures the monarch controls" — `CardFilter.controlledBy: "monarch"`
 * (rule 725), read as blockers are declared: Azure Fleet Admiral can't be
 * blocked by them, so it's blockable while its controller keeps the crown and
 * unblockable by whoever takes it.
 */

import { describe, expect, it } from "vitest";

import { A, B, blockOffer, enter, spawn, table, toStep } from "./harness.js";

describe("controlled by the monarch", () => {
  it("Azure Fleet Admiral makes you the monarch as it enters", () => {
    const { game } = table();
    enter(game, "Azure Fleet Admiral");
    expect(game.state.monarch).toBe(A);
  });

  it("can be blocked by a player who isn't the monarch, not by one who is", () => {
    const { game, a } = table();
    const admiral = enter(game, "Azure Fleet Admiral");
    const bears = spawn(game, "Grizzly Bears", B);
    const canBlock = (offer: ReturnType<typeof blockOffer>) =>
      offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? [];
    expect(canBlock(blockOffer(game, a, [admiral]))).toEqual([admiral]);

    // Bob takes the crown: his creatures can't block it now.
    toStep(game, "end", A);
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    toStep(game, "precombat-main", A);
    expect(game.state.monarch).toBe(B);
    // Nobody of bob's can block it, so he isn't asked to.
    a.declareAttackersFn = () => [{ attacker: admiral, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "combat-damage");
    expect(game.state.awaiting?.kind).not.toBe("blockers");
    expect(game.state.turn.step).toBe("combat-damage");
  });
});
