/**
 * An activated ability whose cost's X is defined by its own text
 * (`ActivatedAbility.xIs`, rule 107.3c) — Prototype Portal's "{X}, {T}:
 * Create a token that's a copy of the exiled card. X is the mana value of
 * that card." The controller doesn't choose it: one X is offered, any other
 * is refused, and with nothing exiled it's undefined and can't be paid.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { manaValueOfObject } from "../filter.js";

import { A, B, activate, cast, enter, lands, life, named, pickFromZone, ref, registryOf, table, toHand, zone } from "./harness.js";

function portalOffers(game: Game, portal: ObjectId) {
  return game.legalActions(A).filter((action) => action.kind === "activate-ability" && action.source === portal);
}

describe("Prototype Portal: X is the mana value of the exiled card", () => {
  it("is offered at exactly the imprinted card's mana value, and copies it", () => {
    const { game, a } = table();
    lands(game, "Wastes", 8);
    const archive = toHand(game, "Hedron Archive");
    pickFromZone(a, archive);
    cast(game, toHand(game, "Prototype Portal"));
    expect(zone(game, archive)).toBe("exile");
    const portal = named(game, "Prototype Portal")[0];

    // Four lands are left: X = 4 is the one X offered.
    const offers = portalOffers(game, portal);
    expect(offers).toHaveLength(1);
    expect(offers[0].kind === "activate-ability" && offers[0].xCost).toEqual({ minX: 4, maxX: 4 });

    // Not a chosen X (107.3c): a smaller or larger one is refused.
    expect(() => activate(game, portal, 0, { x: 0 })).toThrow(/X = 4/);
    expect(() => activate(game, portal, 0, { x: 3 })).toThrow(/X = 4/);
    expect(named(game, "Hedron Archive")).toHaveLength(0);

    activate(game, portal, 0, { x: 4 });
    const tokens = named(game, "Hedron Archive");
    expect(tokens).toHaveLength(1);
    expect(game.state.objects[tokens[0]].isToken).toBe(true);
    expect(zone(game, archive)).toBe("exile");
    // All eight lands are tapped: four for the Portal, four for its X.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped === true)).toHaveLength(9);
  });

  it("isn't offered while the mana for that X isn't there", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    const archive = toHand(game, "Hedron Archive");
    pickFromZone(a, archive);
    cast(game, toHand(game, "Prototype Portal"));
    const portal = named(game, "Prototype Portal")[0];
    // Three lands left for an X of 4.
    expect(portalOffers(game, portal)).toHaveLength(0);
    expect(() => activate(game, portal, 0, { x: 3 })).toThrow();
    expect(() => activate(game, portal, 0, { x: 4 })).toThrow();
  });

  it("can't be activated with no card exiled: X is undefined", () => {
    const { game, a } = table();
    lands(game, "Wastes", 8);
    a.chooseFromZoneFn = () => [];
    toHand(game, "Hedron Archive");
    cast(game, toHand(game, "Prototype Portal"));
    const portal = named(game, "Prototype Portal")[0];
    expect(portalOffers(game, portal)).toHaveLength(0);
    expect(() => activate(game, portal, 0, { x: 0 })).toThrow(/isn't defined/);
  });

  it("costs {0} for a card with mana value 0", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const thopter = toHand(game, "Ornithopter");
    pickFromZone(a, thopter);
    cast(game, toHand(game, "Prototype Portal"));
    const portal = named(game, "Prototype Portal")[0];
    expect(portalOffers(game, portal)).toHaveLength(1);
    activate(game, portal, 0, { x: 0 });
    expect(named(game, "Ornithopter")).toHaveLength(1);
  });
});

describe("Soul Foundry: a token copy of the imprinted creature card, X its mana value", () => {
  it("copies the exiled creature card at exactly its mana value, the token keeping that mana cost", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    cast(game, toHand(game, "Soul Foundry"));
    expect(zone(game, bears)).toBe("exile");
    const foundry = named(game, "Soul Foundry")[0];
    const offers = game.legalActions(A).filter((action) => action.kind === "activate-ability" && action.source === foundry);
    expect(offers).toHaveLength(1);
    expect(offers[0].kind === "activate-ability" && offers[0].xCost).toEqual({ minX: 2, maxX: 2 });
    expect(() => activate(game, foundry, 0, { x: 1 })).toThrow(/X = 2/);
    activate(game, foundry, 0, { x: 2 });
    const tokens = named(game, "Grizzly Bears");
    expect(tokens).toHaveLength(1);
    const token = game.state.objects[tokens[0]];
    expect(token.isToken).toBe(true);
    // Its ruling: the copy has the card's mana cost, so its mana value.
    expect(manaValueOfObject(registryOf(game), token)).toBe(2);
    expect(zone(game, bears)).toBe("exile");
  });

  it("imprints only a creature card", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    toHand(game, "Hedron Archive");
    const bears = toHand(game, "Grizzly Bears");
    const imprint = pickFromZone(a, bears);
    cast(game, toHand(game, "Soul Foundry"));
    expect(imprint.offered).toEqual([bears]);
  });
});

describe("Elite Arcanist: cast a copy of the exiled instant, X its mana value", () => {
  it("copies the exiled instant at exactly its mana value and casts the copy for free", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bolt = toHand(game, "Lightning Bolt");
    toHand(game, "Grizzly Bears");
    const imprint = pickFromZone(a, bolt);
    const arcanist = enter(game, "Elite Arcanist");
    expect(imprint.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("exile");
    let cast_ = 0;
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      cast_ += 1;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    expect(() => activate(game, arcanist, 0, { x: 0 })).toThrow(/X = 1/);
    activate(game, arcanist, 0, { x: 1 });
    expect(cast_).toBe(1);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });
});
