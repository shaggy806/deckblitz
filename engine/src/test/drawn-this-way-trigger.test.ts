/**
 * "Whenever a card is drawn this way, … deals 5 damage to target opponent
 * chosen at random" (Explosion of Riches): a `reflexive-trigger` (rule 603.12)
 * with `times: { thisWay: "drawn" }` — one ability a card drawn while the
 * spell resolved, whoever drew it — and `targetsAtRandom`, each ability's
 * target picked by the game as it's put on the stack (rule 603.3d).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, hand, lands, life, pickModes, table, toHand } from "./harness.js";

describe("Explosion of Riches", () => {
  it("one 5-damage ability for each card drawn, each at an opponent", () => {
    const { game, b, c, d } = table({ players: 4 });
    lands(game, "Mountain", 6);
    const before = [A, B, C, D].map((p) => hand(game, p).length);
    pickModes(b, 0); // draws
    pickModes(c); // declines
    pickModes(d, 0); // draws
    cast(game, toHand(game, "Explosion of Riches"));
    // Counted before the spell was put in her hand: Alice drew one, Bob and
    // Dave one each — three abilities.
    expect([A, B, C, D].map((p, i) => hand(game, p).length - before[i])).toEqual([1, 1, 0, 1]);
    expect(life(game, A)).toBe(20);
    const lost = [B, C, D].map((p) => 20 - life(game, p));
    expect(lost.reduce((n, x) => n + x, 0)).toBe(15);
    expect(lost.every((x) => x % 5 === 0)).toBe(true);
  });

  it("nobody else drawing: one ability, at the only opponent", () => {
    const { game } = table({ players: 2 });
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Explosion of Riches"));
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });

  it("each ability picks its own opponent at random", () => {
    const hit = new Set<string>();
    for (let seed = 1; seed <= 8; seed++) {
      const { game, b, c } = table({ players: 3, seed });
      lands(game, "Mountain", 6);
      pickModes(b, 0);
      pickModes(c, 0);
      cast(game, toHand(game, "Explosion of Riches"));
      expect(20 - life(game, B) + (20 - life(game, C))).toBe(15);
      for (const p of [B, C]) hit.add(`${p}:${20 - life(game, p)}`);
    }
    // Over eight games the 15 damage isn't always split the same way.
    expect(hit.size).toBeGreaterThan(2);
  });
});
