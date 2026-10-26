/**
 * Portal Three Kingdoms and Urza's Destiny (PTK, UDS) — group D of batch 208.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Zhang He, Wei General", () => {
  it("pumps each other creature you control, not itself, when it attacks", () => {
    const { game, a } = table();
    const zhang = spawn(game, "Zhang He, Wei General");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [zhang]);
    expect(pt(game, zhang)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Emperor Crocodile", () => {
  it("is sacrificed once you control no other creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const croc = spawn(game, "Emperor Crocodile");
    settle(game);
    expect(zone(game, croc)).toBe("battlefield");
    destroy(game, bear);
    settle(game);
    expect(zone(game, croc)).toBe("graveyard");
  });
});

describe("Landslide", () => {
  it("sacrifices the chosen Mountains and deals that much damage", () => {
    const { game, a } = table();
    const mountains = lands(game, "Mountain", 3);
    const spell = toHand(game, "Landslide");
    pickPermanents(a, mountains[1], mountains[2]);
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, mountains[0])).toBe("battlefield");
    expect(zone(game, mountains[1])).toBe("graveyard");
    expect(zone(game, mountains[2])).toBe("graveyard");
  });
});

describe("Bloodshot Cyclops", () => {
  it("deals the sacrificed creature's power", () => {
    const { game } = table();
    const cyclops = spawn(game, "Bloodshot Cyclops");
    const giant = spawn(game, "Hill Giant");
    game.dispatch({ type: "activate-ability", player: A, source: cyclops, abilityIndex: 0, targets: [ref(B)], sacrifice: giant });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Carnival of Souls", () => {
  it("loses you 1 life and adds {B} when any creature enters", () => {
    const { game } = table();
    spawn(game, "Carnival of Souls");
    enter(game, "Grizzly Bears", B);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "B").length).toBe(1);
  });
});

describe("Chime of Night", () => {
  it("destroys target nonblack creature when it goes to the graveyard from the battlefield", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Hill Giant", B);
    const chime = toHand(game, "Chime of Night");
    cast(game, chime, { targets: [ref(bear)] });
    expect(zone(game, chime)).toBe("battlefield");
    pickTargets(a, victim);
    // The Aura itself destroyed: put into a graveyard from the battlefield.
    destroy(game, chime);
    expect(zone(game, chime)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Thran Golem", () => {
  it("gets +2/+2, flying, first strike and trample only while enchanted", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const golem = spawn(game, "Thran Golem");
    expect(pt(game, golem)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, golem).has("flying")).toBe(false);
    cast(game, toHand(game, "Chime of Night"), { targets: [ref(golem)] });
    expect(pt(game, golem)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, golem).has("flying")).toBe(true);
    expect(keywords(game, golem).has("first-strike")).toBe(true);
    expect(keywords(game, golem).has("trample")).toBe(true);
  });
});

describe("Goblin Marshal", () => {
  it("makes two Goblins when it enters and two more when it dies", () => {
    const { game } = table();
    const marshal = enter(game, "Goblin Marshal");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    destroy(game, marshal);
    settle(game);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
  });
});

describe("Aether Sting", () => {
  it("deals 1 damage to an opponent who casts a creature spell", () => {
    const { game } = table();
    spawn(game, "Aether Sting");
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    nextTurn(game);
    cast(game, bears, { player: B });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
