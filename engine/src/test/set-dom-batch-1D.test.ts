/**
 * Dominaria (DOM; B128), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
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

const sacrificeFor = (game: Game, source: ObjectId, victim: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], sacrifice: victim });
  settle(game);
};

describe("Forebear's Blade", () => {
  it("moves to target creature you control when the equipped creature dies", () => {
    const { game, a } = table();
    const blade = spawn(game, "Forebear's Blade");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, blade, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    pickTargets(a, other);
    destroy(game, bears);
    settle(game);
    expect(game.state.objects[blade].attachedTo).toBe(other);
    expect(pt(game, other)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Thran Temporal Gateway", () => {
  it("puts a historic permanent card from hand onto the battlefield, never a non-historic or a legendary sorcery", () => {
    const { game, a } = table();
    const gateway = spawn(game, "Thran Temporal Gateway");
    lands(game, "Wastes", 4);
    const zahid = toHand(game, "Zahid, Djinn of the Lamp");
    const bears = toHand(game, "Grizzly Bears");
    const sorcery = toHand(game, "Karn's Temporal Sundering");
    const seen = pickFromZone(a, zahid);
    activate(game, gateway);
    expect(seen.offered).toContain(zahid);
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(sorcery);
    expect(zone(game, zahid)).toBe("battlefield");
  });
});

describe("Mishra's Self-Replicator", () => {
  it("pays {1} on a historic spell cast to copy itself", () => {
    const { game, a } = table();
    spawn(game, "Mishra's Self-Replicator");
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Forebear's Blade"));
    expect(tokensNamed(game, "Mishra's Self-Replicator", A)).toBe(1);
  });
});

describe("Chandra, Bold Pyromancer", () => {
  it("−7 deals 10 to the target player and each creature and planeswalker they control, not yours", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Bold Pyromancer");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    loyalty(game, chandra, -7, { atLeast: 7, targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Knight of Grace", () => {
  it("gets +1/+0 only while any player controls a black permanent", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of Grace");
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
    const theirs = spawn(game, "Thallid Omnivore", B);
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 2 });
    destroy(game, theirs);
    settle(game);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Thallid Omnivore");
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Thallid Omnivore", () => {
  it("gains 2 life only when the creature sacrificed was a Saproling", () => {
    const { game } = table();
    const omnivore = spawn(game, "Thallid Omnivore");
    const bears = spawn(game, "Grizzly Bears");
    const saproling = spawn(game, "Saproling Token");
    lands(game, "Swamp", 2);
    sacrificeFor(game, omnivore, bears);
    expect(pt(game, omnivore)).toEqual({ power: 5, toughness: 5 });
    expect(life(game)).toBe(20);
    sacrificeFor(game, omnivore, saproling);
    expect(pt(game, omnivore)).toEqual({ power: 7, toughness: 7 });
    expect(life(game)).toBe(22);
  });
});

describe("Wild Onslaught", () => {
  it("puts two counters on each creature you control when kicked", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Wild Onslaught"), { kicked: true });
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Keldon Warcaller and The First Eruption", () => {
  it("attacking puts a lore counter on the Saga, whose chapter III sacrifices a Mountain and deals 3 to each creature", () => {
    const { game, a } = table();
    const warcaller = spawn(game, "Keldon Warcaller");
    const saga = spawn(game, "The First Eruption");
    game.state.objects[saga].counters.lore = 2;
    const mountain = spawn(game, "Mountain");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, saga);
    a.chooseSacrificesFn = (_view, eligible) => eligible.slice(0, 1);
    attack(game, a, [warcaller]);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, warcaller)).toBe("graveyard");
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("chapter III deals no damage without a Mountain to sacrifice", () => {
    const { game, a } = table();
    const warcaller = spawn(game, "Keldon Warcaller");
    const saga = spawn(game, "The First Eruption");
    game.state.objects[saga].counters.lore = 2;
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, saga);
    attack(game, a, [warcaller]);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });
});

describe("Zahid, Djinn of the Lamp", () => {
  it("is cast for {3}{U} by tapping an untapped artifact you control", () => {
    const { game } = table();
    const blade = spawn(game, "Forebear's Blade");
    lands(game, "Island", 4);
    const zahid = toHand(game, "Zahid, Djinn of the Lamp");
    cast(game, zahid, { altCost: true });
    expect(zone(game, zahid)).toBe("battlefield");
    expect(game.state.objects[blade].tapped).toBe(true);
  });
});

describe("Temporal Machinations", () => {
  it("bounces the creature and draws only if you control an artifact", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Temporal Machinations"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game).length).toBe(before);
    spawn(game, "Forebear's Blade");
    const again = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Temporal Machinations"), { targets: [ref(again)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Firefist Adept", () => {
  it("deals damage equal to the Wizards you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Ghitu Lavarunner");
    const theirs = spawn(game, "Thallid Omnivore", B);
    pickTargets(a, theirs);
    enter(game, "Firefist Adept");
    expect(game.state.objects[theirs].damageMarked).toBe(2);
  });
});

describe("Tempest Djinn", () => {
  it("gets +1/+0 for each basic Island you control", () => {
    const { game } = table();
    const djinn = spawn(game, "Tempest Djinn");
    lands(game, "Island", 3);
    lands(game, "Island", 1, B);
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Ghitu Lavarunner", () => {
  it("gets +1/+0 and haste with two instant or sorcery cards in your graveyard", () => {
    const { game } = table();
    const runner = spawn(game, "Ghitu Lavarunner");
    expect(pt(game, runner)).toEqual({ power: 1, toughness: 2 });
    game.debugSpawn("Soul Salvage", A, "graveyard");
    game.debugSpawn("Temporal Machinations", A, "graveyard");
    expect(graveyard(game).length).toBeGreaterThanOrEqual(2);
    expect(pt(game, runner)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, runner).has("haste")).toBe(true);
  });
});
