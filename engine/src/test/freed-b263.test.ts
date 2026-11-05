/**
 * Batch 263, the lead's cards: Pure Intentions, whose "this turn, whenever an
 * opponent's spell or ability causes you to discard" watch an agent wrote
 * without its `who` and so saw never fire.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Game } from "../game.js";
import type { GameObject } from "../state.js";
import { A, activate, B, cast, hand, lands, life, nextTurn, pickPermanents, pt, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const prefer =
  (...ids: readonly ObjectId[]) =>
  (h: readonly GameObject[], n: number): ObjectId[] =>
    [...ids.filter((id) => h.some((o) => o.id === id)), ...h.map((o) => o.id).filter((id) => !ids.includes(id))].slice(0, n);

const mindRot = (game: Game, caster: PlayerId, victim: PlayerId): void => {
  lands(game, "Swamp", 3, caster);
  cast(game, toHand(game, "Mind Rot", caster), { player: caster, targets: [ref(victim)] });
};

describe("Pure Intentions", () => {
  it("returns the cards an opponent's spell makes you discard this turn, not your own discards", () => {
    const { game, a } = table({ deck: "Swamp" });
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    lands(game, "Plains", 1);
    nextTurn(game);
    // On bob's turn: he passes, alice casts it, then his Mind Rot.
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Pure Intentions"));
    a.chooseDiscardsFn = prefer(bears, giant);
    mindRot(game, B, A);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");

    const own = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = prefer(own);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(zone(game, own)).toBe("graveyard");
  });

  it("the watch lasts only this turn", () => {
    const { game, a } = table({ deck: "Swamp" });
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Pure Intentions"));
    nextTurn(game);
    a.chooseDiscardsFn = prefer(bears);
    mindRot(game, B, A);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("discarded itself by an opponent's spell, it comes back at the next end step", () => {
    const { game, a } = table({ deck: "Swamp" });
    const pure = toHand(game, "Pure Intentions");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(pure);
    mindRot(game, B, A);
    expect(zone(game, pure)).toBe("graveyard");
    nextTurn(game);
    expect(zone(game, pure)).toBe("hand");
  });
});

describe("a `nextSpell` delayed trigger reads its source's chosen name", () => {
  it("fires on a spell with the name its source chose, not on another", () => {
    const { game } = table({ deck: "Island" });
    const source = spawn(game, "Grizzly Bears");
    game.state.objects[source].chosenNames = ["Opt"];
    game.debugApplyEffect(
      A,
      { kind: "delayed-trigger", at: { nextSpell: { chosenName: true } }, effect: { kind: "draw", amount: 2 }, text: "Draw two cards." },
      [],
      { source },
    );
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Brainstorm"), {});
    expect(game.state.delayedTriggers.length).toBe(1);
    const afterOther = hand(game).length;
    cast(game, toHand(game, "Opt"));
    // Opt's own draw, plus the delayed trigger's two.
    expect(hand(game).length).toBe(afterOther + 1 + 2);
    expect(game.state.delayedTriggers.length).toBe(0);
    expect(afterOther).toBeGreaterThan(before);
  });
});

describe("Hand of Vecna: choose-permanents reads its source", () => {
  it("offers the equipped creature (and only it) at the beginning of combat; +X/+X for the cards in hand", () => {
    const { game, a } = table({ deck: "Island" });
    const handOf = spawn(game, "Hand of Vecna");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    toHand(game, "Island");
    toHand(game, "Island");
    // Equip—pay 1 life per card in hand.
    const inHand = hand(game).length;
    activate(game, handOf, 0, { targets: [ref(bears)] });
    expect(life(game)).toBe(20 - inHand);
    const seen = pickPermanents(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toEqual([bears]);
    expect(pt(game, bears)).toEqual({ power: 2 + hand(game).length, toughness: 2 + hand(game).length });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
  });
});
