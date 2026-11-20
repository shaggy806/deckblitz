/**
 * A permanent spell's "as an additional cost, exile a creature you control"
 * (`additionalCost.exilesSacrifice`): the card is exiled with the permanent
 * the spell becomes (rule 607.2q), so its "each card exiled with it" reaches
 * it beside what its own abilities exiled (607.2a) — Fear of Abduction.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, destroy, hand, lands, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("an exile cost linked to the permanent (Fear of Abduction)", () => {
  it("hands back the creature exiled for its cost and the one its trigger exiled", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const fear = toHand(game, "Fear of Abduction");
    pickTargets(a, theirs);
    cast(game, fear, { sacrifice: mine });
    settle(game);
    expect(zone(game, fear)).toBe("battlefield");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, fear);
    expect(zone(game, mine)).toBe("hand");
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
  });

  it("finds only the cost's card when it leaves before its enters trigger resolves", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const fear = toHand(game, "Fear of Abduction");
    pickTargets(a, theirs);
    cast(game, fear, { sacrifice: mine, settle: false });
    // Resolve the spell, leaving its enters trigger on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.objects[fear].zone === "battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(fear)]);
    settle(game);
    // The leaves trigger resolved first: the bears came back; the target is
    // still exiled, for good (the rulings).
    expect(hand(game, A)).toContain(mine);
    expect(zone(game, theirs)).toBe("exile");
  });

  it("links nothing for a spell that isn't a permanent (Necrotic Fumes)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const fumes = toHand(game, "Necrotic Fumes");
    cast(game, fumes, { targets: [ref(theirs)], sacrifice: mine });
    settle(game);
    expect(zone(game, mine)).toBe("exile");
    expect(game.state.objects[mine].exiledWith).toBeUndefined();
  });
});
