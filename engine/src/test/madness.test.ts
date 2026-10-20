/**
 * Madness (rule 702.35): a discarded card with madness is exiled instead of put into the
 * graveyard; its trigger then lets its owner cast it for its madness cost (an alternative cost —
 * 702.35b), ignoring timing, or puts it into the graveyard. Every way to discard: an effect's,
 * a cost's, the cleanup step's, the 101.4 hold's release.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  hand,
  keywords,
  lands,
  nextTurn,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** The seat casts the madness card it's offered (with these targets), or declines with `null`. */
function castMadness(seat: ScriptedController, targets: readonly ObjectId[] | null): { offered: string[] } {
  const seen = { offered: [] as string[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.casts.map((c) => c.cardName).join(","));
    if (targets === null) return null;
    const way = offer.casts[0]!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: targets.map((object) => ({ kind: "object" as const, object })),
      via: way.via,
    };
  };
  return seen;
}

const discard = (game: Game, player = A) => {
  game.debugApplyEffect(player, { kind: "discard", target: "you", amount: 1 });
  settle(game);
};

describe("madness (rule 702.35)", () => {
  it("a discarded madness card is exiled, and its owner may cast it for its madness cost", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = () => [imp];
    const seen = castMadness(a, []);
    discard(game);
    expect(seen.offered).toEqual(["Kitchen Imp"]);
    expect(zone(game, imp)).toBe("battlefield");
    // Paid {B}, not {3}{B}.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
  });

  it("declined, it goes to its owner's graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = () => [imp];
    castMadness(a, null);
    discard(game);
    expect(zone(game, imp)).toBe("graveyard");
  });

  it("with no way to pay, it isn't offered and goes to the graveyard", () => {
    const { game, a } = table();
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = () => [imp];
    const seen = castMadness(a, []);
    discard(game);
    expect(seen.offered).toEqual([]);
    expect(zone(game, imp)).toBe("graveyard");
  });

  it("a sorcery cast with madness on an opponent's turn, with its targets", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Swamp", 1, B);
    lands(game, "Mountain", 1, B);
    toStep(game, "precombat-main", A);
    const agony = toHand(game, "Terminal Agony", B);
    b.chooseDiscardsFn = () => [agony];
    castMadness(b, [giant]);
    discard(game, B);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, agony)).toBe("graveyard");
  });

  it("the cleanup step's discard to hand size is a discard too", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    game.state.players[A].maxHandSize = 7;
    while (game.state.zones.perPlayer[A].hand.length < 8) toHand(game, "Wastes");
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = (hand, count) => [imp, ...hand.map((o) => o.id).filter((id) => id !== imp)].slice(0, count);
    castMadness(a, []);
    toStep(game, "precombat-main", B);
    expect(zone(game, imp)).toBe("battlefield");
  });

  it("a discard the 101.4 hold releases is exiled by madness too", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const imp = toHand(game, "Kitchen Imp");
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [imp];
    castMadness(a, []);
    game.debugApplyEffect(A, {
      kind: "each-player-may",
      who: "each-player",
      options: [{ discard: 1, text: "Discard a card" }],
      ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
    });
    settle(game);
    expect(zone(game, imp)).toBe("battlefield");
  });
});

describe("the madness cards", () => {
  it("Hell Mongrel's discard cost puts a madness card into exile and offers it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const mongrel = spawn(game, "Hell Mongrel");
    const imp = toHand(game, "Kitchen Imp");
    a.chooseDiscardsFn = () => [imp];
    castMadness(a, []);
    activate(game, mongrel);
    expect(zone(game, imp)).toBe("battlefield");
    expect(pt(game, mongrel)).toEqual({ power: 5, toughness: 4 });
  });

  it("Necrogoyf: power is the creature cards in all graveyards; each upkeep its player discards", () => {
    const { game } = table();
    const goyf = spawn(game, "Necrogoyf");
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Shock", B);
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 4 });
    const before = hand(game, B).length;
    nextTurn(game, "draw");
    expect(hand(game, B).length).toBe(before);
  });

  it("Stensia Masquerade: attacking creatures you control have first strike", () => {
    const { game, a } = table();
    spawn(game, "Stensia Masquerade");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});
