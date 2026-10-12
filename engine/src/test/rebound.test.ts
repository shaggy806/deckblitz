/**
 * Rebound (rule 702.88a): "If this spell was cast from your hand, instead of
 * putting it into your graveyard as it resolves, exile it and, at the
 * beginning of your next upkeep, you may cast this card from exile without
 * paying its mana cost."
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

import { A, B, cast, graveyard, hand, keywords, lands, nextTurn, pt, ref, settle, spawn, table, toGraveyard, toHand, toStep, tokensNamed, zone } from "./harness.js";

/** `seat` takes the free cast of `card` when it's offered, aiming it at
 * `targets`; records whether it was offered. */
function castWhenOffered(seat: ScriptedController, card: ObjectId, targets: readonly TargetRef[]): { offered: boolean } {
  const seen = { offered: false };
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.card === card);
    if (way === undefined) return null;
    seen.offered = true;
    return { type: "cast-spell", player: seat.playerId, card, targets, via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

/** Alice's next upkeep, with the rebound trigger resolved by her seat's hook. */
const toNextUpkeep = (game: Game): void => {
  toStep(game, "precombat-main", B);
  toStep(game, "upkeep", A);
  settle(game);
};

describe("rebound", () => {
  it("cast from hand, it's exiled as it resolves and cast again free at your next upkeep", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const strike = toHand(game, "Distortion Strike");
    cast(game, strike, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, strike)).toBe("exile");
    expect(graveyard(game)).not.toContain(strike);

    const seen = castWhenOffered(a, strike, [ref(bears)]);
    toNextUpkeep(game);
    expect(seen.offered).toBe(true);
    // Cast during the upkeep (timing ignored), free: it resolved again, and
    // this time — cast from exile — it goes to the graveyard.
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, strike)).toBe("graveyard");
  });

  it("declined, the card stays in exile", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const strike = toHand(game, "Distortion Strike");
    cast(game, strike, { targets: [ref(bears)] });
    a.chooseCastNowFn = () => null;
    toNextUpkeep(game);
    expect(zone(game, strike)).toBe("exile");
    nextTurn(game);
    expect(zone(game, strike)).toBe("exile");
  });

  it("not when it's cast from anywhere but a hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const strike = toGraveyard(game, "Distortion Strike");
    const seen = castWhenOffered(a, strike, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "cast-now", target: 0, free: true }, [{ kind: "object", object: strike }]);
    settle(game);
    expect(seen.offered).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, strike)).toBe("graveyard");
  });

  it("not when it's countered: it goes to the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Island", 2, B);
    const bears = spawn(game, "Grizzly Bears");
    const strike = toHand(game, "Distortion Strike");
    cast(game, strike, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [{ kind: "object", object: strike }]);
    settle(game);
    expect(zone(game, strike)).toBe("graveyard");
  });

  it("Ephemerate blinks a creature now and again at the next upkeep", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears: ObjectId = spawn(game, "Grizzly Bears");
    const ephemerate = toHand(game, "Ephemerate");
    cast(game, ephemerate, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ephemerate)).toBe("exile");
    const [again] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    const seen = castWhenOffered(a, ephemerate, [ref(again)]);
    toNextUpkeep(game);
    expect(seen.offered).toBe(true);
    expect(zone(game, ephemerate)).toBe("graveyard");
    expect(hand(game)).not.toContain(ephemerate);
  });
});

describe("rebound cards", () => {
  it("Transpose makes its Wizard only when cast from hand, not on the rebound cast", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const transpose = toHand(game, "Transpose");
    cast(game, transpose);
    expect(tokensNamed(game, "Wizard Token (Kuja)", A)).toBe(1);
    expect(zone(game, transpose)).toBe("exile");
    castWhenOffered(a, transpose, []);
    toNextUpkeep(game);
    expect(zone(game, transpose)).toBe("graveyard");
    expect(tokensNamed(game, "Wizard Token (Kuja)", A)).toBe(1);
  });

  it("Flame On! counts the noncreature, nonland cards in your own graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Mountain");
    toGraveyard(game, "Shock", B);
    cast(game, toHand(game, "Flame On!"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});
