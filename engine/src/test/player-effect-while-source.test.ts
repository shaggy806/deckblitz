/**
 * A player effect that lasts "for as long as you control [this]" (rule
 * 611.2b): `PlayerDuration`'s `"while-you-control-source"` and
 * `"while-source"`, kept as `Expiry`'s `whileSource` and ended by
 * `Game.endPlayerWhileSource` as the source leaves or changes hands — for
 * good. Jin-Gitaxias // The Great Synthesis is the card that waited on it
 * ("you have no maximum hand size for as long as you control this Saga"),
 * and is played here through both faces.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { resolvePlayerDuration } from "../duration.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const faceOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const flip = (game: Game, id: ObjectId) =>
  game.canDispatch({ type: "activate-ability", player: A, source: id, abilityIndex: 0, targets: [] });

/** Alice with Jin-Gitaxias, four Islands, a real hand limit of seven and
 * exactly `cards` Wastes in hand. */
function withJin(cards: number): { game: Game; a: ScriptedController; b: ScriptedController; jin: ObjectId } {
  const { game, a, b } = table();
  game.state.players[A].maxHandSize = 7;
  game.state.players[B].maxHandSize = 7;
  game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
  settle(game);
  while (hand(game).length < cards) toHand(game, "Wastes");
  const jin = spawn(game, "Jin-Gitaxias");
  lands(game, "Island", 4);
  return { game, a, b, jin };
}

/** The Great Synthesis with chapter I resolved from a hand of seven. */
function synthesized(): ReturnType<typeof withJin> {
  const made = withJin(7);
  activate(made.game, made.jin, 0);
  expect(faceOf(made.game, made.jin)).toBe("The Great Synthesis");
  expect(hand(made.game).length).toBe(14);
  return made;
}

/** Cast every card the seat is offered by an effect, in order. */
function castAllOffered(seat: ScriptedController): { offered: string[] } {
  const seen = { offered: [] as string[] };
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.via === "effect");
    if (way === undefined) return null;
    seen.offered.push(way.cardName);
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, free: true };
  };
  return seen;
}

describe("a player effect for as long as its source remains", () => {
  it("resolvePlayerDuration reads the source, and makes nothing when it's already gone", () => {
    const here = { id: "o1" as ObjectId, zoneChangeCount: 2, controller: A };
    const nobody = (): undefined => undefined;
    expect(resolvePlayerDuration("while-you-control-source", A, nobody, () => here)).toEqual({ expires: { whileSource: here } });
    expect(resolvePlayerDuration("while-source", A, nobody, () => null)).toBeUndefined();
  });

  it('"while-source" outlasts a change of control and ends as the source leaves', () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "player-effect", duration: "while-source", noMaxHandSize: "you" }, [], { source });
    expect(game.state.playerEffects?.length).toBe(1);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(source)]);
    settle(game);
    expect(game.state.objects[source].controller).toBe(B);
    expect(game.state.playerEffects?.length).toBe(1);
    destroy(game, source, A);
    expect(game.state.playerEffects ?? []).toEqual([]);
  });

  it("a timed static lasts while you control its source, too", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      {
        kind: "timed-static",
        duration: "while-you-control-source",
        static: [{ affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." }],
        text: "You have no maximum hand size for as long as you control this.",
      },
      [],
      { source },
    );
    const timed = (): number => game.state.emblems.filter((e) => e.expires !== undefined).length;
    expect(timed()).toBe(1);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(source)]);
    settle(game);
    expect(timed()).toBe(0);
  });
});

describe("Jin-Gitaxias", () => {
  it("draws for a noncreature spell with mana value 3 or greater, and no other", () => {
    const { game } = withJin(0);
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    const opt = toHand(game, "Opt");
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    cast(game, divination);
    // Divination's two, and Jin-Gitaxias's one.
    expect(hand(game).length).toBe(2 + 3);
    cast(game, bears);
    expect(hand(game).length).toBe(4);
    cast(game, opt);
    // Opt's own card only: mana value 1.
    expect(hand(game).length).toBe(4);
  });

  it("has ward {2}: an opponent's spell that targets it is countered unless they pay", () => {
    const { game, jin } = withJin(0);
    toStep(game, "precombat-main", B);
    lands(game, "Swamp", 2, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(jin)] });
    expect(zone(game, jin)).toBe("battlefield");
  });

  it("transforms only as a sorcery with seven or more cards in hand", () => {
    const six = withJin(6);
    expect(flip(six.game, six.jin)).not.toBeNull();
    toHand(six.game, "Wastes");
    expect(flip(six.game, six.jin)).toBeNull();
    toStep(six.game, "upkeep", B);
    six.game.advanceUntil((s) => s.priority.holder === A);
    expect(flip(six.game, six.jin)).not.toBeNull();
  });
});

describe("The Great Synthesis", () => {
  it("chapter I doubles the hand, and there's no maximum hand size while you control the Saga", () => {
    const { game, jin } = synthesized();
    expect(game.state.objects[jin].counters.lore).toBe(1);
    toStep(game, "precombat-main", B);
    // Fourteen kept through alice's cleanup step.
    expect(hand(game).length).toBe(14);
    expect(faceOf(game, jin)).toBe("The Great Synthesis");
  });

  it("the effect ends as the Saga leaves the battlefield", () => {
    const { game, jin } = synthesized();
    expect(game.state.playerEffects?.length).toBe(1);
    destroy(game, jin);
    expect(game.state.playerEffects ?? []).toEqual([]);
    toStep(game, "precombat-main", B);
    expect(hand(game).length).toBe(7);
  });

  it("the effect ends for good as the Saga changes hands, even if it comes back", () => {
    const { game, jin } = synthesized();
    toStep(game, "precombat-main", B);
    // Bob takes it for the turn: he has no such effect, and alice's is over.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(jin)]);
    settle(game);
    expect(game.state.objects[jin].controller).toBe(B);
    expect(game.state.playerEffects ?? []).toEqual([]);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(game.state.objects[jin].controller).toBe(A);
    expect(hand(game).length).toBeGreaterThan(7);
    toStep(game, "precombat-main", B);
    expect(hand(game).length).toBe(7);
  });

  it("does nothing if the Saga has left before chapter I resolves (rule 611.2b)", () => {
    const { game, jin } = withJin(7);
    activate(game, jin, 0, { settle: false });
    game.advanceUntil((s) => printedCardName(s.objects[jin]) === "The Great Synthesis" && s.zones.shared.stack.length === 1);
    destroy(game, jin);
    // The cards are still drawn; the hand-size effect never begins.
    expect(hand(game).length).toBe(14);
    expect(game.state.playerEffects ?? []).toEqual([]);
  });

  it("chapter II returns every non-Phyrexian creature to its owner's hand", () => {
    const { game, jin } = synthesized();
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Gray Ogre", B);
    const praetor = spawn(game, "Vorinclex", B);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(game.state.objects[jin].counters.lore).toBe(2);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ogre)).toBe("hand");
    expect(zone(game, praetor)).toBe("battlefield");
  });

  it("chapter III casts any number of spells from hand free, then returns as Jin-Gitaxias", () => {
    const { game, a, jin } = synthesized();
    toStep(game, "precombat-main", A);
    settle(game);
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    const casts = castAllOffered(a);
    // Chapter III on her next turn: only these two can be cast (the rest are lands).
    toStep(game, "precombat-main", A);
    settle(game);
    expect([...casts.offered].sort()).toEqual(["Divination", "Grizzly Bears"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, divination)).toBe("graveyard");
    // Back front face up, a creature again with no lore counters; the
    // hand-size effect went with the Saga.
    expect(faceOf(game, jin)).toBe("Jin-Gitaxias");
    expect(zone(game, jin)).toBe("battlefield");
    expect(game.state.objects[jin].counters.lore ?? 0).toBe(0);
    expect(game.state.playerEffects ?? []).toEqual([]);
    // The turn's draw, less the two cast, plus Divination's two and Jin's none
    // (it wasn't on the battlefield as Divination was cast).
    expect(hand(game).length).toBe(before + 1 - 2 + 2);
  });
});
