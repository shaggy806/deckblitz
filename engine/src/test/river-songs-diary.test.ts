/**
 * "Whenever a player casts an instant or sorcery spell from their hand, exile
 * it instead of putting it into a graveyard as it resolves" — River Song's
 * Diary: `exile-spell-as-it-resolves` with `anyOwner` (any player's spell,
 * its owner's graveyard) and `linked` (the card is exiled with the Diary,
 * rule 607.2a), and the linked upkeep ability that counts those cards and
 * casts one picked at random.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, lands, life, nextTurn, ref, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";
import type { ScriptedController } from "../controller.js";

const castFree = (seat: ScriptedController): void => {
  seat.chooseCastNowFn = (_v, offer) => {
    const way = offer.casts[0];
    return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, free: true };
  };
};

describe("River Song's Diary", () => {
  it("exiles each player's instant or sorcery cast from their hand, with the Diary", () => {
    const { game } = table();
    const diary = spawn(game, "River Song's Diary");
    lands(game, "Mountain", 4);
    lands(game, "Mountain", 4, B);
    const mine = toHand(game, "Shock");
    cast(game, mine, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, mine)).toBe("exile");
    expect(game.state.objects[mine].exiledWith?.source).toBe(diary);

    // Another player's spell, into their own graveyard otherwise.
    nextTurn(game);
    const theirs = toHand(game, "Shock", B);
    cast(game, theirs, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.objects[theirs].exiledWith?.source).toBe(diary);
    expect(graveyard(game, B)).not.toContain(theirs);
  });

  it("leaves a spell cast from a graveyard, and a creature spell, alone", () => {
    const { game } = table();
    spawn(game, "River Song's Diary");
    lands(game, "Island", 6);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    // Flashback's own exile, not the Diary's.
    expect(zone(game, twice)).toBe("exile");
    expect(game.state.objects[twice].exiledWith).toBeUndefined();
    const bird = toHand(game, "Storm Crow");
    cast(game, bird);
    expect(zone(game, bird)).toBe("battlefield");
  });

  it("does nothing at upkeep with three cards exiled with it", () => {
    const { game, a } = table();
    spawn(game, "River Song's Diary");
    lands(game, "Mountain", 4);
    for (let i = 0; i < 3; i += 1) cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    castFree(a);
    toStep(game, "draw");
    expect(life(game, B)).toBe(14);
  });

  it("with four, picks one at random at upkeep, cast free — and that cast isn't from a hand", () => {
    const { game, a } = table();
    spawn(game, "River Song's Diary");
    lands(game, "Mountain", 4);
    const shocks = Array.from({ length: 4 }, () => toHand(game, "Shock"));
    for (const shock of shocks) cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
    expect(shocks.every((s) => zone(game, s) === "exile")).toBe(true);
    castFree(a);
    toStep(game, "draw");
    expect(life(game, B)).toBe(10);
    // Cast from exile: it goes to the graveyard as it resolves.
    expect(shocks.filter((s) => zone(game, s) === "graveyard")).toHaveLength(1);
    expect(shocks.filter((s) => zone(game, s) === "exile")).toHaveLength(3);
  });
});
