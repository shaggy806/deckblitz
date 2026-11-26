import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import { A, B, cast, destroy, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * A rules audit's eighth slice (2026-11-26): keyword actions (rule 701)
 * where one side of them is gone or can't be affected.
 */
describe("keyword actions, audited", () => {
  it("a fight with one creature gone before it resolves: neither deals damage (rule 701.14b)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(giant), ref(bears)], settle: false });
    destroy(game, bears, A);
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("a fight's damage is still damage: a lifelinker fighting gains the life (rules 701.14d, 702.15b)", () => {
    const { game } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    const before = game.state.players[A].life;
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(hawk), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.players[A].life).toBe(before + 2);
  });

  it("an indestructible creature can be sacrificed (rule 701.21a)", () => {
    const { game } = table();
    const myr = spawn(game, "Darksteel Myr");
    game.debugApplyEffect(A, { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 }, []);
    (game as unknown as { prepareForPriority(p: PlayerId): void }).prepareForPriority(A);
    settle(game);
    expect(zone(game, myr)).toBe("graveyard");
  });

  it("a regeneration shield doesn't stop a sacrifice (rule 701.21a)", () => {
    const { game } = table();
    const skeletons = spawn(game, "Drudge Skeletons");
    game.debugApplyEffect(A, { kind: "regenerate", target: 0 }, [ref(skeletons)]);
    game.debugApplyEffect(A, { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 }, []);
    (game as unknown as { prepareForPriority(p: PlayerId): void }).prepareForPriority(A);
    settle(game);
    expect(zone(game, skeletons)).toBe("graveyard");
  });

  it("a regeneration shield does stop a destroy (control for the test above)", () => {
    const { game } = table();
    const skeletons = spawn(game, "Drudge Skeletons");
    game.debugApplyEffect(A, { kind: "regenerate", target: 0 }, [ref(skeletons)]);
    destroy(game, skeletons);
    settle(game);
    expect(zone(game, skeletons)).toBe("battlefield");
  });
});
