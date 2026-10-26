/**
 * Guildpact (GPT; B206), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("Cerebral Vortex", () => {
  it("deals damage equal to every card the player drew this turn, the two included", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    const vortex = toHand(game, "Cerebral Vortex");
    // Alice drew one card in her draw step already.
    cast(game, vortex, { targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
  });
});

describe("Repeal", () => {
  it("returns a nonland permanent with mana value X and draws a card", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const repeal = toHand(game, "Repeal");
    const before = hand(game, A).length;
    cast(game, repeal, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, A).length).toBe(before); // Repeal left, one card drawn
  });
});

describe("Sanguine Praetor", () => {
  it("destroys each creature with the sacrificed creature's mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const praetor = spawn(game, "Sanguine Praetor");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Hill Giant", B);
    game.dispatch({ type: "activate-ability", player: A, source: praetor, abilityIndex: 0, targets: [], sacrifice: mine });
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(zone(game, praetor)).toBe("battlefield");
  });
});

describe("Drowned Rusalka", () => {
  it("discards a card, then draws one", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const rusalka = spawn(game, "Drowned Rusalka");
    const bears = spawn(game, "Grizzly Bears");
    const handBefore = hand(game, A).length;
    const graveBefore = graveyard(game, A).length;
    game.dispatch({ type: "activate-ability", player: A, source: rusalka, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(hand(game, A).length).toBe(handBefore);
    expect(graveyard(game, A).length).toBe(graveBefore + 2); // the Bears and the discard
  });
});

describe("Guardian's Magemark and Fencer's Magemark", () => {
  it("pump each enchanted creature you control, not unenchanted ones or an opponent's", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 3);
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Guardian's Magemark"), { targets: [ref(first)] });
    expect(pt(game, first)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Fencer's Magemark"), { targets: [ref(second)] });
    expect(pt(game, first)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, second)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, first).has("first-strike")).toBe(true);
    expect(pt(game, bare)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bare).has("first-strike")).toBe(false);
  });
});

describe("Wurmweaver Coil", () => {
  it("falls off a creature that stops being green, and sacrifices for a 6/6 Wurm", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    const bears = spawn(game, "Grizzly Bears");
    const coil = toHand(game, "Wurmweaver Coil");
    cast(game, coil, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    activate(game, coil);
    expect(zone(game, coil)).toBe("graveyard");
    expect(tokensNamed(game, "6/6 Wurm Token", A)).toBe(1);

    const second = table();
    lands(second.game, "Forest", 6);
    const elf = spawn(second.game, "Grizzly Bears");
    const coil2 = toHand(second.game, "Wurmweaver Coil");
    cast(second.game, coil2, { targets: [ref(elf)] });
    second.game.debugApplyEffect(A, { kind: "become-color", target: 0, colors: ["B"], duration: "permanent" }, [ref(elf)]);
    // The state-based check runs as a player next gets priority.
    toStep(second.game, "postcombat-main");
    expect(zone(second.game, coil2)).toBe("graveyard");
  });
});

describe("Pillory of the Sleepless", () => {
  it("the enchanted creature's controller loses 1 life on their upkeep", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pillory of the Sleepless"), { targets: [ref(bears)] });
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Skyrider Trainee", () => {
  it("has flying only while enchanted", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const trainee = spawn(game, "Skyrider Trainee");
    expect(keywords(game, trainee).has("flying")).toBe(false);
    cast(game, toHand(game, "Guardian's Magemark"), { targets: [ref(trainee)] });
    expect(keywords(game, trainee).has("flying")).toBe(true);
  });
});

describe("Bloodthirst (Scab-Clan Mauler, Skarrgan Skybreaker)", () => {
  it("enters with counters only if an opponent was dealt damage this turn; Skybreaker flings its power", () => {
    const { game } = table();
    const quiet = enter(game, "Scab-Clan Mauler");
    expect(counters(game, quiet)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    const mauler = enter(game, "Scab-Clan Mauler");
    expect(counters(game, mauler)).toBe(2);
    const sky = enter(game, "Skarrgan Skybreaker");
    expect(pt(game, sky)).toEqual({ power: 6, toughness: 6 });
    lands(game, "Wastes", 1);
    activate(game, sky, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });
});
