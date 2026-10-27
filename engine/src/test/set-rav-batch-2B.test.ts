/**
 * Ravnica: City of Guilds (B234) — group B: Disembowel's X filter, Necromantic
 * Thirst's enchanted-creature trigger, Empty the Catacombs' "each player
 * returns all", Sunhome Enforcer's combat-damage lifegain, Instill Furor's
 * granted "unless it attacked", Sadistic Augermage's per-player hand-to-top,
 * Halcyon Glaze's animation.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  nextTurn,
  types,
  zone,
  destroy,
} from "./harness.js";

describe("Disembowel", () => {
  it("destroys a creature whose mana value is X, and can't target one that isn't", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Disembowel"), { targets: [ref(giant)], x: 2 })).toThrow();
    cast(game, toHand(game, "Disembowel"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Necromantic Thirst", () => {
  it("returns a creature card when the enchanted creature deals combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const dead = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Necromantic Thirst"), { targets: [ref(bears)] });
    pickTargets(a, dead);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, dead)).toBe("hand");
  });
});

describe("Empty the Catacombs", () => {
  it("returns every creature card from each player's graveyard, leaving the rest", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const mine = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    const bolt = toGraveyard(game, "Lightning Bolt");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Empty the Catacombs"));
    for (const id of mine) expect(zone(game, id)).toBe("hand");
    expect(hand(game, B)).toContain(theirs);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Sunhome Enforcer", () => {
  it("gains life equal to the combat damage it deals", () => {
    const { game, a } = table();
    const enforcer = spawn(game, "Sunhome Enforcer");
    attack(game, a, [enforcer]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Instill Furor", () => {
  it("sacrifices the enchanted creature at its controller's end step only if it didn't attack", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const idle = spawn(game, "Grizzly Bears");
    const raider = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Instill Furor"), { targets: [ref(idle)] });
    cast(game, toHand(game, "Instill Furor"), { targets: [ref(raider)] });
    attack(game, a, [raider]);
    nextTurn(game);
    expect(zone(game, idle)).toBe("graveyard");
    expect(zone(game, raider)).toBe("battlefield");
  });
});

describe("Sadistic Augermage", () => {
  it("has each player put a card from their hand on top of their library when it dies", () => {
    const { game } = table();
    const mage = spawn(game, "Sadistic Augermage");
    const aHand = hand(game, A).length;
    const bHand = hand(game, B).length;
    destroy(game, mage);
    expect(graveyard(game, A)).toContain(mage);
    expect(hand(game, A).length).toBe(aHand - 1);
    expect(hand(game, B).length).toBe(bHand - 1);
  });
});

describe("Halcyon Glaze", () => {
  it("becomes a 4/4 flying Illusion creature when you cast a creature spell", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const glaze = enter(game, "Halcyon Glaze");
    expect(types(game, glaze)).not.toContain("creature");
    cast(game, toHand(game, "Grizzly Bears"));
    expect(types(game, glaze)).toContain("creature");
    expect(pt(game, glaze)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, glaze).has("flying")).toBe(true);
  });
});
