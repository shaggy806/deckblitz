/**
 * "You may reveal the first card you draw each turn as you draw it. Whenever
 * you reveal an instant or sorcery card this way, copy that card and you may
 * cast the copy. That copy costs {2} less to cast" (God-Eternal Kefnet): a
 * `revealsDrawn` draw trigger, asked through the `miracle-reveal` question
 * (with `by`, no cost) before it's placed; the copy made in hand
 * (`cast-now`'s `copiesIn`) and cast for {2} less (`reduce`). Written from
 * the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, destroy, hand, lands, settle, setTurnTotal, spawn, table, toLibrary, zone } from "./harness.js";

/** The seat casts the first way it's offered, or declines with `null`;
 * what it was offered, by name. */
function castOffered(seat: ScriptedController, cast: boolean): { offered: string[]; copies: boolean[] } {
  const seen = { offered: [] as string[], copies: [] as boolean[] };
  seat.chooseCastNowFn = (view, offer) => {
    seen.offered.push(offer.casts.map((c) => c.cardName).join(","));
    seen.copies.push(offer.casts.every((c) => view.state.objects[c.card]?.isCopy === true));
    if (!cast) return null;
    const way = offer.casts[0]!;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via };
  };
  return seen;
}

/** `player` draws `n` as an effect, as their first draws this turn. */
const draw = (game: Game, player: PlayerId, n = 1, then?: EffectSpec): void => {
  setTurnTotal(game.state, player, "card-drawn", 0);
  const effect: EffectSpec = { kind: "draw", amount: n };
  game.debugApplyEffect(player, then === undefined ? effect : { kind: "sequence", effects: [effect, then] });
  settle(game);
};

/** Counts the reveal questions; answers each with `reveal`. */
function asks(seat: ScriptedController, reveal: boolean): { count: number; costs: (string | undefined)[] } {
  const seen = { count: 0, costs: [] as (string | undefined)[] };
  seat.revealMiracleFn = (_view, _card, cost) => {
    seen.count += 1;
    seen.costs.push(cost);
    return reveal;
  };
  return seen;
}

describe("God-Eternal Kefnet", () => {
  it("a revealed first-drawn sorcery is copied in hand, and the copy cast for {2} less", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    // One Island: Divination's {2}{U} is affordable only {2} less.
    lands(game, "Island", 1);
    const divination = toLibrary(game, "Divination");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    // Under the two Islands the copy draws, Divination is drawn first.
    game.state.zones.perPlayer[A].library = [
      divination,
      ...game.state.zones.perPlayer[A].library.filter((id) => id !== divination),
    ];
    const reveal = asks(a, true);
    const seen = castOffered(a, true);
    const before = hand(game).length;
    draw(game, A);
    expect(reveal.count).toBe(1);
    // No miracle: no cost asked about.
    expect(reveal.costs).toEqual([undefined]);
    expect(seen.offered).toEqual(["Divination"]);
    expect(seen.copies).toEqual([true]);
    // The card itself stays in hand; the copy drew two.
    expect(zone(game, divination)).toBe("hand");
    expect(hand(game).length).toBe(before + 1 + 2);
  });

  it("kept hidden, nothing is copied", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    lands(game, "Island", 3);
    toLibrary(game, "Divination");
    const reveal = asks(a, false);
    const seen = castOffered(a, true);
    draw(game, A);
    expect(reveal.count).toBe(1);
    expect(seen.offered).toEqual([]);
  });

  it("a creature drawn first may be revealed, and copies nothing; the sorcery drawn second isn't asked about", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    toLibrary(game, "Divination");
    const bears = toLibrary(game, "Grizzly Bears");
    const reveal = asks(a, true);
    const seen = castOffered(a, true);
    draw(game, A, 2);
    // Asked whatever was drawn, so the question tells no one what it was.
    expect(reveal.count).toBe(1);
    expect(seen.offered).toEqual([]);
    expect(game.state.eventLog.some((e) => e.type === "cards-revealed" && e.objects.includes(bears))).toBe(true);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("on an opponent's turn too", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    lands(game, "Island", 1);
    toLibrary(game, "Divination");
    game.state.turn.activePlayerIndex = game.state.turnOrder.indexOf(B);
    const reveal = asks(a, true);
    const seen = castOffered(a, true);
    draw(game, A);
    expect(reveal.count).toBe(1);
    expect(seen.offered).toEqual(["Divination"]);
  });

  it("a card that left the hand before the trigger resolved is copied as it last existed, into the hand", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    lands(game, "Island", 1);
    const divination = toLibrary(game, "Divination");
    a.chooseDiscardsFn = () => [divination];
    const reveal = asks(a, true);
    const seen = castOffered(a, true);
    draw(game, A, 1, { kind: "discard", target: "you", amount: 1 });
    expect(zone(game, divination)).toBe("graveyard");
    expect(reveal.count).toBe(1);
    expect(seen.offered).toEqual(["Divination"]);
    expect(seen.copies).toEqual([true]);
  });

  it("two Kefnets: two reveals, two copies", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    spawn(game, "God-Eternal Kefnet");
    lands(game, "Island", 2);
    toLibrary(game, "Divination");
    const reveal = asks(a, true);
    const seen = castOffered(a, true);
    draw(game, A);
    expect(reveal.count).toBe(2);
    expect(seen.offered).toEqual(["Divination", "Divination"]);
  });

  it("a declined copy ceases to exist", () => {
    const { game, a } = table();
    spawn(game, "God-Eternal Kefnet");
    lands(game, "Island", 1);
    const divination = toLibrary(game, "Divination");
    asks(a, true);
    castOffered(a, false);
    const before = hand(game).length;
    draw(game, A);
    expect(hand(game)).toEqual(expect.arrayContaining([divination]));
    expect(hand(game).length).toBe(before + 1);
  });

  it("dies: may go into its owner's library third from the top", () => {
    const { game, a } = table();
    const kefnet = spawn(game, "God-Eternal Kefnet");
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    a.chooseModesFn = () => [0];
    destroy(game, kefnet);
    settle(game);
    expect(zone(game, kefnet)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.indexOf(kefnet as ObjectId)).toBe(2);
  });
});
