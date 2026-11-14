/**
 * The key `zone:impulse-exile-instead`: an exile's cast-this-turn permission
 * whose spell is exiled instead of going to a graveyard — `exile`'s `mayPlay`
 * with `exileAfter`, already there (Dire Fleet Daredevil). Radiant
 * Scrollwielder reaches it through a card chosen at random, Nita, Forum
 * Conciliator through an activated ability with any type of mana.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("Radiant Scrollwielder", () => {
  it("exiles an instant at random at your upkeep; cast this turn, it has lifelink and is exiled again", () => {
    const { game } = table();
    spawn(game, "Radiant Scrollwielder", A);
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    toGraveyard(game, "Grizzly Bears", A);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    const lifeA = life(game, A);
    const lifeB = life(game, B);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(lifeB - 3);
    expect(life(game, A)).toBe(lifeA + 3);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("the permission lasts only this turn", () => {
    const { game } = table();
    spawn(game, "Radiant Scrollwielder", A);
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    nextTurn(game);
    toStep(game, "precombat-main", A);
    lands(game, "Mountain", 1);
    expect(() => cast(game, bolt, { targets: [ref(B)], via: "impulse" })).toThrow();
    expect(zone(game, bolt)).toBe("exile");
  });

  it("does nothing with no instant or sorcery card in your graveyard", () => {
    const { game } = table();
    spawn(game, "Radiant Scrollwielder", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Nita, Forum Conciliator", () => {
  it("exiles an opponent's instant to cast with any mana; casting it grows your creatures, and it's exiled after", () => {
    const { game } = table();
    const nita = spawn(game, "Nita, Forum Conciliator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const fodder = spawn(game, "Hill Giant", A);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Plains", 3);
    activate(game, nita, 0, { targets: [ref(bolt)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("exile");
    const lifeB = life(game, B);
    // Plains pay for its {R}: mana of any type.
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(lifeB - 3);
    expect(zone(game, bolt)).toBe("exile");
    expect(counters(game, nita)).toBe(1);
    expect(counters(game, bears)).toBe(1);
  });

  it("can't sacrifice itself, nor activate outside a main phase", () => {
    const { game } = table();
    const nita = spawn(game, "Nita, Forum Conciliator", A);
    const fodder = spawn(game, "Hill Giant", A);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Plains", 2);
    expect(() => activate(game, nita, 0, { targets: [ref(bolt)], sacrifice: nita })).toThrow(/sacrific/i);
    toStep(game, "end", A);
    expect(() => activate(game, nita, 0, { targets: [ref(bolt)], sacrifice: fodder })).toThrow(/can only ac/i);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("casting your own spell doesn't trigger it", () => {
    const { game } = table();
    const nita = spawn(game, "Nita, Forum Conciliator", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt", A), { targets: [ref(B)] });
    expect(counters(game, nita)).toBe(0);
  });
});
