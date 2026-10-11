/**
 * Reality Fracture (FRA), batch 1, part c (2026-10-11): the set's top cards by EDHREC rank.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const jaceTokens = (game: Game, player = A): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Jace Token" && game.state.objects[id].controller === player,
  );
const manaOf = (game: Game, type: string, player = A): number =>
  game.state.players[player].manaPool.filter((unit) => unit.type === type).length;

describe("Overwrite the Multiverse", () => {
  it("exiles every creature, tokens included, and empowers Jace by the number exiled", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[spawn(game, "Soldier Token", B)].isToken = true;
    const land = lands(game, "Swamp", 6)[0];
    cast(game, toHand(game, "Overwrite the Multiverse"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, land)).toBe("battlefield");
    const [jace] = jaceTokens(game);
    expect(jace).toBeDefined();
    expect(counters(game, jace, "loyalty")).toBe(3);
  });
});

describe("Tomik, Izzet Sparkmage", () => {
  it("adds 1 to your noncombat damage to an opponent or their permanents, not to your own", () => {
    const { game } = table();
    spawn(game, "Tomik, Izzet Sparkmage");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    const mine = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(2);
  });

  it("doesn't add to combat damage", () => {
    const { game, a } = table();
    spawn(game, "Tomik, Izzet Sparkmage");
    const giant = spawn(game, "Hill Giant");
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Vigorbloom Charm", () => {
  it("puts the counter on first, then your creature fights theirs", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Vigorbloom Charm"), { modes: [2], targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("draws a card and gains 3 life", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Vigorbloom Charm"), { modes: [1] });
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(23);
  });
});

describe("Tinybones, Pocket Nuisance", () => {
  it("pings each opponent once per discard event, whoever discards and however many", () => {
    const { game } = table({ players: 3 });
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", C);
    // Bob and Carol each discard: two events, two triggers, each hitting both.
    enter(game, "Tinybones, Pocket Nuisance");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
    // Alice discards two cards at once: one event, one trigger.
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 }, []);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });
});

describe("Lyra, Archangel of Dawn", () => {
  it("puts a +1/+1 counter on each Angel you control when you gain life", () => {
    const { game } = table();
    const lyra = spawn(game, "Lyra, Archangel of Dawn");
    const serra = spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(counters(game, lyra)).toBe(1);
    expect(counters(game, serra)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Ghalta the Immovable", () => {
  it("costs {X} less, X the greatest toughness among your creatures", () => {
    const { game } = table();
    spawn(game, "Wall of Omens"); // 0/4
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const ghalta = toHand(game, "Ghalta the Immovable");
    expect(() => cast(game, ghalta)).toThrow();
    lands(game, "Plains", 1);
    cast(game, ghalta);
    expect(zone(game, ghalta)).toBe("battlefield");
  });

  it("lets a defender attack, assigning combat damage by its greater toughness", () => {
    const { game, a } = table();
    spawn(game, "Ghalta the Immovable");
    const wall = spawn(game, "Wall of Omens");
    attack(game, a, [wall]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Lich's Relic", () => {
  it("for {2}, destroys up to one creature or planeswalker each opponent controls", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Jace Beleren", C);
    const bobsOther = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    // One slot per opponent: two at a table of three.
    pickTargets(a, bobs, carols);
    cast(game, toHand(game, "Lich's Relic"));
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("graveyard");
    expect(zone(game, bobsOther)).toBe("battlefield");
  });

  it("destroys nothing if you don't pay", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bobs = spawn(game, "Hill Giant", B);
    pickModes(a);
    pickTargets(a, bobs);
    cast(game, toHand(game, "Lich's Relic"));
    expect(zone(game, bobs)).toBe("battlefield");
  });
});

describe("Koth, the Geomancer", () => {
  it("pings each opponent for any land, adding {R} only for a Mountain", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Koth, the Geomancer");
    enter(game, "Forest");
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(manaOf(game, "R")).toBe(0);
    enter(game, "Mountain");
    expect(life(game, B)).toBe(18);
    expect(manaOf(game, "R")).toBe(1);
  });
});

describe("Sphinx of False Conclusions", () => {
  it("leaves a token copy when it dies, and the token leaves none", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of False Conclusions");
    destroy(game, sphinx);
    expect(zone(game, sphinx)).toBe("graveyard");
    const [copy] = named(game, "Sphinx of False Conclusions");
    expect(copy).toBeDefined();
    expect(game.state.objects[copy].isToken).toBe(true);
    destroy(game, copy);
    expect(tokensNamed(game, "Sphinx of False Conclusions")).toBe(0);
  });
});

describe("Gideon's Memorial", () => {
  it("gives only creature tokens you control +1/+0 and vigilance", () => {
    const { game } = table();
    spawn(game, "Gideon's Memorial");
    const token = spawn(game, "Soldier Token");
    const card = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Soldier Token", B);
    game.state.objects[token].isToken = true;
    game.state.objects[theirs].isToken = true;
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, token).has("vigilance")).toBe(true);
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, card).has("vigilance")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Way of the Mentor", () => {
  it("empowers Jace 5, then each life gain puts a loyalty counter on each of your planeswalkers", () => {
    const { game } = table();
    const beleren = spawn(game, "Jace Beleren");
    const start = counters(game, beleren, "loyalty");
    enter(game, "Way of the Mentor");
    const [jace] = jaceTokens(game);
    expect(counters(game, jace, "loyalty")).toBe(5);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(counters(game, jace, "loyalty")).toBe(6);
    expect(counters(game, beleren, "loyalty")).toBe(start + 1);
  });
});

describe("Gardenize", () => {
  it("counts your creatures dying, and adds that much {G} as your first main phase begins", () => {
    const { game } = table();
    const gardenize = spawn(game, "Gardenize");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, gardenize, "charge")).toBe(2);
    toStep(game, "precombat-main");
    settle(game);
    expect(manaOf(game, "G")).toBe(2);
  });
});
