/**
 * Recheck list R1, group D (2026-10-27): cards once left blocked whose records
 * no longer name an open need, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
  controller,
  destroy,
} from "./harness.js";

describe("Brood Sliver", () => {
  it("the Sliver's controller makes the token, under their own control", () => {
    const { game, b } = table();
    spawn(game, "Brood Sliver", A);
    game.debugApplyEffect(B, { kind: "create-token", token: "Sliver Token", count: 1 });
    const sliver = named(game, "Sliver Token", B)[0];
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: sliver, defender: A }];
    pickModes(b, 0);
    toStep(game, "postcombat-main", B);
    expect(tokensNamed(game, "Sliver Token", B)).toBe(2);
    expect(tokensNamed(game, "Sliver Token", A)).toBe(0);
  });
});

describe("Elena, Turk Recruit", () => {
  it("returns only a non-Assassin historic card", () => {
    const { game, a } = table();
    const thopter = toGraveyard(game, "Ornithopter");
    const legend = toGraveyard(game, "Isamaru, Hound of Konda");
    const bears = toGraveyard(game, "Grizzly Bears");
    const assassin = toGraveyard(game, "Elena, Turk Recruit");
    const seen = watchTargets(a, () => [thopter]);
    enter(game, "Elena, Turk Recruit");
    expect(seen.offered[0]).toContain(thopter);
    expect(seen.offered[0]).toContain(legend);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(assassin);
    expect(zone(game, thopter)).toBe("hand");
  });
});

describe("Éomer, Marshal of Rohan", () => {
  it("untaps your creatures when attacking legends die at once", () => {
    const { game, a } = table();
    const eomer = spawn(game, "Éomer, Marshal of Rohan");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const shandlar = spawn(game, "Sir Shandlar of Eberyn");
    a.declareAttackersFn = () => [eomer, isamaru, shandlar].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(game.state.objects[eomer].tapped).toBe(true);
    game.debugApplyEffect(B, {
      kind: "destroy-all",
      filter: { supertype: "legendary", notName: "Éomer, Marshal of Rohan" },
    });
    settle(game);
    expect(zone(game, isamaru)).toBe("graveyard");
    expect(zone(game, shandlar)).toBe("graveyard");
    expect(game.state.objects[eomer].tapped).toBe(false);
  });
});

describe("Gift of Estates", () => {
  it("finds Plains when an opponent has more lands", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Wastes", 3, B);
    const p1 = toLibrary(game, "Plains");
    const p2 = toLibrary(game, "Plains");
    pickFromZone(a, p1, p2);
    cast(game, toHand(game, "Gift of Estates"));
    expect(zone(game, p1)).toBe("hand");
    expect(zone(game, p2)).toBe("hand");
  });
});

describe("Nazgûl Battle-Mace", () => {
  it("equipped creature has the keywords and steals what an opponent sacrifices unless they pay", () => {
    const { game, b } = table();
    const mace = spawn(game, "Nazgûl Battle-Mace");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, mace, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    const theirs = spawn(game, "Grizzly Bears", B);
    b.chooseModesFn = () => [];
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
  });
});

describe("Of Herbs and Stewed Rabbit", () => {
  it("makes Food with no target, then a Halfling per Food", () => {
    const { game, a } = table();
    pickTargets(a, null);
    const saga = enter(game, "Of Herbs and Stewed Rabbit");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(tokensNamed(game, "Halfling Token", A)).toBe(2);
  });
});

describe("Rundvelt Hordemaster", () => {
  it("pumps other Goblins and lets you cast a Goblin exiled off a death", () => {
    const { game } = table();
    spawn(game, "Rundvelt Hordemaster");
    const piker = spawn(game, "Goblin Piker");
    expect(pt(game, piker)).toEqual({ power: 3, toughness: 2 });
    const goblin = toLibrary(game, "Raging Goblin");
    destroy(game, piker);
    expect(zone(game, goblin)).toBe("exile");
    lands(game, "Mountain", 1);
    cast(game, goblin, { via: "impulse" });
    expect(zone(game, goblin)).toBe("battlefield");
  });
});

describe("Sephiroth, Fallen Hero", () => {
  it("makes the creature it marks a 7/5, but not an unmodified one", () => {
    const { game, a } = table();
    const seph = spawn(game, "Sephiroth, Fallen Hero");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [seph]);
    expect(counters(game, bears, "cell")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 5 });
    expect(pt(game, elves)).toEqual({ power: 1, toughness: 1 });
  });

  it("The Reunion returns it tapped by sacrificing a modified creature", () => {
    const { game } = table();
    const seph = toGraveyard(game, "Sephiroth, Fallen Hero");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    lands(game, "Wastes", 3);
    game.dispatch({ type: "activate-ability", player: A, source: seph, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, seph)).toBe("battlefield");
    expect(game.state.objects[seph].tapped).toBe(true);
    expect(graveyard(game)).toContain(bears);
  });
});

describe("Tail Swipe", () => {
  it("pumps yours in a main phase, then they fight", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Tail Swipe"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Shelinda, Yevon Acolyte", () => {
  it("counters a smaller creature, else Shelinda", () => {
    const { game } = table();
    const shelinda = spawn(game, "Shelinda, Yevon Acolyte");
    const elves = enter(game, "Llanowar Elves");
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, shelinda)).toBe(0);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, shelinda)).toBe(1);
  });
});

describe("Carnivorous Canopy", () => {
  it("proliferates off a cheap permanent, not an expensive one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    const thopter = spawn(game, "Ornithopter", B);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Carnivorous Canopy"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
    cast(game, toHand(game, "Carnivorous Canopy"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Berserk", () => {
  it("destroys the creature at end step only if it attacked", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const stayer = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Berserk"), { targets: [ref(attacker)] });
    cast(game, toHand(game, "Berserk"), { targets: [ref(stayer)] });
    expect(pt(game, attacker)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, attacker).has("trample")).toBe(true);
    attack(game, a, [attacker]);
    nextTurn(game);
    expect(zone(game, attacker)).toBe("graveyard");
    expect(zone(game, stayer)).toBe("battlefield");
  });
});

describe("Thraben Watcher", () => {
  it("pumps other nontoken creatures only", () => {
    const { game } = table();
    const watcher = spawn(game, "Thraben Watcher");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Sliver Token", count: 1 });
    const token = named(game, "Sliver Token", A)[0];
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, watcher)).toEqual({ power: 2, toughness: 2 });
  });
});
