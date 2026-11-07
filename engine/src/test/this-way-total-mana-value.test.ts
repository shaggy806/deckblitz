/**
 * "If the total mana value of the cards exiled this way is 13 or less" — an
 * `amounts` condition on the `thisWay` sum, read once a `repeat` is done, over
 * every pass (Dance with Calamity: "As many times as you choose, you may
 * exile the top card of your library. If the total mana value … is 13 or
 * less, you may cast any number of spells from among those cards without
 * paying their mana costs").
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { A, cast, lands, named, table, toHand } from "./harness.js";

const DANCE = "Dance with Calamity";
type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** The seat says yes to the first `n` asks (the `may`, then "again?"), no after. */
function exileCount(seat: ScriptedController, n: number): void {
  let asked = 0;
  seat.chooseModesFn = () => {
    asked += 1;
    return asked <= n ? [0] : [];
  };
}

/** The seat casts `count` of the offered spells, one at a time, recording each offer. */
function casting(seat: ScriptedController, count: number): Offer[] {
  const offers: Offer[] = [];
  let left = count;
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    offers.push(offer);
    if (left <= 0) return null;
    left -= 1;
    return { type: "cast-spell", player: A, card: offer.casts[0].card, targets: [], via: "effect", free: true };
  };
  return offers;
}

const exiled = (game: Game, name: string): number =>
  Object.values(game.state.objects).filter((o) => o.owner === A && o.zone === "exile" && o.cardName === name).length;

describe("Dance with Calamity", () => {
  it("six Bears exiled (12): casts two of them free, the other four stay in exile", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 8);
    exileCount(a, 6);
    const offers = casting(a, 2);
    const before = named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield").length;
    cast(game, toHand(game, DANCE));
    expect(offers.length).toBeGreaterThanOrEqual(2);
    expect(named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield").length).toBe(before + 2);
    expect(exiled(game, "Grizzly Bears")).toBe(4);
  });

  it("thirteen is 13 or less: an offer; fourteen isn't: none, and all stay in exile", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 8);
    exileCount(a, 13);
    const offers = casting(a, 0);
    cast(game, toHand(game, DANCE));
    expect(exiled(game, "Lightning Bolt")).toBe(13);
    expect(offers).toHaveLength(1);

    const { game: g2, a: a2 } = table({ deck: "Lightning Bolt" });
    lands(g2, "Mountain", 8);
    exileCount(a2, 14);
    const none = casting(a2, 0);
    cast(g2, toHand(g2, DANCE));
    expect(exiled(g2, "Lightning Bolt")).toBe(14);
    expect(none).toHaveLength(0);
  });

  it("exiling nothing at all is allowed, and offers nothing", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 8);
    exileCount(a, 0);
    const offers = casting(a, 1);
    cast(game, toHand(game, DANCE));
    expect(exiled(game, "Grizzly Bears")).toBe(0);
    expect(offers).toHaveLength(0);
  });
});
