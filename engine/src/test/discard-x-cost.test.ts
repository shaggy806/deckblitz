/**
 * "As an additional cost to cast this spell, discard X cards" — the
 * `additionalCost.discard: "x"` cost (Torment's Dreams, Firestorm, Channeled
 * Force). X is announced as the spell is cast (rule 601.2b) though the mana
 * cost has no {X}, capped by the caster's other cards in hand, and that many
 * are discarded as the cost is paid (601.2h). Also the amounts it brought:
 * a `sacrifice` effect's `count` and a library search's `min` read X.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, life, named, ref, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const castOffer = (game: ReturnType<typeof table>["game"], name: string) =>
  game.legalActions(A).find((la) => la.kind === "cast-spell" && la.cardName === name);

describe("additional cost — discard X cards", () => {
  it("offers X up to the other cards in hand, and discards X as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dreams = toHand(game, "Sickening Dreams");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    const bear = spawn(game, "Grizzly Bears", B);
    // The opening hand and the three: every card but the spell itself.
    const others = hand(game).length - 1;
    const offer = castOffer(game, "Sickening Dreams");
    expect(offer?.kind === "cast-spell" && offer.xCost?.maxX).toBe(others);
    // More than the hand holds isn't castable.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: dreams, targets: [], xValue: others + 1 })).not.toBeNull();
    cast(game, dreams, { x: 2 });
    expect(hand(game).length).toBe(others - 2);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes").length).toBe(2);
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });

  it("is castable for X = 0, discarding nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dreams = toHand(game, "Sickening Dreams");
    const before = hand(game).length;
    cast(game, dreams, { x: 0 });
    expect(hand(game).length).toBe(before - 1);
    expect(life(game, A)).toBe(20);
  });

  it("binds an \"X target\" group to the discard's X (Restless Dreams)", () => {
    const { game } = table();
    spawn(game, "Swamp");
    const dreams = toHand(game, "Restless Dreams");
    toHand(game, "Wastes");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    const offer = castOffer(game, "Restless Dreams");
    // A full hand, but two creature cards to target: X is two at most.
    expect(hand(game).length).toBeGreaterThan(3);
    expect(offer?.kind === "cast-spell" && offer.xCost?.maxX).toBe(2);
    // X and the number of targets must agree.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: dreams, targets: [ref(bears)], xValue: 0 })).not.toBeNull();
    const before = hand(game).length;
    cast(game, dreams, { x: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    // The spell and one discarded out, the Bears in.
    expect(hand(game).length).toBe(before - 1);
  });

  it("discards at random, and each player sacrifices X lands (Devastating Dreams)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Forest", B);
    spawn(game, "Forest", B);
    spawn(game, "Forest", B);
    const dreams = toHand(game, "Devastating Dreams");
    const before = hand(game).length;
    cast(game, dreams, { x: 2 });
    expect(hand(game).length).toBe(before - 3);
    expect(named(game, "Forest", B).filter((id) => zone(game, id) === "battlefield").length).toBe(1);
    expect(named(game, "Mountain", A).filter((id) => zone(game, id) === "battlefield").length).toBe(1);
  });

  it("must find X cards when no quality is named (Insidious Dreams)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    const dreams = toHand(game, "Insidious Dreams");
    toHand(game, "Wastes");
    let asked: { min: number; max: number } | undefined;
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      asked = { min, max };
      return eligible.filter((id) => game.state.objects[id].cardName === "Grizzly Bears").slice(0, 1);
    };
    cast(game, dreams, { x: 1 });
    expect(asked).toEqual({ min: 1, max: 1 });
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
  });

  it("exiles Nostalgic Dreams as it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const dreams = toHand(game, "Nostalgic Dreams");
    toHand(game, "Wastes");
    const card = toGraveyard(game, "Llanowar Elves");
    cast(game, dreams, { x: 1, targets: [ref(card)] });
    expect(zone(game, card)).toBe("hand");
    expect(zone(game, dreams)).toBe("exile");
  });

  it("deals X to each of X targets (Firestorm)", () => {
    const { game } = table();
    spawn(game, "Mountain");
    const storm = toHand(game, "Firestorm");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, storm, { x: 2, targets: [ref(bear), ref(B)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
