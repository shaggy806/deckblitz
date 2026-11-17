/**
 * "Whenever a creature you control dealt damage this way dies this turn"
 * (Reckless Blaze): a delayed `whenever` watch over what the spell dealt
 * damage to (`watching: { thisWay: "dealt-damage" }`, rule 603.7c), its
 * `dies` trigger's `filter` reading each watched creature's own controller as
 * it last existed (rule 603.10a), "you" the delayed ability's controller.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, destroy, lands, spawn, table, toHand, zone } from "./harness.js";

const red = (game: ReturnType<typeof table>["game"]): number =>
  game.state.players[A].manaPool.filter((unit) => unit.type === "R").length;

describe("Reckless Blaze", () => {
  it("adds {R} for each creature you control it killed, none for an opponent's", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Reckless Blaze"));
    for (const id of [...bears, giant]) expect(zone(game, id)).toBe("graveyard");
    expect(red(game)).toBe(2);
  });

  it("watches a creature that survived it for the rest of the turn, and nothing it didn't damage", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    cast(game, toHand(game, "Reckless Blaze"));
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(red(game)).toBe(0);
    // A creature that wasn't there to be dealt damage.
    const later = spawn(game, "Grizzly Bears");
    destroy(game, later);
    expect(red(game)).toBe(0);
    destroy(game, dreadmaw);
    expect(red(game)).toBe(1);
  });

  it("reads who controlled it as it died: an opponent's creature you'd taken counts", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const stolen = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Reckless Blaze"));
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [{ kind: "object", object: stolen }]);
    expect(controller(game, stolen)).toBe(A);
    destroy(game, stolen);
    expect(red(game)).toBe(1);
  });
});
