/**
 * Coldsnap's two keywords.
 *
 * Ripple N (rule 702.60a — the `ripple(n, name)` helper): "When you cast this
 * spell, you may reveal the top N cards of your library … you may cast any of
 * those cards with the same name as this spell without paying their mana
 * costs, then put all revealed cards not cast this way on the bottom of your
 * library in any order" — a repeating free `cast-now` with `rest:
 * "bottom-any-order"`. Surging Sentinels, Surging Flame.
 *
 * Recover [cost] (rule 702.59a — the `recover(cost)` helper): "When a
 * creature is put into your graveyard from the battlefield, you may pay
 * [cost]. If you do, return this card from your graveyard to your hand.
 * Otherwise, exile this card." Grim Harvest, Garza's Assassin.
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../state.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, cast, destroy, hand, lands, life, pickFromZone, pickModes, ref, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

/** The seat casts every card offered (free), with `targets`; records each
 * offer's cards. */
function castEveryOffer(seat: ScriptedController, targets: readonly TargetRef[] = []): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const way = offer.casts[0];
    if (way === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets, via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

const library = (game: ReturnType<typeof table>["game"]): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("ripple", () => {
  it("casts the same-named card revealed for free, offers nothing else, and orders the rest onto the bottom", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    // Top down: Surging Sentinels, Grizzly Bears, Hill Giant, then the Wastes.
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Surging Sentinels");
    const wastes = library(game)[3];
    const first = toHand(game, "Surging Sentinels");
    pickModes(a, 0); // reveal, each time
    const seen = castEveryOffer(a);
    const order = pickFromZone(a, wastes, giant, bears);
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield"); // cast free: the Plains paid only the first
    expect(seen.offered[0]).toEqual([second]);
    expect(order.offered).toEqual(expect.arrayContaining([bears, giant, wastes]));
    // The second Sentinels' own ripple revealed four Wastes, which went under
    // the first three in the order chosen (nothing to choose between them).
    const lib = library(game);
    expect(lib.slice(-7, -4)).toEqual([wastes, giant, bears]);
  });

  it("declined, reveals nothing and moves nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const second = toLibrary(game, "Surging Sentinels");
    pickModes(a); // don't reveal
    const seen = castEveryOffer(a);
    cast(game, toHand(game, "Surging Sentinels"));
    expect(seen.offered).toEqual([]);
    expect(library(game)[0]).toBe(second);
  });

  it("a ripple instant's copy picks its own target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    toLibrary(game, "Surging Flame");
    pickModes(a, 0);
    castEveryOffer(a, [ref(B)]);
    cast(game, toHand(game, "Surging Flame"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("recover", () => {
  it("paid as a creature of yours dies, returns the card to your hand", () => {
    const { game, a } = table();
    const harvest = toGraveyard(game, "Grim Harvest");
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, bears);
    expect(zone(game, harvest)).toBe("hand");
  });

  it("unpaid, exiles the card", () => {
    const { game, a } = table();
    const harvest = toGraveyard(game, "Grim Harvest");
    lands(game, "Swamp", 3);
    pickModes(a);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(zone(game, harvest)).toBe("exile");
  });

  it("with no way to pay, exiles the card", () => {
    const { game } = table();
    const harvest = toGraveyard(game, "Grim Harvest");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(zone(game, harvest)).toBe("exile");
  });

  it("an opponent's creature dying doesn't trigger it", () => {
    const { game } = table();
    const harvest = toGraveyard(game, "Grim Harvest");
    destroy(game, spawn(game, "Grizzly Bears", B), A);
    expect(zone(game, harvest)).toBe("graveyard");
  });

  it("Garza's Assassin: not by its own death; paid with half your life, rounded up, after another's", () => {
    const { game, a } = table({ life: 19 });
    const assassin = spawn(game, "Garza's Assassin");
    const target = spawn(game, "Grizzly Bears", B);
    activate(game, assassin, 0, { targets: [ref(target)] });
    expect(zone(game, assassin)).toBe("graveyard");
    pickModes(a, 0);
    destroy(game, spawn(game, "Hill Giant"));
    expect(zone(game, assassin)).toBe("hand");
    expect(life(game)).toBe(9);
    expect(hand(game)).toContain(assassin);
  });
});
