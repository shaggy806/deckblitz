/**
 * "Whenever an opponent casts a spell or activates an ability, if mana from a
 * Treasure was spent to cast it or activate it" (Vazi, Keen Negotiator): the
 * `activates-ability` trigger's `manaSpent`, read off the mana that paid the
 * ability's own cost (rules 602.2b, 601.2h) — a mana ability's too (605.3a),
 * whether activated by hand or by the auto-payer funding a Signet with a
 * Treasure — and the cast trigger's `CardFilter.manaSpent`. And Vazi's "{T}:
 * Target opponent creates X Treasure tokens, where X is the number of
 * Treasure tokens you created this turn".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  counters,
  hand,
  lands,
  named,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
} from "./harness.js";

const treasures = (game: Game, player: PlayerId, n: number): ObjectId[] => {
  const before = new Set(named(game, "Treasure Token", player));
  game.debugApplyEffect(player, { kind: "create-token", token: "Treasure Token", count: n, separate: true }, []);
  settle(game);
  return named(game, "Treasure Token", player).filter((id) => !before.has(id));
};

/** Vazi and a Bear on A's side, then B's turn. */
const setUp = () => {
  const t = table();
  spawn(t.game, "Vazi, Keen Negotiator", A);
  const bears = spawn(t.game, "Grizzly Bears", A);
  nextTurn(t.game);
  pickTargets(t.a, bears);
  return { ...t, bears, drawn: hand(t.game, A).length };
};

describe("Vazi, Keen Negotiator's trigger", () => {
  it("an opponent's spell paid with a Treasure's mana: a counter and a card", () => {
    const { game, bears, drawn } = setUp();
    treasures(game, B, 1);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game, A).length).toBe(drawn + 1);
  });

  it("nothing for a spell paid from a land", () => {
    const { game, bears, drawn } = setUp();
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(counters(game, bears)).toBe(0);
    expect(hand(game, A).length).toBe(drawn);
  });

  it("an opponent's ability paid with a Treasure's mana", () => {
    const { game, bears, drawn } = setUp();
    const shivan = spawn(game, "Shivan Dragon", B);
    treasures(game, B, 1);
    activate(game, shivan, 0, { player: B });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game, A).length).toBe(drawn + 1);
  });

  it("a mana ability whose cost a Treasure's mana paid, activated by hand", () => {
    const { game, bears, drawn } = setUp();
    const [treasure] = treasures(game, B, 1);
    const signet = spawn(game, "Boros Signet", B);
    // The Treasure's own mana ability spends no mana: nothing.
    activate(game, treasure, 0, { player: B });
    expect(counters(game, bears)).toBe(0);
    activate(game, signet, 0, { player: B });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game, A).length).toBe(drawn + 1);
  });

  it("a Signet the auto-payer funds with a Treasure: once, for the Signet, not the spell its mana paid", () => {
    const { game, bears, drawn } = setUp();
    treasures(game, B, 1);
    spawn(game, "Boros Signet", B);
    cast(game, toHand(game, "Lightning Helix", B), { player: B, targets: [ref(A)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game, A).length).toBe(drawn + 1);
  });

  it("not for its controller's own spells", () => {
    const { game } = table();
    spawn(game, "Vazi, Keen Negotiator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    treasures(game, A, 1);
    cast(game, toHand(game, "Lightning Bolt", A), { targets: [ref(B)] });
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Vazi, Keen Negotiator's {T}", () => {
  it("gives the opponent a Treasure for each one you created this turn, a sacrificed one too", () => {
    const { game } = table();
    const vazi = spawn(game, "Vazi, Keen Negotiator", A);
    const [first] = treasures(game, A, 2);
    treasures(game, B, 1);
    activate(game, first, 0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    activate(game, vazi, 0, { targets: [ref(B)] });
    expect(tokensNamed(game, "Treasure Token", B)).toBe(3);
  });
});
