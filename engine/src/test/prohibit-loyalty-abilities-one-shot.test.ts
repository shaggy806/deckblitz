/**
 * Flamescroll Celebrant // Revel in Silence. The back face: "Your opponents
 * can't cast spells or activate planeswalkers' loyalty abilities this turn" —
 * one `prohibit` effect with a cast act and an `activate` act narrowed to
 * loyalty abilities (`only: "loyalty"`, rule 606.1), so a planeswalker's other
 * abilities and every other permanent's still work; then the spell exiles
 * itself. The front: an opponent's non-mana ability deals them 1 damage.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, activate, cast, lands, life, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const activateLoyalty = (game: Game, walker: ObjectId): string | null =>
  game.canDispatch({ type: "activate-ability", player: B, source: walker, abilityIndex: 0, targets: [] });

/** Alice's priority in bob's upkeep, with Revel in Silence cast and resolved. */
function revelOnBobsTurn(game: Game): ObjectId {
  const revel = toHand(game, "Flamescroll Celebrant");
  lands(game, "Plains", 2);
  game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.priority.holder === A);
  cast(game, revel, { face: 1 });
  return revel;
}

describe("Revel in Silence: opponents can't cast spells or activate loyalty abilities this turn", () => {
  it("bob can't cast a spell or activate a loyalty ability, and the spell exiles itself", () => {
    const { game } = table();
    const walker = spawn(game, "Ajani Goldmane", B);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    const revel = revelOnBobsTurn(game);
    expect(zone(game, revel)).toBe("exile");

    toStep(game, "precombat-main", B);
    expect(activateLoyalty(game, walker)).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: B, card: bears, targets: [] })).not.toBeNull();
  });

  it("only loyalty abilities, and only opponents: other abilities and alice's own spells still go", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Mountain", 1, B);
    spawn(game, "Flamescroll Celebrant"); // the front face, on alice's side
    const ritual = toHand(game, "Dark Ritual");
    lands(game, "Swamp", 1);
    revelOnBobsTurn(game);
    game.advanceUntil((s) => s.priority.holder === A); // bob passes in his upkeep
    expect(game.canDispatch({ type: "cast-spell", player: A, card: ritual, targets: [] })).toBeNull();

    toStep(game, "precombat-main", B);
    activate(game, dragon, 0, { player: B });
    settle(game);
    // Firebreathing still works — and the Celebrant punishes it; the Mountain's mana ability doesn't.
    expect(life(game, B)).toBe(19);
  });

  it("this turn only: bob's next turn he may again", () => {
    const { game } = table();
    const walker = spawn(game, "Ajani Goldmane", B);
    revelOnBobsTurn(game);
    toStep(game, "precombat-main", B);
    expect(activateLoyalty(game, walker)).not.toBeNull();
    toStep(game, "precombat-main", A);
    toStep(game, "precombat-main", B);
    expect(activateLoyalty(game, walker)).toBeNull();
  });
});
