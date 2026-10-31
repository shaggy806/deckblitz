/**
 * The printed "can't be the target of …" statics that aren't the hexproof
 * keyword (rules 601.2c, 602.2b — no illegal target may be chosen): spells
 * only (Fiendslayer Paladin), any player's (Mercenary Informer), every spell
 * at every creature (Dense Foliage) — `hexproofFrom`'s qualifiers — and
 * "cards in graveyards can't be the targets of spells or abilities"
 * (Ground Seal, Silent Gravestone — `graveyardCardsUntargetable`).
 */
import { describe, expect, it } from "vitest";

import { activate, B, cast, hand, lands, ref, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("can't be the target of [quality] spells — spells only", () => {
  it("Fiendslayer Paladin: an opponent's red spell can't target it, a red ability can", () => {
    const { game } = table();
    const paladin = spawn(game, "Fiendslayer Paladin");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(paladin)] })).toThrow();
    const pyromancer = spawn(game, "Prodigal Pyromancer", B);
    activate(game, pyromancer, 0, { player: B, targets: [ref(paladin)] });
    expect(game.state.objects[paladin].damageMarked).toBe(1);
  });

  it("its own controller's black spell can still target it", () => {
    const { game } = table();
    const paladin = spawn(game, "Fiendslayer Paladin");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Disfigure"), { targets: [ref(paladin)] });
    expect(zone(game, paladin)).toBe("graveyard");
  });
});

describe("can't be the target of [quality] spells or abilities — any player's", () => {
  it("Mercenary Informer: its own controller's black spell can't target it", () => {
    const { game } = table();
    const informer = spawn(game, "Mercenary Informer");
    lands(game, "Swamp", 1);
    expect(() => cast(game, toHand(game, "Disfigure"), { targets: [ref(informer)] })).toThrow();
  });

  it("nor its own controller's ability from a black source; a white one can", () => {
    const { game } = table();
    const informer = spawn(game, "Mercenary Informer", undefined, { tapped: true });
    const assassin = spawn(game, "Royal Assassin");
    expect(() => activate(game, assassin, 0, { targets: [ref(informer)] })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(informer)] });
    expect(zone(game, informer)).toBe("graveyard");
  });
});

describe("can't be the targets of spells — no quality", () => {
  it("Dense Foliage: no player's spell targets a creature, an ability still can", () => {
    const { game } = table();
    spawn(game, "Dense Foliage", B);
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(() => cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] })).toThrow();
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });

  it("a player is still a legal target of a spell under it", () => {
    const { game } = table();
    spawn(game, "Dense Foliage");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(18);
  });
});

describe("cards in graveyards can't be the targets of spells or abilities", () => {
  it("Ground Seal: its controller's own spell can't target a card in their graveyard", () => {
    const { game } = table();
    spawn(game, "Ground Seal");
    const bear = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    expect(() => cast(game, toHand(game, "Raise Dead"), { targets: [ref(bear)] })).toThrow();
  });

  it("without it the same spell can", () => {
    const { game } = table();
    const bear = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Raise Dead"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("hand");
  });

  it("Silent Gravestone: once it exiles itself and every graveyard, the rule is gone and a card is drawn", () => {
    const { game } = table();
    const stone = spawn(game, "Silent Gravestone");
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    const before = hand(game).length;
    activate(game, stone);
    expect(zone(game, stone)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });
});
