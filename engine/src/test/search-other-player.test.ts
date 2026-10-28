/**
 * A search of another player's zones (`search-library`'s `whose`): their
 * library, or their graveyard, hand and library together (`zones:
 * "graveyard-hand-library"` — the extract family). The searcher chooses; the
 * library's owner shuffles (rule 701.24a); a find put onto the battlefield is
 * the searcher's. A search for "all cards with that name" (`all`) takes every
 * graveyard match, a public zone, and lets the searcher leave the hidden
 * zones' (rule 701.23b, Counterbore's ruling); "any number" lets them leave
 * any. `then` sees the finds as its targets and the searched player as
 * "that player".
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  controller,
  hand,
  lands,
  pickFromZone,
  ref,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** The seat casts `card` when offered, free, with these targets. */
function castWhenOffered(seat: ScriptedController, card: ObjectId, targets: readonly PlayerId[] = []): void {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.card === card);
    if (way === undefined) return null;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card,
      targets: targets.map((p) => ref(p)),
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
}

const shuffledBy = (game: ReturnType<typeof table>["game"]): string[] =>
  game.state.eventLog.flatMap((e) => (e.type === "library-shuffled" ? [e.player] : []));

describe("searching another player's library", () => {
  it("Extract exiles a card of the targeted player's choice of the searcher, and that player shuffles", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const seen = pickFromZone(a, bolt);
    cast(game, toHand(game, "Extract"), { targets: [ref(B)] });
    // Every card of bob's library, nothing of alice's.
    expect(seen.offered).toContain(bolt);
    expect(seen.offered.every((id) => game.state.objects[id].owner === B)).toBe(true);
    expect(zone(game, bolt)).toBe("exile");
    expect(shuffledBy(game)).toEqual([B]);
  });

  it("Extract must find a card: no quality is stated (rule 701.23d)", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    let least = -1;
    a.chooseFromZoneFn = (_v, eligible, min) => {
      least = min;
      return eligible.slice(0, min);
    };
    cast(game, toHand(game, "Extract"), { targets: [ref(B)] });
    expect(least).toBe(1);
  });

  it("Bribery puts the creature onto the battlefield under the searcher's control", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const giant = toLibrary(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, toHand(game, "Bribery"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].owner).toBe(B);
  });

  it("Praetor's Grasp exiles the card face down, and the searcher may play it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Praetor's Grasp"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledFaceDown?.lookers).toEqual([A]);
    // Bob, its owner, can't see what it is (the ruling).
    expect(game.viewFor(B).objects[bolt]?.cardName).not.toBe("Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(game.state.players[B].life).toBe(17);
  });

  it("Knowledge Exploitation casts the find from that player's library, free", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const divination = toLibrary(game, "Divination", B);
    pickFromZone(a, divination);
    castWhenOffered(a, divination);
    const before = hand(game).length;
    cast(game, toHand(game, "Knowledge Exploitation"), { targets: [ref(B)] });
    // Divination resolved for alice, its controller: two cards drawn.
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("the extract family: graveyard, hand and library", () => {
  it("Memoricide offers every copy in all three zones, the hand's too, and exiles only those picked", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const inYard = toGraveyard(game, "Lightning Bolt", B);
    const inHand = toHand(game, "Lightning Bolt", B);
    const inLibrary = toLibrary(game, "Lightning Bolt", B);
    let offered: readonly string[] = [];
    let sawHand = false;
    a.chooseFromZoneFn = (view, eligible) => {
      offered = eligible;
      // The searcher sees the hand while searching it.
      sawHand = view.state.objects[inHand]?.cardName === "Lightning Bolt";
      return [inHand, inLibrary];
    };
    cast(game, toHand(game, "Memoricide"), { targets: [ref(B)] });
    expect(new Set(offered)).toEqual(new Set([inYard, inHand, inLibrary]));
    expect(sawHand).toBe(true);
    // "Any number": the graveyard's may be left.
    expect(zone(game, inYard)).toBe("graveyard");
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("exile");
    expect(shuffledBy(game)).toEqual([B]);
  });

  it("Cranial Extraction takes the graveyard's copies whatever is picked (rule 701.23b)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const yard = [toGraveyard(game, "Lightning Bolt", B), toGraveyard(game, "Lightning Bolt", B)];
    const inHand = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(a);
    cast(game, toHand(game, "Cranial Extraction"), { targets: [ref(B)] });
    // Only the hidden zones' are a choice.
    expect(seen.offered).toEqual([inHand]);
    for (const id of yard) expect(zone(game, id)).toBe("exile");
    expect(zone(game, inHand)).toBe("hand");
  });

  it("Surgical Extraction searches the target card's owner's zones, the target among the finds", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const target = toGraveyard(game, "Lightning Bolt", B);
    const inLibrary = toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Lightning Bolt", A);
    const seen = pickFromZone(a, target, inLibrary);
    cast(game, toHand(game, "Surgical Extraction"), { targets: [ref(target)] });
    expect(new Set(seen.offered)).toEqual(new Set([target, inLibrary]));
    expect(zone(game, target)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("exile");
  });

  it("Surgical Extraction can't target a basic land card", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const forest = toGraveyard(game, "Forest", B);
    expect(() => cast(game, toHand(game, "Surgical Extraction"), { targets: [ref(forest)] })).toThrow();
  });

  it("Lost Legacy: that player shuffles, then draws a card for each card exiled from their hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const inHand = [toHand(game, "Lightning Bolt", B), toHand(game, "Lightning Bolt", B)];
    const inLibrary = toLibrary(game, "Lightning Bolt", B);
    const kept = hand(game, B).length;
    pickFromZone(a, ...inHand, inLibrary);
    cast(game, toHand(game, "Lost Legacy"), { targets: [ref(B)] });
    for (const id of [...inHand, inLibrary]) expect(zone(game, id)).toBe("exile");
    // Two cards drawn for the two from the hand — not three.
    expect(hand(game, B)).toHaveLength(kept - 2 + 2);
    const events = game.state.eventLog.map((e) => e.type);
    expect(events.lastIndexOf("library-shuffled")).toBeLessThan(events.lastIndexOf("card-drawn"));
  });

  it("Haunting Echoes searches the library for every name it exiled from the graveyard, basics spared", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const forest = toGraveyard(game, "Forest", B);
    const boltInLibrary = toLibrary(game, "Lightning Bolt", B);
    const forestInLibrary = toLibrary(game, "Forest", B);
    const seen = pickFromZone(a, boltInLibrary);
    cast(game, toHand(game, "Haunting Echoes"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, forest)).toBe("graveyard");
    expect(seen.offered).toEqual([boltInLibrary]);
    expect(zone(game, boltInLibrary)).toBe("exile");
    expect(zone(game, forestInLibrary)).toBe("library");
  });

  it("Counterbore searches the countered spell's controller's zones, not its owner's (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 12);
    lands(game, "Mountain", 1);
    // Alice casts bob's Lightning Bolt from his library.
    const bolt = toLibrary(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    castWhenOffered(a, bolt, [B]);
    cast(game, toHand(game, "Knowledge Exploitation"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.includes(bolt) && s.priority.holder === A);
    const alicesBolt = toLibrary(game, "Lightning Bolt", A);
    const bobsBolt = toLibrary(game, "Lightning Bolt", B);
    const seen = pickFromZone(a, alicesBolt);
    cast(game, toHand(game, "Counterbore"), { targets: [ref(bolt)] });
    // Bob's graveyard got the countered card, but alice's zones were searched.
    expect(seen.offered).toEqual([alicesBolt]);
    expect(zone(game, alicesBolt)).toBe("exile");
    expect(zone(game, bobsBolt)).toBe("library");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);
  });
});
