/**
 * One activated ability that works from several zones (`ActivatedAbility.zone`
 * as a list): Mister Immortal's "{2}{G}: Return this card from your graveyard
 * or from exile to the battlefield tapped." It moves its card out of those
 * zones, so it works only there (rule 113.6m), its owner's to activate
 * (602.2); each activation works from the zone the card is in then, and a
 * card that left that zone before it resolves is a new object (400.7).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, settle, spawn, table, toExile, toGraveyard, toHand, zone } from "./harness.js";

const activatable = (game: Game, card: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === card);

describe("Mister Immortal", () => {
  it("returns from the graveyard tapped", () => {
    const { game } = table();
    const mister = toGraveyard(game, "Mister Immortal");
    lands(game, "Forest", 3);
    expect(activatable(game, mister)).toBe(true);
    expect(activatable(game, mister, B)).toBe(false);
    activate(game, mister);
    expect(zone(game, mister)).toBe("battlefield");
    expect(game.state.objects[mister].tapped).toBe(true);
  });

  it("returns from exile tapped", () => {
    const { game } = table();
    const mister = toExile(game, "Mister Immortal");
    lands(game, "Forest", 3);
    expect(activatable(game, mister)).toBe(true);
    activate(game, mister);
    expect(zone(game, mister)).toBe("battlefield");
    expect(game.state.objects[mister].tapped).toBe(true);
  });

  it("works from neither the hand nor the battlefield", () => {
    const { game } = table();
    const inHand = toHand(game, "Mister Immortal");
    const onField = spawn(game, "Mister Immortal");
    lands(game, "Forest", 3);
    expect(activatable(game, inHand)).toBe(false);
    expect(activatable(game, onField)).toBe(false);
    expect(() => activate(game, inHand)).toThrow(/graveyard or exile/);
  });

  it("does nothing once the card has left the graveyard, even for exile, and works again from there", () => {
    const { game } = table();
    const mister = toGraveyard(game, "Mister Immortal");
    lands(game, "Forest", 6);
    activate(game, mister, 0, { settle: false });
    // In response, the card is exiled: a new object (400.7).
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [{ kind: "object", object: mister }]);
    expect(zone(game, mister)).toBe("exile");
    settle(game);
    expect(zone(game, mister)).toBe("exile");
    activate(game, mister);
    expect(zone(game, mister)).toBe("battlefield");
  });
});
