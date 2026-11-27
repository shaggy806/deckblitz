import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, nextTurn, pt, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): phasing (rule 702.26) — what's attached phases
 * out with its permanent and comes back attached (702.26g), and an effect
 * that ends while it's away no longer applies (702.26f).
 */
describe("phasing, audited", () => {
  it("an Aura and an Equipment phase out indirectly with their creature and phase back in attached (rule 702.26g)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 1);
    const rancor = toHand(game, "Rancor");
    cast(game, rancor, { targets: [ref(giant)] });
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Wastes", 1);
    activate(game, splitter, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 7, toughness: 3 });
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("phased-out");
    expect(zone(game, rancor)).toBe("phased-out");
    expect(zone(game, splitter)).toBe("phased-out");
    // Alice's next untap step: they phase in together, still attached.
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[rancor].attachedTo).toBe(giant);
    expect(game.state.objects[splitter].attachedTo).toBe(giant);
    expect(pt(game, giant)).toEqual({ power: 7, toughness: 3 });
  });

  it("an until-end-of-turn pump ends while it's phased out, and is gone when it phases in (rule 702.26f)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" }, [ref(giant)]);
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(giant)]);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("an attacker that phases out is removed from combat and deals no damage (rule 506.4)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(giant)]);
    settle(game);
    const before = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
    expect(game.state.objects[giant].attacking).toBe(null);
  });
});
