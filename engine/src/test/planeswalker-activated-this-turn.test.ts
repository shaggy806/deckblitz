/**
 * "A planeswalker that was activated this turn" (Cut Short): one whose
 * ability — any activated ability, loyalty or not — was activated this turn,
 * the journal's `abilities-activated` word in a `journaled` clause, for this
 * object (rule 400.7). The ability may still be on the stack, and the
 * planeswalker needn't still have it (its rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { cardSource, legalTargets } from "../targeting.js";
import { A, B, activate, cast, lands, life, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

/** Whether `player`'s Cut Short could target `at` now. */
function canCutShort(game: Game, at: ObjectId, player: PlayerId = A): boolean {
  const card = toHand(game, "Cut Short", player);
  const def = game.registry.get("Cut Short");
  return legalTargets(game.state, game.registry, def.targets[0], player, cardSource(def, card)).some(
    (t) => t.kind === "object" && t.object === at,
  );
}

describe("Cut Short", () => {
  it("a planeswalker is a target only once one of its abilities was activated this turn", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    expect(canCutShort(game, ajani)).toBe(false);
    activate(game, ajani, 0);
    expect(life(game, A)).toBe(22);
    expect(canCutShort(game, ajani)).toBe(true);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Cut Short"), { targets: [ref(ajani)] });
    expect(zone(game, ajani)).toBe("graveyard");
  });

  it("while its ability is still on the stack, it was activated", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    activate(game, ajani, 0, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(canCutShort(game, ajani)).toBe(true);
  });

  it("an activation last turn doesn't count", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    activate(game, ajani, 0);
    nextTurn(game);
    expect(canCutShort(game, ajani, B)).toBe(false);
  });

  it("a planeswalker that left and came back is a new object, not activated", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    activate(game, ajani, 0);
    game.debugMove(ajani, "exile");
    game.debugMove(ajani, "battlefield");
    expect(canCutShort(game, ajani)).toBe(false);
  });

  it("or a tapped creature, not an untapped one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    expect(canCutShort(game, bears)).toBe(false);
    game.state.objects[bears].tapped = true;
    expect(canCutShort(game, bears)).toBe(true);
  });
});
