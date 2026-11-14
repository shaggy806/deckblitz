/**
 * Choosing a permanent or a player as an effect resolves, untargeted — the
 * `choose-permanent-or-player` decision (a `choose-permanents` effect's
 * `orPlayers`) — and "N more" loyalty activations this turn (the
 * `loyalty-activations` effect's `{ more }`), both on Comet, Stellar Pup.
 * The die comes from the game's seeded stream, so each case finds a seed
 * that rolls the face it's about.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { lastRollIn } from "../random-results.js";

import { A, B, grant, hand, life, loyalty, ref, spawn, table, toGraveyard, tokensNamed } from "./harness.js";
import type { ScriptedController } from "../controller.js";

interface Rolled {
  readonly game: Game;
  readonly a: ScriptedController;
  readonly comet: ObjectId;
  readonly bears: ObjectId;
  readonly offered: TargetRef[];
}

/** A board where Comet's 0 rolls `face`, the answer `pick` given to a
 * creature-or-player choice. */
function rolled(face: number, pick: (r: { bears: ObjectId; comet: ObjectId }) => TargetRef, setup?: (game: Game) => void): Rolled {
  for (let seed = 1; seed < 400; seed += 1) {
    const { game, a } = table({ seed });
    const comet = spawn(game, "Comet, Stellar Pup");
    const bears = spawn(game, "Grizzly Bears", B);
    setup?.(game);
    const offered: TargetRef[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offered.push(...offer.eligible);
      return pick({ bears, comet });
    };
    loyalty(game, comet, 0);
    if (lastRollIn(game.state)?.total === face) return { game, a, comet, bears, offered };
  }
  throw new Error(`no seed rolls a ${face}`);
}

const loyaltyOf = (game: Game, id: ObjectId): number => game.state.objects[id].counters.loyalty ?? 0;

describe("Comet, Stellar Pup", () => {
  it("1 or 2: two loyalty, then two hasty Squirrels", () => {
    const { game, comet } = rolled(1, () => ref(B));
    expect(loyaltyOf(game, comet)).toBe(7);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("3: one loyalty off, then a card of mana value 2 or less back to hand — chosen, not targeted", () => {
    let bolt: ObjectId | undefined;
    const { game, comet } = rolled(3, () => ref(B), (g) => {
      bolt = toGraveyard(g, "Lightning Bolt");
      toGraveyard(g, "Hill Giant");
    });
    expect(loyaltyOf(game, comet)).toBe(4);
    expect(hand(game)).toContain(bolt);
  });

  it("4 or 5: damage equal to his loyalty to a player chosen as it resolves, then −2", () => {
    const { game, comet, offered, bears } = rolled(4, () => ref(B));
    expect(life(game, B)).toBe(15);
    expect(loyaltyOf(game, comet)).toBe(3);
    // Every creature and every player, Comet's own controller too.
    expect(offered).toEqual(expect.arrayContaining([ref(A), ref(B), ref(bears)]));
    expect(offered.some((r) => r.kind === "object" && r.object === comet)).toBe(false);
  });

  it("4 or 5: a hexproof creature can be chosen — it isn't a target", () => {
    const { game, bears } = rolled(5, ({ bears }) => ref(bears), (g) => {
      for (const id of g.state.zones.shared.battlefield) {
        if (g.state.objects[id].cardName === "Grizzly Bears") grant(g, id, "hexproof");
      }
    });
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("4 or 5 with one loyalty: 1 damage, and the last counter goes", () => {
    const { game } = rolled(4, () => ref(B), (g) => {
      const id = g.state.zones.shared.battlefield.find((x) => g.state.objects[x].cardName === "Comet, Stellar Pup")!;
      g.state.objects[id].counters.loyalty = 1;
    });
    expect(life(game, B)).toBe(19);
    expect(game.state.zones.perPlayer[A].graveyard.some((id) => game.state.objects[id].cardName === "Comet, Stellar Pup")).toBe(true);
  });

  it("6: +1, and his ability twice more this turn — not a fourth time", () => {
    const { game, comet } = rolled(6, () => ref(B));
    expect(loyaltyOf(game, comet)).toBe(6);
    game.state.objects[comet].counters.loyalty = 10;
    loyalty(game, comet, 0);
    loyalty(game, comet, 0);
    // Each roll's 6 adds its own two; this seed's later rolls aren't 6s.
    const sixes = game.state.eventLog.filter((e) => e.type === "dice-rolled" && e.results[0] === 6).length;
    expect(sixes).toBe(1);
    expect(() => loyalty(game, comet, 0)).toThrow(/already been activated/);
  });

  it("6 twice: each adds its own two more", () => {
    const { game, comet } = rolled(6, () => ref(B));
    // As though a second 6 had resolved: two more on top.
    game.state.objects[comet].modifiers.push({
      timestamp: 0,
      power: 0,
      toughness: 0,
      keywords: [],
      loyaltyActivationsMore: 2,
      untilEndOfTurn: true,
    });
    game.state.objects[comet].counters.loyalty = 20;
    for (let i = 0; i < 4; i += 1) loyalty(game, comet, 0, { atLeast: 10 });
  });

  it("without a 6, once a turn (rule 606.3)", () => {
    const { game, comet } = rolled(2, () => ref(B));
    expect(() => loyalty(game, comet, 0)).toThrow(/already been activated/);
  });
});
