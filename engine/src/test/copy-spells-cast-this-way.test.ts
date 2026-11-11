/**
 * "If X is 10 or more, copy each of those spells twice. You may choose new
 * targets for the copies" (Finale of Promise): `copy-all`'s `of` (the spells
 * a `cast-now` earlier in the resolution cast — `{ thisWay: "cast" }`) and
 * `times`. The copies are made on the stack, never cast (rule 707.10), and
 * resolve before the originals.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, lands, life, ref, table, toGraveyard, toHand, zone } from "./harness.js";

type CastSpellAction = Extract<Action, { type: "cast-spell" }>;

/** Alice, with a Finale in hand, `mountains` to pay for it, and a seat that
 * casts whatever a `cast-now` offers first, at Bob. */
function board(mountains: number) {
  const t = table();
  lands(t.game, "Mountain", mountains);
  const finale = toHand(t.game, "Finale of Promise");
  const castNow: ObjectId[] = [];
  t.a.chooseCastNowFn = (_view, offer) => {
    const card = offer.casts[0]?.card;
    if (card === undefined) return null;
    castNow.push(card);
    return { type: "cast-spell", player: A, card, targets: [ref(B)], via: "effect", free: true } as CastSpellAction;
  };
  return { ...t, finale, castNow };
}

describe("Finale of Promise", () => {
  it("X = 10: casts both cards free, copies each twice, and exiles the originals", () => {
    const { game, finale, castNow } = board(12);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const spike = toGraveyard(game, "Lava Spike");
    cast(game, finale, { x: 10, targets: [ref(bolt), ref(spike)] });
    expect([...castNow].sort()).toEqual([bolt, spike].sort());
    // Each of the two spells and its two copies: six times 3 damage.
    expect(life(game, B)).toBe(20 - 18);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, spike)).toBe("exile");
    expect(graveyard(game)).toContain(finale);
  });

  it("X under 10: the spells are cast, nothing is copied", () => {
    const { game, finale } = board(5);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const spike = toGraveyard(game, "Lava Spike");
    cast(game, finale, { x: 3, targets: [ref(bolt), ref(spike)] });
    expect(life(game, B)).toBe(20 - 6);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("only the sorcery: its two copies and itself", () => {
    const { game, finale } = board(12);
    const spike = toGraveyard(game, "Lava Spike");
    cast(game, finale, { x: 10, targets: [null, ref(spike)] });
    expect(life(game, B)).toBe(20 - 9);
  });

  it("a spell you decline to cast isn't copied, and stays in the graveyard", () => {
    const { game, a, finale } = board(12);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const spike = toGraveyard(game, "Lava Spike");
    a.chooseCastNowFn = (_view, offer) => {
      const only = offer.casts.find((c) => c.card === bolt);
      return only === undefined
        ? null
        : ({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true } as CastSpellAction);
    };
    cast(game, finale, { x: 10, targets: [ref(bolt), ref(spike)] });
    expect(life(game, B)).toBe(20 - 9);
    expect(zone(game, spike)).toBe("graveyard");
  });

  it("each card needs mana value X or less, and the right card type for its slot", () => {
    const { game, finale } = board(12);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const spike = toGraveyard(game, "Lava Spike");
    expect(() => cast(game, finale, { x: 0, targets: [ref(bolt), null] })).toThrow();
    expect(() => cast(game, finale, { x: 10, targets: [ref(spike), null] })).toThrow();
    expect(() => cast(game, finale, { x: 10, targets: [null, ref(bolt)] })).toThrow();
  });
});
