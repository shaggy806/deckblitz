/**
 * "Whenever a player casts a card, if it has the same name as one of the
 * cards exiled with this artifact, you may copy **the other**. If you do, you
 * may cast the copy without paying its mana cost" (Spellweaver Helix):
 * `cast-now` from `exiled-with-source` with `exceptOneMatching` — the linked
 * cards (rule 607.2a) less one with the cast card's name (rule 201.2a) — and
 * the name check an intervening "if" (rule 603.4). A copy cast isn't a card
 * cast, so it can't trigger the Helix again.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import {
  A,
  B,
  cast,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** Imprint these cards on the Helix as its first ability would (rule 607.2a). */
function imprint(game: Game, helix: ObjectId, ...names: readonly string[]): ObjectId[] {
  const link = { source: helix, zoneChangeCount: game.state.objects[helix].zoneChangeCount ?? 0 };
  return names.map((name) => {
    const id = toExile(game, name);
    game.state.objects[id].exiledWith = link;
    return id;
  });
}

describe("Spellweaver Helix", () => {
  it("imprints two target sorcery cards from a single graveyard", () => {
    const { game, a } = table();
    const divination = toGraveyard(game, "Divination", B);
    const spike = toGraveyard(game, "Lava Spike", B);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, divination, spike);
    pickModes(a, 0);
    const helix = enter(game, "Spellweaver Helix");
    expect(zone(game, divination)).toBe("exile");
    expect(zone(game, spike)).toBe("exile");
    expect(zone(game, bolt)).toBe("graveyard");
    const stint = game.state.objects[helix].zoneChangeCount ?? 0;
    for (const id of [divination, spike]) {
      expect(game.state.objects[id].exiledWith).toEqual({ source: helix, zoneChangeCount: stint });
    }
  });

  it("casting a card named like one copies the other, cast free; the copy doesn't trigger it again", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    const [divination, spike] = imprint(game, helix, "Divination", "Lava Spike");
    const offers: (readonly string[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.cards.map((id) => nameOf(game.state.objects[id])));
      const copy = offer.cards[0];
      return { type: "cast-spell", player: A, card: copy, targets: [ref(B)], via: "effect", free: true };
    };
    lands(game, "Island", 3);
    const cardInHand = toHand(game, "Divination");
    const handBefore = hand(game).length;
    cast(game, cardInHand);
    // One offer, of a copy of the Lava Spike; the copy's cast offers nothing more.
    expect(offers).toEqual([["Lava Spike"]]);
    expect(life(game, B)).toBe(17);
    // The Divination resolved too: two cards, less the one cast.
    expect(hand(game).length).toBe(handBefore - 1 + 2);
    expect(zone(game, divination)).toBe("exile");
    expect(zone(game, spike)).toBe("exile");
  });

  it("works the other way round: the second card's name copies the first", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    imprint(game, helix, "Divination", "Mind Rot");
    const offers: (readonly string[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.cards.map((id) => nameOf(game.state.objects[id])));
      return null;
    };
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(B)] });
    expect(offers).toEqual([["Divination"]]);
  });

  it("a card with neither name doesn't trigger it", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    imprint(game, helix, "Divination", "Lava Spike");
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("two imprinted cards of the same name make one copy", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    imprint(game, helix, "Lava Spike", "Lava Spike");
    const offers: (readonly string[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.cards.map((id) => nameOf(game.state.objects[id])));
      return { type: "cast-spell", player: A, card: offer.cards[0], targets: [ref(B)], via: "effect", free: true };
    };
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lava Spike"), { targets: [ref(B)] });
    expect(offers).toEqual([["Lava Spike"]]);
    expect(life(game, B)).toBe(14);
  });

  it("with only one card imprinted, nothing happens", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    imprint(game, helix, "Divination");
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(asked).toBe(false);
  });

  it("the matching card gone from exile before it resolves, nothing is copied (an intervening if)", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    const [divination] = imprint(game, helix, "Divination", "Lava Spike");
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"), { settle: false });
    // The trigger is on the stack above the Divination; the imprinted
    // Divination leaves exile in response.
    expect(game.state.zones.shared.stack.length).toBe(2);
    game.debugMove(divination, "graveyard");
    settle(game);
    expect(asked).toBe(false);
  });

  it("the other card gone from exile, there's nothing to copy", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    const [, spike] = imprint(game, helix, "Divination", "Lava Spike");
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"), { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
    game.debugMove(spike, "graveyard");
    settle(game);
    expect(asked).toBe(false);
  });

  it("the Helix gone before it resolves, the copy is still made (last known information)", () => {
    const { game, a } = table();
    const helix = spawn(game, "Spellweaver Helix");
    imprint(game, helix, "Divination", "Lava Spike");
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: offer.cards[0],
      targets: [ref(B)],
      via: "effect",
      free: true,
    });
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"), { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
    game.debugMove(helix, "graveyard");
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});
