/**
 * "Clash with defending player" (rule 701.30b names the opponent; Marvo,
 * Deep Operative): `clash`'s `with`, the opponent named rather than chosen —
 * here the player the source attacks (508.5) — and nobody asked which.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, attack, hand, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Marvo, Deep Operative", () => {
  it("clashes with the player it attacks, not another opponent, and a win draws and casts free", () => {
    const { game, a } = table({ players: 3 });
    const marvo = spawn(game, "Marvo, Deep Operative", A);
    toLibrary(game, "Hill Giant", A); // mana value 4
    toLibrary(game, "Craw Wurm", B); // 6: a clash with bob would lose
    toLibrary(game, "Wastes", C); // 0
    const giant = toHand(game, "Colossal Dreadmaw", A);
    let modesAsked = 0;
    a.chooseModesFn = (_view, min, _max, texts) => {
      if (texts.some((t) => t.startsWith("Clash with"))) modesAsked += 1;
      return Array.from({ length: Math.max(min, 1) }, (_u, i) => i);
    };
    a.chooseCastNowFn = (_v, offer) =>
      offer.cards.includes(giant) ? { type: "cast-spell", player: A, card: giant, targets: [], via: "effect", free: true } : null;
    const before = hand(game, A).length;
    attack(game, a, [marvo], C);
    expect(modesAsked).toBe(0);
    // Drew a card (the Hill Giant left on top), then cast the Dreadmaw free.
    expect(zone(game, giant)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before);
  });

  it("no win, no draw", () => {
    const { game, a } = table({ players: 3 });
    const marvo = spawn(game, "Marvo, Deep Operative", A);
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Hill Giant", C);
    const before = hand(game, A).length;
    attack(game, a, [marvo], C);
    expect(hand(game, A).length).toBe(before);
  });
});
