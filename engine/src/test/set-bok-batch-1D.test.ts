/**
 * Saviors of Kamigawa and Betrayers of Kamigawa (SOK, BOK) — group D of the
 * set walk: Spirit/Arcane payoffs, a channel, a ninja and the equipment.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Eiganjo Free-Riders", () => {
  it("returns a white creature you control at your upkeep, offering only white ones", () => {
    const { game, a } = table();
    const riders = spawn(game, "Eiganjo Free-Riders");
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, lions);
    toStep(game, "upkeep");
    toStep(game, "draw");
    expect([...seen.offered].sort()).toEqual([riders, lions].sort());
    expect(zone(game, lions)).toBe("hand");
    expect(zone(game, riders)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Scroll of Origins", () => {
  it("draws with seven or more cards in hand", () => {
    const { game } = table();
    const scroll = spawn(game, "Scroll of Origins");
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    expect(before).toBeGreaterThanOrEqual(7);
    activate(game, scroll);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Ghost-Lit Raider", () => {
  it("channels from the hand for 4 damage to a creature", () => {
    const { game } = table();
    const raider = toHand(game, "Ghost-Lit Raider");
    const victim = spawn(game, "Eiganjo Free-Riders", B);
    lands(game, "Mountain", 4);
    activate(game, raider, 1, { targets: [ref(victim)] });
    expect(zone(game, raider)).toBe("graveyard");
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Okiba-Gang Shinobi", () => {
  it("makes the player it hits discard two cards", () => {
    const { game, a } = table();
    const shinobi = spawn(game, "Okiba-Gang Shinobi");
    const before = hand(game, B).length;
    attack(game, a, [shinobi]);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Shizuko, Caller of Autumn", () => {
  it("gives the active player {G}{G}{G} at upkeep that lasts into their main phase", () => {
    const { game } = table();
    spawn(game, "Shizuko, Caller of Autumn");
    nextTurn(game);
    const pool = game.state.players[B].manaPool;
    expect(pool.filter((u) => u.type === "G").length).toBe(3);
  });
});

describe("That Which Was Taken", () => {
  it("puts a divinity counter on another permanent, which then has indestructible", () => {
    const { game } = table();
    const taken = spawn(game, "That Which Was Taken");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    activate(game, taken, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "divinity")).toBe(1);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Loam Dweller", () => {
  it("puts a land from hand onto the battlefield tapped when you cast an Arcane spell", () => {
    const { game, a } = table();
    const dweller = spawn(game, "Loam Dweller");
    lands(game, "Forest", 3);
    const growth = toHand(game, "Unchecked Growth");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    cast(game, growth, { targets: [ref(dweller)] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Unchecked Growth", () => {
  it("gives +4/+4, and trample only to a Spirit", () => {
    const { game } = table();
    const spirit = spawn(game, "Loam Dweller");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Unchecked Growth"), { targets: [ref(spirit)] });
    cast(game, toHand(game, "Unchecked Growth"), { targets: [ref(bears)] });
    expect(pt(game, spirit)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, spirit).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Petalmane Baku", () => {
  it("may take a ki counter on a Spirit cast, and removes X of them for X mana", () => {
    const { game, a } = table();
    const baku = spawn(game, "Petalmane Baku");
    lands(game, "Forest", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Loam Dweller"));
    expect(counters(game, baku, "ki")).toBe(1);
    activate(game, baku, 0, { x: 1 });
    expect(counters(game, baku, "ki")).toBe(0);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("Ronin Warclub", () => {
  it("attaches itself to each creature that enters under your control", () => {
    const { game } = table();
    const club = spawn(game, "Ronin Warclub");
    const bears = enter(game, "Grizzly Bears");
    expect(game.state.objects[club].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});
