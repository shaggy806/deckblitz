/**
 * "Add three mana in any combination of its colors" — an `add-mana`'s
 * `{ colorsOfTarget }`, the colours of the card a `look-and-choose` chose —
 * on Omnath, Locus of All (top-500 commander): its first-main-phase look,
 * the reveal only of a card with three or more coloured symbols, and the
 * unspent mana kept as black.
 */

import { describe, expect, it } from "vitest";

import { A, hand, settle, spawn, table, toLibrary, toStep } from "./harness.js";

const OMNATH = "Omnath, Locus of All";

/** Alice's board at turn 1's upkeep: Omnath, and `top` under one Wastes
 * (her draw step takes the Wastes), then on to her first main phase. */
function lookAt(top: string, opts: { reveal: boolean; mode?: string } = { reveal: true }) {
  const t = table({ step: "upkeep" });
  spawn(t.game, OMNATH, A);
  const card = toLibrary(t.game, top, A);
  toLibrary(t.game, "Wastes", A);
  let asked = 0;
  t.a.chooseFromZoneFn = (_view, eligible) => (opts.reveal ? [...eligible] : []);
  t.a.chooseModesFn = (_view, _min, _max, texts) => {
    asked += 1;
    const i = opts.mode === undefined ? 0 : texts.indexOf(opts.mode);
    if (i < 0) throw new Error(`no mode "${opts.mode}" in ${texts.join(" | ")}`);
    return [i];
  };
  toStep(t.game, "precombat-main", A);
  settle(t.game);
  const pool = (): string =>
    t.game.state.players[A].manaPool
      .map((unit) => unit.type)
      .sort()
      .join("");
  return { ...t, card, pool, asked: () => asked };
}

describe("Omnath, Locus of All", () => {
  it("reveals a three-coloured card and adds three mana in the combination chosen, the card to hand", () => {
    const { game, card, pool } = lookAt("Mantis Rider", { reveal: true, mode: "Add {W}{R}{R}." });
    expect(hand(game, A)).toContain(card);
    expect(pool()).toBe("RRW");
  });

  it("offers only that card's colours", () => {
    const seen: string[][] = [];
    const t = table({ step: "upkeep" });
    spawn(t.game, OMNATH, A);
    toLibrary(t.game, "Mantis Rider", A);
    toLibrary(t.game, "Wastes", A);
    t.a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    t.a.chooseModesFn = (_view, _min, _max, texts) => {
      seen.push([...texts]);
      return [0];
    };
    toStep(t.game, "precombat-main", A);
    settle(t.game);
    // {U}{R}{W}, three units: every split over those three colours, ten of them.
    expect(seen).toHaveLength(1);
    expect(seen[0]).toHaveLength(10);
    expect(seen[0].every((text) => !/\{[BGC]\}/.test(text))).toBe(true);
  });

  it("adds a one-coloured card's colour with nothing to choose", () => {
    const { game, card, pool, asked } = lookAt("Ball Lightning");
    expect(hand(game, A)).toContain(card);
    expect(pool()).toBe("RRR");
    expect(asked()).toBe(0);
  });

  it("can't reveal a card with fewer than three coloured symbols: no mana, the card still to hand", () => {
    // {1}{G}{W}: two coloured symbols.
    const { game, card, pool } = lookAt("Knight of the Reliquary");
    expect(hand(game, A)).toContain(card);
    expect(pool()).toBe("");
  });

  it("may decline to reveal: no mana, the card to hand", () => {
    const { game, card, pool } = lookAt("Ball Lightning", { reveal: false });
    expect(hand(game, A)).toContain(card);
    expect(pool()).toBe("");
  });

  it("keeps the unspent mana past the phase, as black", () => {
    const { game, pool } = lookAt("Ball Lightning");
    expect(pool()).toBe("RRR");
    toStep(game, "begin-combat", A);
    expect(game.state.turn.step).toBe("begin-combat");
    expect(pool()).toBe("BBB");
  });
});
