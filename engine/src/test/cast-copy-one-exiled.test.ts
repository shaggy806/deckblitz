/**
 * "Copy **a** card exiled with this artifact. If you do, you may cast the
 * copy without paying its mana cost" (Panoptic Mirror): `cast-now` from
 * `exiled-with-source` with `copies: 1`, `repeat` and `upTo: 1` — a copy of
 * each linked card (rule 607.2a) offered, at most one cast (rule 707.12); the
 * copies not cast cease to exist (704.5e), the cards stay exiled.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, activate, hand, lands, life, pickFromZone, ref, spawn, table, toExile, toHand, toStep, zone } from "./harness.js";

const exiledNamed = (game: Game, name: string): readonly ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => nameOf(game.state.objects[id]) === name);

describe("Panoptic Mirror", () => {
  it("imprints an instant or sorcery card with mana value exactly X", () => {
    const { game, a } = table();
    const mirror = spawn(game, "Panoptic Mirror");
    const bolt = toHand(game, "Lightning Bolt");
    const opt = toHand(game, "Opt");
    const counterspell = toHand(game, "Counterspell");
    const bears = toHand(game, "Savannah Lions");
    lands(game, "Mountain", 1);
    const seen = pickFromZone(a, bolt);
    activate(game, mirror, 0, { x: 1 });
    expect([...seen.offered].sort()).toEqual([bolt, opt].sort());
    expect(seen.offered).not.toContain(counterspell);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, opt)).toBe("hand");
  });

  it("at upkeep, a copy of one of the imprinted cards is cast free; the other isn't, and both stay exiled", () => {
    const { game, a } = table();
    const mirror = spawn(game, "Panoptic Mirror");
    const link = { source: mirror, zoneChangeCount: game.state.objects[mirror].zoneChangeCount ?? 0 };
    const bolt = toExile(game, "Lightning Bolt");
    const divination = toExile(game, "Divination");
    game.state.objects[bolt].exiledWith = link;
    game.state.objects[divination].exiledWith = link;

    const offers: (readonly string[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.cards.map((id) => nameOf(game.state.objects[id])).sort());
      const copy = offer.cards.find((id) => nameOf(game.state.objects[id]) === "Lightning Bolt");
      return copy === undefined ? null : { type: "cast-spell", player: A, card: copy, targets: [ref(B)], via: "effect", free: true };
    };
    const handBefore = hand(game).length;
    toStep(game, "draw");
    // One offer, of a copy of each; one cast, and no second offer.
    expect(offers).toEqual([["Divination", "Lightning Bolt"]]);
    expect(life(game, B)).toBe(17);
    // The upkeep's draw only: the Divination copy wasn't cast.
    expect(hand(game).length).toBe(handBefore + 1);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, divination)).toBe("exile");
    expect(exiledNamed(game, "Lightning Bolt")).toEqual([bolt]);
    expect(exiledNamed(game, "Divination")).toEqual([divination]);
  });

  it("with nothing imprinted, the trigger does nothing", () => {
    const { game, a } = table();
    spawn(game, "Panoptic Mirror");
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    toStep(game, "draw");
    expect(asked).toBe(false);
  });
});
