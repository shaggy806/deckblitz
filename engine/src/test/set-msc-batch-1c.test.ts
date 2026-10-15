/**
 * Marvel Super Heroes Commander (MSC), batch 1, part c (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  named,
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
  watchTargets,
  zone,
} from "./harness.js";

describe("Giant-Man, Gargantuan Genius", () => {
  it("adds {G} for each creature you control with power 4 or greater at the beginning of your first main phase", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Giant-Man, Gargantuan Genius");
    spawn(game, "Craw Wurm");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    toStep(game, "precombat-main");
    settle(game);
    expect(poolCounts(game.state.players[A].manaPool).G).toBe(2);
  });
});

describe("Criminal Enterprise", () => {
  it("drains each opponent for 1 when a Villain you control dies, not another creature", () => {
    const { game } = table();
    enter(game, "Criminal Enterprise");
    const [villain] = named(game, "Villain Token", A);
    expect(villain).toBeDefined();
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect([life(game, A), life(game, B)]).toEqual([20, 20]);
    destroy(game, villain);
    settle(game);
    expect([life(game, A), life(game, B)]).toEqual([21, 19]);
  });
});

describe("Captain America, Steve Rogers", () => {
  it("puts a +1/+1 counter and indestructible on another creature you control as he attacks", () => {
    const { game, a } = table();
    const cap = spawn(game, "Captain America, Steve Rogers");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [cap]);
    expect(seen.offered[0]).toContain(lions);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(cap);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(counters(game, cap)).toBe(0);
  });
});

describe("T'Chaka, Venerable King", () => {
  it("mills three and may put an artifact or land card from among them into the hand", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Lightning Bolt");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [ring];
    };
    enter(game, "T'Chaka, Venerable King");
    expect(offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("hand");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName !== "T'Chaka, Venerable King")).toHaveLength(2);
  });

  it("makes you the monarch from the graveyard only while you control your commander", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const tchaka = toGraveyard(game, "T'Chaka, Venerable King");
    expect(() => activate(game, tchaka, 0)).toThrow();
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    activate(game, tchaka, 0);
    expect(game.state.monarch).toBe(A);
    expect(zone(game, tchaka)).toBe("exile");
  });
});

describe("Daredevil's Billy Club", () => {
  it("deals 2 damage to any target and 1 damage to you as it enters", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Daredevil's Billy Club");
    expect([life(game, A), life(game, B)]).toEqual([19, 18]);
  });
});

describe("X-23, Deadly Weapon", () => {
  it("puts a +1/+1 counter on the entering Mutant and one on X-23", () => {
    const { game } = table();
    const x23 = spawn(game, "X-23, Deadly Weapon");
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, x23)).toBe(0);
    const colossus = enter(game, "Colossus, Steel Stalwart");
    expect(counters(game, colossus)).toBe(1);
    expect(counters(game, x23)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Black Panther, Claws of Bast", () => {
  it("counters a creature you control that attacks alone, and nothing when two attack", () => {
    const { game, a } = table();
    spawn(game, "Black Panther, Claws of Bast");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
  });

  it("doesn't trigger for two attackers", () => {
    const { game, a } = table();
    const panther = spawn(game, "Black Panther, Claws of Bast");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears, panther]);
    expect(counters(game, bears) + counters(game, panther)).toBe(0);
  });
});

describe("Alex Wilder, Runaway", () => {
  it("pumps and hastes a creature cast from the graveyard, not one cast from the hand", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const alex = toGraveyard(game, "Alex Wilder, Runaway");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    game.dispatch({ type: "cast-spell", player: A, card: alex, targets: [], via: "escape" });
    settle(game);
    expect(zone(game, alex)).toBe("battlefield");
    expect(pt(game, alex)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, alex).has("haste")).toBe(true);

    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("doesn't trigger for a creature put onto the battlefield without being cast", () => {
    const { game } = table();
    spawn(game, "Alex Wilder, Runaway");
    const bears = enter(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Repulsor Bots", () => {
  it("returns up to two other artifacts and/or creatures, never itself", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    let offered: readonly (ObjectId | PlayerId)[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(ring), ref(bears)];
    };
    const bots = enter(game, "Repulsor Bots");
    expect(offered).not.toContain(bots);
    expect(offered).not.toContain(forest);
    expect([zone(game, ring), zone(game, bears), zone(game, bots)]).toEqual(["hand", "hand", "battlefield"]);
  });
});

describe("Iron Fist, Hero for Hire", () => {
  it("divides 5 damage among up to five targets, then puts five +1/+1 counters on him", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const fist = spawn(game, "Iron Fist, Hero for Hire");
    const bears = spawn(game, "Grizzly Bears", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: fist,
      abilityIndex: 0,
      targets: [ref(bears), ref(B)],
      division: [2, 3],
    });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(counters(game, fist)).toBe(5);
    // Only once.
    expect(() => activate(game, fist, 0)).toThrow();
  });

  it("can be activated with no targets for the counters alone", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const fist = spawn(game, "Iron Fist, Hero for Hire");
    activate(game, fist, 0);
    expect(counters(game, fist)).toBe(5);
    expect(life(game, B)).toBe(20);
  });
});

describe("Villainous Syndication", () => {
  it("mills and adds a plan counter per Villain tapped; the fourth sacrifices it and reanimates a creature card", () => {
    const { game, a } = table();
    const syndication = spawn(game, "Villainous Syndication");
    const villains = [0, 1, 2, 3].map(() => spawn(game, "Villain Token"));
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    for (let i = 0; i < 3; i++) activate(game, syndication, 0);
    expect(counters(game, syndication, "plan")).toBe(3);
    expect(zone(game, bears)).toBe("graveyard");
    activate(game, syndication, 0);
    expect(zone(game, syndication)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(villains.filter((v) => game.state.objects[v].tapped)).toHaveLength(4);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(4);
  });
});

describe("Graviton, Fundamental Force", () => {
  it("taps target creature on your second draw of the turn", () => {
    const { game, a } = table();
    spawn(game, "Graviton, Fundamental Force");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    pickModes(a, 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Divination"));
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Bob, Reluctant HYDRA Agent", () => {
  it("returns to his owner's hand when he attacks alone, draining each opponent for 2", () => {
    const { game, a } = table();
    const bob = spawn(game, "Bob, Reluctant HYDRA Agent");
    attack(game, a, [bob]);
    expect(zone(game, bob)).toBe("hand");
    expect([life(game, A), life(game, B)]).toEqual([22, 18]);
  });

  it("drains nobody if he's gone before the trigger resolves", () => {
    const { game, a } = table();
    const bob = spawn(game, "Bob, Reluctant HYDRA Agent");
    a.declareAttackersFn = () => [{ attacker: bob, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, bob);
    settle(game);
    expect(zone(game, bob)).toBe("graveyard");
    expect([life(game, A), life(game, B)]).toEqual([20, 20]);
  });
});

describe("Colossus, Steel Stalwart", () => {
  it("gives other Mutants you control +1/+1 and has indestructible only during your turn", () => {
    const { game } = table();
    const colossus = spawn(game, "Colossus, Steel Stalwart");
    const x23 = spawn(game, "X-23, Deadly Weapon");
    const theirs = spawn(game, "X-23, Deadly Weapon", B);
    expect(pt(game, colossus)).toEqual({ power: 4, toughness: 5 });
    expect(pt(game, x23)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, colossus).has("indestructible")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, colossus).has("indestructible")).toBe(false);
  });
});

describe("Iconic Shield", () => {
  it("gives the equipped creature +1/+2 and an attack trigger granting another attacker indestructible", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const shield = spawn(game, "Iconic Shield");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears"); // stays home: not attacking, not offered
    activate(game, shield, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    const seen = watchTargets(a, () => [lions]);
    attack(game, a, [bears, lions, other]);
    expect([...seen.offered[0]].sort()).toEqual([lions, other].sort());
    expect(keywords(game, lions).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });
});

describe("General Thunderbolt Ross", () => {
  it("gives attacking creatures +1/+0 when he and at least two others attack", () => {
    const { game, a } = table();
    const ross = spawn(game, "General Thunderbolt Ross");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [ross, bears, lions].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, ross).power).toBe(2);
    expect(pt(game, bears).power).toBe(3);
    expect(pt(game, lions).power).toBe(3);
    expect(pt(game, home).power).toBe(2);
  });

  it("doesn't trigger with only one other attacker", () => {
    const { game, a } = table();
    const ross = spawn(game, "General Thunderbolt Ross");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [ross, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, ross).power).toBe(1);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Gert and Old Lace, Runaways", () => {
  it("may discard a card to search for a basic land card", () => {
    const { game, a } = table();
    toHand(game, "Mountain");
    const handBefore = hand(game).length;
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    pickModes(a, 0);
    let searched: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      searched = eligible;
      return eligible.slice(0, 1);
    };
    enter(game, "Gert and Old Lace, Runaways");
    expect(searched.length).toBeGreaterThan(0);
    expect(searched.every((id) => game.state.objects[id].cardName === "Wastes")).toBe(true);
    // One card discarded, one basic land (a Wastes) found.
    expect(graveyard(game)).toHaveLength(1);
    expect(hand(game)).toHaveLength(handBefore);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(libraryBefore - 1);
  });

  it("does nothing if declined", () => {
    const { game, a } = table();
    const mountain = toHand(game, "Mountain");
    const before = hand(game).length;
    pickModes(a);
    enter(game, "Gert and Old Lace, Runaways");
    expect(zone(game, mountain)).toBe("hand");
    expect(hand(game)).toHaveLength(before);
  });
});
