/**
 * Ward—Discard a card of a kind (rule 702.21a — `WardCost.discardOf`):
 * Saruman of Many Colors' "Ward—Discard an enchantment, instant, or sorcery
 * card", payable only with such a card in hand (its ruling), and that's the
 * card discarded. And its second-spell trigger: each opponent mills two, and
 * only if a card was milled does the reflexive ability trigger (rule 603.12),
 * targeting an opponent's enchantment, instant or sorcery card with mana value
 * at most that spell's, exiled, copied, and the copy cast free (rule 707.12;
 * an enchantment's copy a token once it resolves).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, life, pickModes, ref, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

describe("Saruman of Many Colors — ward, discard an enchantment, instant, or sorcery card", () => {
  it("is paid by discarding such a card, never another", () => {
    const { game, a } = table();
    const saruman = spawn(game, "Saruman of Many Colors", B);
    lands(game, "Mountain", 1);
    const bears = toHand(game, "Grizzly Bears");
    const opt = toHand(game, "Opt");
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(saruman)] });
    expect(game.eventsOfType("ward-paid").some((e) => e.object === saruman)).toBe(true);
    expect(zone(game, opt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.objects[saruman].damageMarked).toBe(3);
  });

  it("can't be paid with only other cards in hand: the spell is countered", () => {
    const { game, a } = table();
    const saruman = spawn(game, "Saruman of Many Colors", B);
    lands(game, "Mountain", 1);
    const bears = toHand(game, "Grizzly Bears");
    const offered: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push([...texts]);
      return [0];
    };
    const handBefore = hand(game, A).length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(saruman)] });
    expect(game.eventsOfType("ward-unpaid").some((e) => e.object === saruman)).toBe(true);
    expect(offered.flat().some((t) => /Pay ward/.test(t))).toBe(false);
    expect(game.state.objects[saruman].damageMarked).toBe(0);
    expect(zone(game, bears)).toBe("hand");
    // Nothing discarded: only the Bolt came and went (cast, then countered).
    expect(hand(game, A).length).toBe(handBefore);
  });
});

describe("Saruman of Many Colors — the second spell each turn", () => {
  const castFree = (seat: ReturnType<typeof table>["a"]): void => {
    seat.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
  };

  it("mills each opponent two, then exiles a card no greater than that spell's mana value and casts its copy free", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Saruman of Many Colors");
    lands(game, "Island", 4);
    const anthem = toGraveyard(game, "Glorious Anthem", B);
    const divination = toGraveyard(game, "Divination", B);
    const warp = toGraveyard(game, "Time Warp", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    const mine = toGraveyard(game, "Opt");
    const bobsBefore = graveyard(game, B).length;
    let offered: readonly ObjectId[] = [];
    let asked = 0;
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      asked += 1;
      offered = options[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId)));
      return [ref(anthem)];
    };
    castFree(a);
    cast(game, toHand(game, "Opt"));
    expect(asked).toBe(0);
    cast(game, toHand(game, "Divination"));
    // Each opponent milled two.
    expect(graveyard(game, B).length).toBe(bobsBefore + 2 - 1);
    expect(asked).toBe(1);
    // Mana value 3 or less (Divination's), an enchantment, instant or sorcery, an opponent's.
    expect(offered).toContain(anthem);
    expect(offered).toContain(divination);
    expect(offered).not.toContain(warp);
    expect(offered).not.toContain(giant);
    expect(offered).not.toContain(mine);
    expect(zone(game, anthem)).toBe("exile");
    // The copy resolved as a token Glorious Anthem of alice's.
    expect(tokensNamed(game, "Glorious Anthem", A)).toBe(1);
  });

  it("copies an instant whose copy resolves for its caster", () => {
    const { game, a } = table();
    spawn(game, "Saruman of Many Colors");
    lands(game, "Island", 4);
    const bobsDivination = toGraveyard(game, "Divination", B);
    a.chooseTargetsFn = () => [ref(bobsDivination)];
    castFree(a);
    cast(game, toHand(game, "Opt"));
    const divination = toHand(game, "Divination");
    const before = hand(game, A).length;
    cast(game, divination);
    // Her own Divination's two cards, then the copy's two.
    expect(hand(game, A).length).toBe(before - 1 + 2 + 2);
    expect(zone(game, bobsDivination)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("with nothing milled, the reflexive ability never triggers", () => {
    const { game, a } = table();
    spawn(game, "Saruman of Many Colors");
    lands(game, "Island", 4);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 60 });
    const anthem = toGraveyard(game, "Glorious Anthem", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(anthem)];
    };
    castFree(a);
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Divination"));
    expect(asked).toBe(0);
    expect(zone(game, anthem)).toBe("graveyard");
  });
});
