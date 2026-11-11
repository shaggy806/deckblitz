/**
 * "Whenever enchanted player draws a card" (Curse of Fool's Wisdom): a `draws`
 * trigger's `who: "attached"` on an Aura that enchants a player — once per
 * card they draw, nothing for anyone else's draws, "they" being who drew.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, lands, life, ref, settle, table, toHand, zone } from "./harness.js";

const curse = (t: ReturnType<typeof table>, at = B) => {
  lands(t.game, "Swamp", 6);
  const card = toHand(t.game, "Curse of Fool's Wisdom");
  cast(t.game, card, { targets: [ref(at)] });
  return card;
};

describe("Curse of Fool's Wisdom", () => {
  it("drains 2 for each card the enchanted player draws", () => {
    const t = table({ players: 3 });
    curse(t);
    t.game.debugApplyEffect(B, { kind: "draw", amount: 3 }, []);
    settle(t.game);
    expect(life(t.game, B)).toBe(14);
    expect(life(t.game, A)).toBe(26);
    expect(life(t.game, C)).toBe(20);
  });

  it("ignores cards anyone else draws, its controller included", () => {
    const t = table({ players: 3 });
    curse(t);
    t.game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    t.game.debugApplyEffect(C, { kind: "draw", amount: 1 }, []);
    settle(t.game);
    expect([life(t.game, A), life(t.game, B), life(t.game, C)]).toEqual([20, 20, 20]);
  });

  it("takes the life from its controller too, when they're the enchanted player", () => {
    const t = table();
    curse(t, A);
    t.game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(t.game);
    // Loses 2, gains 2.
    expect(life(t.game, A)).toBe(20);
    expect(t.game.eventsOfType("life-changed").filter((e) => e.player === A).length).toBeGreaterThanOrEqual(2);
  });

  it("fires for the enchanted player's draw-step draw", () => {
    const t = table();
    curse(t);
    const before = hand(t.game, B).length;
    t.game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(hand(t.game, B).length).toBe(before + 1);
    expect(life(t.game, B)).toBe(18);
    expect(life(t.game, A)).toBe(22);
  });

  it("is cast for its madness cost when discarded", () => {
    const t = table();
    lands(t.game, "Swamp", 4);
    const card = toHand(t.game, "Curse of Fool's Wisdom");
    t.a.chooseDiscardsFn = () => [card];
    t.a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via };
    };
    t.game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(t.game);
    expect(zone(t.game, card)).toBe("battlefield");
    expect(t.game.state.objects[card].attachedToPlayer).toBe(B);
    // {3}{B}, not {4}{B}{B}.
    expect(t.game.state.zones.shared.battlefield.filter((id) => t.game.state.objects[id].tapped)).toHaveLength(4);
  });
});
