/**
 * Hour of Devastation, group J: the cards whose behaviour is more than a stat
 * line or a copy of an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

const cycle = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
};

describe("God-Pharaoh's Gift", () => {
  it("exiles a creature card chosen as it resolves and makes a hasty 4/4 black Zombie copy of it", () => {
    const { game, a } = table();
    spawn(game, "God-Pharaoh's Gift");
    toGraveyard(game, "Shock");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    toStep(game, "postcombat-main");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("exile");
    const [token] = named(game, "Grizzly Bears", A);
    expect(token).toBeDefined();
    expect(game.state.objects[token].isToken).toBe(true);
    expect(pt(game, token)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, token)).toEqual(["Zombie"]);
    expect(keywords(game, token).has("haste")).toBe(true);
  });

  it("does nothing when declined", () => {
    const { game, a } = table();
    spawn(game, "God-Pharaoh's Gift");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(named(game, "Grizzly Bears")).toEqual([]);
  });
});

describe("Ammit Eternal", () => {
  it("takes a -1/-1 counter when an opponent casts a spell, and loses all of them on combat damage", () => {
    const { game, a } = table();
    const ammit = spawn(game, "Ammit Eternal");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(counters(game, ammit, "-1/-1")).toBe(1);
    setCounters(game, ammit, "-1/-1", 2);
    toStep(game, "precombat-main", A);
    attack(game, a, [ammit]);
    expect(life(game, B)).toBe(17);
    expect(counters(game, ammit, "-1/-1")).toBe(0);
    expect(pt(game, ammit)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Cunning Survivor", () => {
  it("cycling a card triggers it once: +1/+0 and can't be blocked", () => {
    const { game } = table();
    const survivor = spawn(game, "Cunning Survivor");
    lands(game, "Wastes", 2);
    cycle(game, toHand(game, "Startling Development"));
    expect(pt(game, survivor)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, survivor).has("unblockable")).toBe(true);
  });
});

describe("Liliana's Defeat", () => {
  it("costs a Liliana's controller 3 life", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana Vess", B);
    setCounters(game, liliana, "loyalty", 5);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Liliana's Defeat"), { targets: [ref(liliana)] });
    expect(zone(game, liliana)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("a black creature is only destroyed", () => {
    const { game } = table();
    const zombie = spawn(game, "Accursed Horde", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Liliana's Defeat"), { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Nissa's Defeat", () => {
  it("draws a card for a Nissa, and destroys a Forest without one", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Who Shakes the World", B);
    setCounters(game, nissa, "loyalty", 5);
    const forest = spawn(game, "Forest", B);
    lands(game, "Forest", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Nissa's Defeat"), { targets: [ref(nissa)] });
    expect(zone(game, nissa)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Nissa's Defeat"), { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Tenacious Hunter", () => {
  it("has vigilance and deathtouch only while any creature has a -1/-1 counter", () => {
    const { game } = table();
    const hunter = spawn(game, "Tenacious Hunter");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, hunter).has("deathtouch")).toBe(false);
    setCounters(game, bears, "-1/-1", 1);
    expect(keywords(game, hunter).has("deathtouch")).toBe(true);
    expect(keywords(game, hunter).has("vigilance")).toBe(true);
  });
});

describe("Unconventional Tactics", () => {
  it("returns from the graveyard for {W} when a Zombie you control enters", () => {
    const { game, a } = table();
    const tactics = toGraveyard(game, "Unconventional Tactics");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    enter(game, "Accursed Horde");
    expect(zone(game, tactics)).toBe("hand");
  });
});

describe("Magmaroth", () => {
  it("removes a -1/-1 counter when you cast a noncreature spell", () => {
    const { game } = table();
    const magmaroth = spawn(game, "Magmaroth");
    setCounters(game, magmaroth, "-1/-1", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, magmaroth, "-1/-1")).toBe(1);
  });
});
