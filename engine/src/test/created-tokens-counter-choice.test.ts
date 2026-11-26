/**
 * "Create two tokens. For each of them, put your choice of a … counter on
 * it": a `for-each-permanent` over `thisWay: "created"` with a `modal` per
 * token (Invoke the Ancients) — a choice for each token made, a replacement's
 * extra tokens included (its first ruling).
 */
import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, named, pt, settle, spawn, table, toHand, tokensNamed } from "./harness.js";

const SPIRIT = "Spirit Token (Green 4/5)";

describe("Invoke the Ancients", () => {
  it("makes two 4/5 Spirits, a counter chosen for each separately", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [asked === 1 ? 0 : 2];
    };
    cast(game, toHand(game, "Invoke the Ancients"));
    settle(game);
    expect(asked).toBe(2);
    expect(tokensNamed(game, SPIRIT, A)).toBe(2);
    const spirits = named(game, SPIRIT, A);
    expect(pt(game, spirits[0])).toEqual({ power: 4, toughness: 5 });
    const kinds = spirits.map((id) => ["reach", "vigilance", "trample"].filter((k) => counters(game, id, k) > 0).join());
    expect(kinds.sort()).toEqual(["reach", "trample"]);
  });

  it("asks once for each token a replacement makes (Parallel Lives: four)", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    spawn(game, "Parallel Lives");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    cast(game, toHand(game, "Invoke the Ancients"));
    settle(game);
    expect(asked).toBe(4);
    expect(tokensNamed(game, SPIRIT, A)).toBe(4);
    const spirits = named(game, SPIRIT, A);
    expect(spirits.every((id) => counters(game, id, "vigilance") === 1)).toBe(true);
  });
});
