/**
 * A flashback cost with a part that isn't mana (`flashback.also`, rule
 * 702.34a) — Light Up the Night's "Flashback—{3}{R}, Remove X loyalty counters
 * from among planeswalkers you control. If you cast this spell this way, X
 * can't be 0": X announced for that cast though the flashback's mana has none
 * (rules 107.3a, 601.2b), at least `flashback.minX` and at most the counters
 * there are, which planeswalkers give them chosen as the cost is paid (601.2h).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, life, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const flashbackOffer = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.via === "flashback");
const setLoyalty = (game: Game, id: ObjectId, n: number): void => {
  game.state.objects[id].counters.loyalty = n;
};

describe("Light Up the Night", () => {
  it("from hand: X to a player, X plus 1 to a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Light Up the Night"), { x: 2, targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(18);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Light Up the Night"), { x: 2, targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("flashback: X from 1 to the loyalty among your planeswalkers, removed as it's cast", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const spell = toGraveyard(game, "Light Up the Night");
    // No planeswalker: X can't be 0, so it can't be cast this way.
    expect(flashbackOffer(game, spell)).toBeUndefined();
    const chandra = spawn(game, "Chandra, Torch of Defiance");
    const jace = spawn(game, "Jace Beleren");
    setLoyalty(game, chandra, 4);
    setLoyalty(game, jace, 3);
    // An opponent's planeswalker can't pay.
    setLoyalty(game, spawn(game, "Jace Beleren", B), 3);
    expect(flashbackOffer(game, spell)?.xCost).toMatchObject({ maxX: 7, minX: 1 });
    expect(() => cast(game, spell, { via: "flashback", x: 0, targets: [{ kind: "player", player: B }] })).toThrow(/X can't be 0/);
    expect(() => cast(game, spell, { via: "flashback", x: 8, targets: [{ kind: "player", player: B }] })).toThrow();
    let asked: { min: number; max: number; eligible: readonly ObjectId[] } | undefined;
    a.chooseCounterRemovalsFn = (_view, removal) => {
      asked = { min: removal.min, max: removal.max, eligible: removal.eligible.map((e) => e.object) };
      return [
        { object: chandra, kind: "loyalty", count: 2 },
        { object: jace, kind: "loyalty", count: 1 },
      ];
    };
    const giant = spawn(game, "Hill Giant", B);
    cast(game, spell, { via: "flashback", x: 3, targets: [ref(giant)] });
    expect(asked?.min).toBe(3);
    expect(asked?.max).toBe(3);
    expect([...(asked?.eligible ?? [])].sort()).toEqual([chandra, jace].sort());
    expect(counters(game, chandra, "loyalty")).toBe(2);
    expect(counters(game, jace, "loyalty")).toBe(2);
    // X plus 1 to the 3/3, and the spell exiled after.
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, spell)).toBe("exile");
  });
});
