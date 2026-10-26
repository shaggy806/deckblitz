/**
 * Cipher (rule 702.99a): "If this spell is represented by a card, you may
 * exile this card encoded on a creature you control" and "For as long as this
 * card is encoded on that creature, that creature has 'Whenever this creature
 * deals combat damage to a player, you may copy the encoded card and you may
 * cast the copy without paying its mana cost.'"
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

import {
  A,
  B,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickPermanents,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `seat` casts whatever a cast-now offers it, aimed at `targets`; counts
 * the offers. */
function castOffered(seat: ScriptedController, targets: readonly TargetRef[]): { offers: number } {
  const seen = { offers: 0 };
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0];
    if (way === undefined) return null;
    seen.offers += 1;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets, via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

const encodedOn = (game: Game, creature: ObjectId): readonly ObjectId[] =>
  (game.state.objects[creature].encodedCards ?? []).map((e) => e.card);

/** Alice casts Shadow Slice at bob, encoding it on `host`. */
function sliceOnto(game: Game, a: ScriptedController, host: ObjectId): ObjectId {
  lands(game, "Swamp", 5);
  const slice = toHand(game, "Shadow Slice");
  const asked = pickPermanents(a, host);
  cast(game, slice, { targets: [ref(B)] });
  expect(asked.offered).toContain(host);
  return slice;
}

describe("cipher", () => {
  it("encodes the card on a creature, and each combat damage to a player casts a free copy", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const slice = sliceOnto(game, a, bears);
    expect(life(game, B)).toBe(17);
    expect(zone(game, slice)).toBe("exile");
    expect(graveyard(game)).not.toContain(slice);
    expect(encodedOn(game, bears)).toEqual([slice]);

    const seen = castOffered(a, [ref(B)]);
    attack(game, a, [bears]);
    expect(seen.offers).toBe(1);
    // 2 combat damage, then the copy's 3 — the copy ceases to exist, the
    // card stays encoded (rule 707.10c), and it works again next combat.
    expect(life(game, B)).toBe(12);
    expect(zone(game, slice)).toBe("exile");
    expect(encodedOn(game, bears)).toEqual([slice]);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [bears]);
    expect(seen.offers).toBe(2);
    expect(life(game, B)).toBe(7);
  });

  it("declining the copy casts nothing, and the card stays encoded", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const slice = sliceOnto(game, a, bears);
    a.chooseCastNowFn = () => null;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(encodedOn(game, bears)).toEqual([slice]);
    expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id].cardName === "Shadow Slice")).toEqual([slice]);
  });

  it("encoding on nothing, or with no creature, puts it into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 10);
    const bears = spawn(game, "Grizzly Bears");
    const first = toHand(game, "Shadow Slice");
    pickPermanents(a);
    cast(game, first, { targets: [ref(B)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(encodedOn(game, bears)).toEqual([]);

    const { game: bare, a: alice } = table();
    lands(bare, "Swamp", 5);
    const lone = toHand(bare, "Shadow Slice");
    const asked = pickPermanents(alice);
    asked.offered = ["never-asked" as ObjectId];
    cast(bare, lone, { targets: [ref(B)] });
    expect(asked.offered).toEqual(["never-asked"]);
    expect(zone(bare, lone)).toBe("graveyard");
  });

  it("is never encoded once the creature leaves: the card stays exiled, encoded on nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const slice = sliceOnto(game, a, bears);
    // Voidwalk (itself declining to encode) blinks the Bears: it comes back
    // a new object (rule 400.7) with nothing encoded on it (702.99c).
    lands(game, "Island", 4);
    const voidwalk = toHand(game, "Voidwalk");
    pickPermanents(a);
    cast(game, voidwalk, { targets: [ref(bears)] });
    toStep(game, "precombat-main", B);
    const [back] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(zone(game, slice)).toBe("exile");
    expect(encodedOn(game, back)).toEqual([]);
    const seen = castOffered(a, [ref(B)]);
    toStep(game, "precombat-main", A);
    attack(game, a, [back]);
    expect(seen.offers).toBe(0);
    expect(life(game, B)).toBe(15);
  });

  it("whoever controls the creature controls the trigger", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    sliceOnto(game, a, bears);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    const seen = castOffered(b, [ref(A)]);
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(seen.offers).toBe(1);
    expect(life(game, A)).toBe(15);
  });

  it("a copy of a cipher spell isn't encoded (it isn't represented by a card)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    sliceOnto(game, a, bears);
    castOffered(a, [ref(B)]);
    // Asked again, it would encode on the Elves.
    const asked = pickPermanents(a, elves);
    asked.offered = [];
    attack(game, a, [bears]);
    expect(asked.offered).toEqual([]);
    expect(encodedOn(game, elves)).toEqual([]);
  });
});

describe("cipher cards", () => {
  it("Call of the Nightwing makes a flying Horror and can encode on it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const call = toHand(game, "Call of the Nightwing");
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, call);
    expect(tokensNamed(game, "Horror Token (Blue Black Flying)", A)).toBe(1);
    const [horror] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Horror Token (Blue Black Flying)");
    expect(encodedOn(game, horror)).toEqual([call]);
  });

  it("Undercity Plague: loses 1 life, discards a card, then sacrifices a permanent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const bobLand = spawn(game, "Forest", B);
    const handBefore = hand(game, B).length;
    pickPermanents(a);
    cast(game, toHand(game, "Undercity Plague"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(hand(game, B).length).toBe(handBefore - 1);
    expect(zone(game, bobLand)).toBe("graveyard");
  });

  it("Hidden Strings taps one permanent and untaps another", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const target = spawn(game, "Grizzly Bears", B);
    pickPermanents(a);
    // The first target's modal: tap (mode 0); the second's: untap (mode 1).
    let call = 0;
    a.chooseModesFn = () => (call++ === 0 ? [0] : [1]);
    cast(game, toHand(game, "Hidden Strings"), { targets: [ref(target), ref(tapped)] });
    expect(game.state.objects[target].tapped).toBe(true);
    expect(game.state.objects[tapped].tapped).toBe(false);
  });

  it("Writ of Return returns its creature tapped", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickPermanents(a);
    cast(game, toHand(game, "Writ of Return"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
