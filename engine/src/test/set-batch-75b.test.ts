/**
 * Set walk batch 75, part b (2026-10-15): the rest of Marvel Super Heroes (MSH).
 * Written on the shared table in `harness.ts`.
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Project Deathlok Soldier", () => {
  it("returns from the graveyard to the hand for {2}{B}", () => {
    const { game } = table();
    const soldier = toGraveyard(game, "Project Deathlok Soldier");
    lands(game, "Swamp", 3);
    activate(game, soldier, 0);
    expect(zone(game, soldier)).toBe("hand");
  });
});

describe("Super Villain Lockup", () => {
  it("exiles a tapped creature an opponent controls until it leaves, never an untapped one", () => {
    const { game, a } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const alsoTapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const seen = watchTargets(a, (offered) => offered.map(() => tapped));
    const lockup = enter(game, "Super Villain Lockup");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([tapped, alsoTapped]));
    expect(seen.offered[0]).not.toContain(untapped);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, tapped)).toBe("exile");
    destroy(game, lockup);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(2);
  });
});

describe("HYDRA Infiltration", () => {
  it("makes the opponent discard two, then drains 1 whenever a creature attacks alone", () => {
    const { game, a } = table();
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickTargets(a, B);
    enter(game, "HYDRA Infiltration");
    expect(hand(game, B)).toHaveLength(before - 2);
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [bear]);
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(21);
  });

  it("doesn't drain when two creatures attack", () => {
    const { game, a } = table();
    spawn(game, "HYDRA Infiltration");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickTargets(a, B);
    attack(game, a, bears);
    expect(life(game, B)).toBe(16);
    expect(life(game)).toBe(20);
  });
});

describe("Cruel Alliance", () => {
  it("exiles only a creature with mana value 3 or less without teamwork", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Cruel Alliance"), { targets: [ref(angel)] })).toThrow();
    cast(game, toHand(game, "Cruel Alliance"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(20);
  });

  it("with teamwork, exiles any creature and gains 3 life", () => {
    const { game } = table();
    const helper = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Cruel Alliance"), { targets: [ref(angel)], kicked: true, tap: [helper] });
    expect(zone(game, angel)).toBe("exile");
    expect(game.state.objects[helper].tapped).toBe(true);
    expect(life(game)).toBe(23);
  });
});

describe("Panther Pounce", () => {
  it("the target player investigates; the creature gets +1/+0, flying and untaps", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Panther Pounce"), { targets: [ref(B), ref(bear)] });
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bear).has("flying")).toBe(true);
    expect(game.state.objects[bear].tapped).toBe(false);
  });
});

describe("War Machine, Legacy of Iron", () => {
  it("gives another creature you control +X/+0 at the beginning of combat, X his power", () => {
    const { game, a } = table();
    const machine = spawn(game, "War Machine, Legacy of Iron");
    game.state.objects[machine].counters = { "+1/+1": 2 };
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bear]);
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bear);
    expect(seen.offered[0]).not.toContain(machine);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("HYDRA Troopers", () => {
  it("creates a tapped Villain with two creature cards in the graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    enter(game, "HYDRA Troopers");
    const villains = named(game, "Villain Token", A);
    expect(villains).toHaveLength(1);
    expect(game.state.objects[villains[0]].tapped).toBe(true);
    expect(graveyard(game)).toHaveLength(2);
  });

  it("otherwise mills two", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    enter(game, "HYDRA Troopers");
    expect(named(game, "Villain Token", A)).toHaveLength(0);
    expect(graveyard(game)).toHaveLength(3);
  });
});

describe("Luke Cage, Power Man", () => {
  it("gets +2/+0 and indestructible when he attacks alone", () => {
    const { game, a } = table();
    const luke = spawn(game, "Luke Cage, Power Man");
    attack(game, a, [luke]);
    expect(pt(game, luke)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, luke).has("indestructible")).toBe(true);
    expect(life(game, B)).toBe(16);
  });

  it("gets nothing attacking with another creature", () => {
    const { game, a } = table();
    const luke = spawn(game, "Luke Cage, Power Man");
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [luke, bear]);
    expect(pt(game, luke)).toEqual({ power: 2, toughness: 5 });
    expect(keywords(game, luke).has("indestructible")).toBe(false);
  });
});

describe("Hulkling, Burgeoning Bruiser", () => {
  it("grows when another creature with greater power or toughness enters, not a smaller one", () => {
    const { game } = table();
    const hulkling = spawn(game, "Hulkling, Burgeoning Bruiser");
    enter(game, "Grizzly Bears");
    expect(counters(game, hulkling)).toBe(0);
    enter(game, "Hill Giant");
    expect(counters(game, hulkling)).toBe(1);
    // Now 3/4: a 2/4 isn't greater in either.
    enter(game, "Wall of Wood");
    expect(counters(game, hulkling)).toBe(1);
    enter(game, "Hill Giant", B);
    expect(counters(game, hulkling)).toBe(1);
  });
});

describe("Ant-Man's Army", () => {
  it("creates a Food or a Treasure, the controller's choice", () => {
    const { game, a } = table();
    pickModes(a, 1);
    enter(game, "Ant-Man's Army");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });
});

describe("Justice, Vance Astrovik", () => {
  it("returns up to one nonland, nontoken permanent, and grows when another of yours is returned", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const land = spawn(game, "Island");
    game.debugApplyEffect(A, { kind: "create-token", token: "Villain Token", count: 1 });
    settle(game);
    const token = named(game, "Villain Token")[0];
    const seen = watchTargets(a, () => [ring]);
    const justice = enter(game, "Justice, Vance Astrovik");
    expect(seen.offered[0]).toContain(justice);
    expect(seen.offered[0]).not.toContain(land);
    expect(seen.offered[0]).not.toContain(token);
    expect(zone(game, ring)).toBe("hand");
    expect(counters(game, justice)).toBe(1);
    // An opponent's permanent, or a land of yours, returned: no counter.
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(theirs)]);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(land)]);
    settle(game);
    expect(counters(game, justice)).toBe(1);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(token)]);
    settle(game);
    expect(counters(game, justice)).toBe(2);
  });
});

describe("Giant-Sized Flying Ant", () => {
  it("taps or untaps target nonland permanent", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickModes(a, 0);
    pickTargets(a, giant);
    enter(game, "Giant-Sized Flying Ant");
    expect(game.state.objects[giant].tapped).toBe(true);
    pickModes(a, 1);
    pickTargets(a, mine);
    enter(game, "Giant-Sized Flying Ant");
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Hellcat, Undying Vigilante", () => {
  it("returns once with a +1/+1 counter, no abilities but haste", () => {
    const { game } = table();
    spawn(game, "Hellcat, Undying Vigilante");
    destroy(game, named(game, "Hellcat, Undying Vigilante")[0]);
    const back = named(game, "Hellcat, Undying Vigilante");
    expect(back).toHaveLength(1);
    const cat = back[0];
    expect(game.state.objects[cat].controller).toBe(A);
    expect(counters(game, cat)).toBe(1);
    expect(pt(game, cat)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, cat).has("haste")).toBe(true);
    // She lost her dies ability: this time she stays dead.
    destroy(game, cat);
    expect(named(game, "Hellcat, Undying Vigilante")).toHaveLength(0);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Agents of S.H.I.E.L.D.", () => {
  it("gives a creature attacking alone +1/+1", () => {
    const { game, a } = table();
    spawn(game, "Agents of S.H.I.E.L.D.");
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [bear]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(17);
  });
});

describe("Killmonger, Scourge of Wakanda", () => {
  it("may sacrifice another creature to destroy a nonland permanent an opponent controls", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring", B);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).toContain(bear);
      return [bear];
    };
    pickModes(a, 0);
    pickTargets(a, ring);
    const killmonger = enter(game, "Killmonger, Scourge of Wakanda");
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, killmonger)).toBe("battlefield");
  });

  it("gets +2/+1 with two or more creature cards in your graveyard", () => {
    const { game } = table();
    const killmonger = spawn(game, "Killmonger, Scourge of Wakanda");
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, killmonger)).toEqual({ power: 3, toughness: 3 });
    toGraveyard(game, "Hill Giant");
    expect(pt(game, killmonger)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Mockingbird, Ace Agent", () => {
  it("gets a counter when you cast a spell targeting a creature you control, not an opponent's", () => {
    const { game } = table();
    const bird = spawn(game, "Mockingbird, Ace Agent");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(counters(game, bird)).toBe(0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] });
    expect(counters(game, bird)).toBe(1);
  });
});

describe("Iron Fist, Living Weapon", () => {
  it("gains a {T} damage ability for the turn when you cast a spell targeting a creature you control", () => {
    const { game } = table();
    const fist = spawn(game, "Iron Fist, Living Weapon");
    lands(game, "Forest", 1);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === fist)).toBe(false);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(fist)] });
    const offer = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === fist);
    if (offer?.kind !== "activate-ability") throw new Error("not offered");
    // "Any other target": never Iron Fist himself.
    expect(() => activate(game, fist, offer.abilityIndex, { targets: [ref(fist)] })).toThrow();
    activate(game, fist, offer.abilityIndex, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(game.state.objects[fist].tapped).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === fist)).toBe(false);
  });
});
