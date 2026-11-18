/**
 * "The exiled spell's mana value" (Synthesis Pod): a spell exiled from the
 * stack for an `exileSpell` cost is read through `{ paid: "exiled" }` as it
 * last existed there — its {X} at the value chosen (rules 202.3e, 608.2h),
 * not the 0 a card in exile has.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, lands, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;
const castFree = (card: () => ObjectId | undefined) => (): Cast | null => {
  const id = card();
  return id === undefined ? null : { type: "cast-spell", player: A, card: id, targets: [], via: "effect", free: true };
};

describe("Synthesis Pod", () => {
  it("finds a card of 1 more than the exiled spell's mana value, exiles it and casts it free", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const pod = spawn(game, "Synthesis Pod", A);
    // Bob's library from the top: Llanowar Elves (1), Grizzly Bears (2), Centaur Courser (3).
    const courser = toLibrary(game, "Centaur Courser", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const elves = toLibrary(game, "Llanowar Elves", B);
    const spell = toHand(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      return castFree(() => offer.cards[0])();
    };
    cast(game, spell, { settle: false });
    activate(game, pod, 0, { targets: [ref(B)] });
    expect(zone(game, spell)).toBe("exile");
    expect(offered).toEqual([courser]);
    expect(zone(game, courser)).toBe("battlefield");
    expect(game.state.objects[courser].controller).toBe(A);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, elves)).toBe("library");
  });

  it("counts the exiled spell's {X} as chosen", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2);
    const pod = spawn(game, "Synthesis Pod", A);
    const giant = toLibrary(game, "Hill Giant", B);
    const courser = toLibrary(game, "Centaur Courser", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Llanowar Elves", B);
    a.chooseCastNowFn = () => null;
    const blaze = toHand(game, "Blaze");
    cast(game, blaze, { targets: [ref(B)], x: 2, settle: false });
    activate(game, pod, 0, { targets: [ref(B)] });
    expect(zone(game, blaze)).toBe("exile");
    // Blaze at X = 2 had mana value 3 on the stack: the find is the 4 (Hill
    // Giant), not the 2 its X at 0 in exile would ask for (Grizzly Bears).
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, courser)).toBe("library");
    expect(game.state.players[B].life).toBe(20);
  });

  it("leaves the card in exile when it isn't cast, and the rest shuffled into the library", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const pod = spawn(game, "Synthesis Pod", A);
    const courser = toLibrary(game, "Centaur Courser", B);
    const elves = toLibrary(game, "Llanowar Elves", B);
    a.chooseCastNowFn = () => null;
    const spell = toHand(game, "Grizzly Bears");
    cast(game, spell, { settle: false });
    const libraryBefore = game.state.zones.perPlayer[B].library.length;
    activate(game, pod, 0, { targets: [ref(B)] });
    settle(game);
    expect(zone(game, courser)).toBe("exile");
    expect(zone(game, elves)).toBe("library");
    expect(game.state.zones.perPlayer[B].library.length).toBe(libraryBefore - 1);
  });

  it("can't be activated with no spell of yours on the stack", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const pod = spawn(game, "Synthesis Pod", A);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: pod, abilityIndex: 0, targets: [ref(B)] }),
    ).not.toBeNull();
  });
});
