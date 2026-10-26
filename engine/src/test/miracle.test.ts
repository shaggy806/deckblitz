/**
 * Miracle (rule 702.94): the first card a player draws in a turn, if it has
 * miracle, may be revealed (the `miracle-reveal` decision, asked as its
 * trigger would be placed); revealed, its trigger lets its owner cast it for
 * its miracle cost — an alternative cost — ignoring timing. On any turn;
 * only the first draw; a card that has left the hand isn't offered.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { EffectSpec } from "../effects.js";
import { viewFor } from "../view.js";

import { A, B, cast, hand, lands, life, ref, settle, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

/** The seat casts what it's offered (at these targets, with this X), or declines with `null`. */
function castOffered(
  seat: ScriptedController,
  targets: readonly (ObjectId | PlayerId)[] | null,
  xValue?: number,
): { offered: string[]; costs: (string | undefined)[] } {
  const seen = { offered: [] as string[], costs: [] as (string | undefined)[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.casts.map((c) => c.cardName).join(","));
    seen.costs.push(offer.miracle);
    if (targets === null) return null;
    const way = offer.casts[0]!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: targets.map((t) =>
        typeof t === "string" && (t === A || t === B)
          ? { kind: "player" as const, player: t as PlayerId }
          : { kind: "object" as const, object: t as ObjectId },
      ),
      via: way.via,
      ...(xValue !== undefined ? { xValue } : {}),
    };
  };
  return seen;
}

/** `player` draws `n` as an effect, as their first draws this turn. */
const draw = (game: Game, player: PlayerId, n = 1, then?: EffectSpec): void => {
  game.state.players[player].cardsDrawnThisTurn = 0;
  const effect: EffectSpec = { kind: "draw", amount: n };
  game.debugApplyEffect(player, then === undefined ? effect : { kind: "sequence", effects: [effect, then] });
  settle(game);
};

describe("miracle (rule 702.94)", () => {
  it("revealed as the first draw, it's cast for its miracle cost", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const wrath = toLibrary(game, "Thunderous Wrath");
    const seen = castOffered(a, [B]);
    draw(game, A);
    expect(seen.offered).toEqual(["Thunderous Wrath"]);
    expect(seen.costs).toEqual(["{R}"]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, wrath)).toBe("graveyard");
  });

  it("only the first card drawn this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const wrath = toLibrary(game, "Thunderous Wrath");
    toLibrary(game, "Wastes");
    const seen = castOffered(a, [B]);
    draw(game, A, 2);
    expect(seen.offered).toEqual([]);
    expect(hand(game)).toContain(wrath);
  });

  it("kept hidden, there's no trigger and it stays a hidden card in hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const wrath = toLibrary(game, "Thunderous Wrath");
    a.revealMiracleFn = () => false;
    const seen = castOffered(a, [B]);
    draw(game, A);
    expect(seen.offered).toEqual([]);
    expect(hand(game)).toContain(wrath);
    expect(game.state.revealedThisTurn).not.toContain(wrath);
  });

  it("declining the cast leaves it in hand, revealed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const wrath = toLibrary(game, "Thunderous Wrath");
    const seen = castOffered(a, null);
    draw(game, A);
    expect(seen.offered).toEqual(["Thunderous Wrath"]);
    expect(hand(game)).toContain(wrath);
    expect(game.state.revealedThisTurn).toContain(wrath);
  });

  it("a card that left the hand before its trigger isn't offered (rule 400.7)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const wrath = toLibrary(game, "Thunderous Wrath");
    a.chooseDiscardsFn = () => [wrath];
    const seen = castOffered(a, [B]);
    draw(game, A, 1, { kind: "discard", target: "you", amount: 1 });
    expect(seen.offered).toEqual([]);
    expect(zone(game, wrath)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("on an opponent's turn, a sorcery, ignoring timing — X in the miracle cost", () => {
    const { game, b } = table();
    toStep(game, "precombat-main", A);
    lands(game, "Mountain", 3, B);
    const bear = spawn(game, "Grizzly Bears", A);
    const ogre = spawn(game, "Hill Giant", A);
    const bonfire = toLibrary(game, "Bonfire of the Damned", B);
    castOffered(b, [A], 2);
    draw(game, B);
    expect(zone(game, bonfire)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("the question doesn't name the card, or its cost, to anyone else", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    toLibrary(game, "Thunderous Wrath");
    let asked = false;
    a.revealMiracleFn = () => {
      asked = true;
      const other = viewFor(game.state, game.registry, B);
      expect(other.awaiting).toMatchObject({ kind: "miracle-reveal", cost: "" });
      expect(other.decisionSource).toBeNull();
      expect(viewFor(game.state, game.registry, A).awaiting).toMatchObject({ kind: "miracle-reveal", cost: "{R}" });
      return false;
    };
    draw(game, A);
    expect(asked).toBe(true);
  });

  it("Bonfire at a planeswalker hits each creature its controller controls", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    game.state.objects[walker].counters = { loyalty: 4 };
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const bonfire = toHand(game, "Bonfire of the Damned");
    cast(game, bonfire, { targets: [ref(walker)], x: 1 });
    expect(game.state.objects[walker].counters?.loyalty).toBe(3);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].damageMarked).toBe(1);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});
