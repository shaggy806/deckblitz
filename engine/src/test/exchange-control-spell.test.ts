/**
 * "Exchange control of target noncreature spell and target creature. Then the
 * spell's controller may choose new targets for it." (Sudden Substitution):
 * the `exchange-control` effect with a spell on the stack as one side — its
 * new controller controls it (rule 112.2) and the permanent it becomes
 * (110.2b) — all or nothing (701.12a, 701.12b), and `change-targets` asked of
 * the spell's controller (`by: "its-controller"`), whoever that now is.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, controller, lands, life, quiet, ref, spawn, table, toHand, zone } from "./harness.js";

function aliceCasts(game: Game, name: string, land: string, n: number, targets: readonly (ObjectId | PlayerId)[] = []): ObjectId {
  lands(game, land, n);
  const spell = toHand(game, name);
  cast(game, spell, { settle: false, targets: targets.map(ref) });
  game.dispatch({ type: "pass-priority", player: A });
  return spell;
}

/** Bob casts Sudden Substitution at `spell` and `creature`, and it resolves. */
function substitute(game: Game, spell: ObjectId, creature: ObjectId): void {
  lands(game, "Island", 4, B);
  const sub = toHand(game, "Sudden Substitution", B);
  cast(game, sub, { player: B, targets: [ref(spell), ref(creature)], settle: false });
  game.advanceUntil((s) => s.awaiting !== null || s.objects[sub].zone !== "stack" || quiet(s));
}

describe("Sudden Substitution", () => {
  it("swaps the spell for the creature, and the spell's new controller may choose its new targets", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = aliceCasts(game, "Lightning Bolt", "Mountain", 1, [B]);
    substitute(game, bolt, bears);
    expect(controller(game, bolt)).toBe(B);
    expect(controller(game, bears)).toBe(A);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    // Bob, who controls the Bolt now, is asked — not as a favour from Alice.
    expect(awaiting.player).toBe(B);
    expect(awaiting.prompt).toBe("Choose new targets for Lightning Bolt");
    game.dispatch({ type: "choose-targets", player: B, targets: [ref(C)] });
    game.advanceUntil(quiet);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(17);
    // The exchange lasts: the Bears stay Alice's.
    expect(controller(game, bears)).toBe(A);
    // The card is still Alice's: it goes to her graveyard.
    expect(game.state.zones.perPlayer[A].graveyard).toContain(bolt);
  });

  it("gives a permanent spell's permanent to its new controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = aliceCasts(game, "Sol Ring", "Mountain", 1);
    substitute(game, ring, bears);
    game.advanceUntil(quiet);
    expect(zone(game, ring)).toBe("battlefield");
    expect(controller(game, ring)).toBe(B);
    expect(game.state.objects[ring].owner).toBe(A);
    expect(controller(game, bears)).toBe(A);
  });

  it("exchanges nothing when one player controls both, and that player may still choose new targets", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A);
    const bolt = aliceCasts(game, "Lightning Bolt", "Mountain", 1, [B]);
    substitute(game, bolt, bears);
    expect(controller(game, bolt)).toBe(A);
    expect(controller(game, bears)).toBe(A);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.player).toBe(A);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(C)] });
    game.advanceUntil(quiet);
    expect(life(game, C)).toBe(17);
  });

  it("exchanges nothing when the creature is gone, the spell untouched", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = aliceCasts(game, "Sol Ring", "Mountain", 1);
    lands(game, "Island", 4, B);
    const sub = toHand(game, "Sudden Substitution", B);
    cast(game, sub, { player: B, targets: [ref(ring), ref(bears)], settle: false });
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    game.advanceUntil(quiet);
    expect(controller(game, ring)).toBe(A);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("can't target a creature spell", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", B);
    const bears = aliceCasts(game, "Grizzly Bears", "Forest", 2);
    lands(game, "Island", 4, B);
    const sub = toHand(game, "Sudden Substitution", B);
    expect(() => cast(game, sub, { player: B, targets: [ref(bears), ref(mine)], settle: false })).toThrow();
  });
});
