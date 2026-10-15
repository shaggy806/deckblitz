/**
 * Marvel Super Heroes Commander (MSC), batch 1, part b (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  C,
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
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** `caster` casts `spell` at `target`, after the others pass to them. */
function castAs(game: Game, caster: PlayerId, spell: string, target: ObjectId): void {
  for (let i = 0; i < 12 && game.state.priority.holder !== caster; i += 1) {
    const holder = game.state.priority.holder;
    if (holder === null) break;
    game.dispatch({ type: "pass-priority", player: holder });
  }
  const card = toHand(game, spell, caster);
  game.dispatch({ type: "cast-spell", player: caster, card, targets: [ref(target)] });
}

describe("Hulkling, Young Avenger", () => {
  it("becomes a 4/4 flying copy of another creature named Hulkling until end of turn, keeping this ability", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const hulkling = spawn(game, "Hulkling, Young Avenger");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Opt"));
    expect(nameOf(game.state.objects[hulkling])).toBe("Hulkling, Young Avenger");
    expect(pt(game, hulkling)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, hulkling).has("flying")).toBe(true);
    expect(subtypes(game, hulkling)).toEqual(["Giant"]);
    // Still has the copy trigger: another noncreature spell makes him a copy again.
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(subtypes(game, hulkling)).toEqual(["Bear"]);
    expect(pt(game, hulkling)).toEqual({ power: 4, toughness: 4 });
    game.advanceUntil((s) => s.turn.number === 2);
    expect(subtypes(game, hulkling)).toEqual(["Kree", "Skrull", "Hero"]);
  });
});

describe("Crossover Collaboration", () => {
  it("makes a Treasure only when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Crossover Collaboration"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(game.state.zones.shared.exile.length).toBeGreaterThanOrEqual(2);
    cast(game, toHand(game, "Crossover Collaboration"), { kicked: true, tap: [bears] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Black Bolt, Inhuman King", () => {
  it("Lethal Voice destroys a nonland permanent of the player whose spell targeted him, no one else's", () => {
    const { game, a } = table({ players: 3 });
    const bolt = spawn(game, "Black Bolt, Inhuman King");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    const carolsBears = spawn(game, "Grizzly Bears", C);
    const carolsLand = spawn(game, "Mountain", C);
    lands(game, "Mountain", 1, C);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot.find((id) => id === carols) ?? null));
    castAs(game, C, "Shock", bolt);
    settle(game);
    expect(seen.asked).toBeGreaterThan(0);
    expect([...seen.offered[0]].sort()).toEqual([carols, carolsBears].sort());
    expect(seen.offered[0]).not.toContain(bobs);
    expect(seen.offered[0]).not.toContain(carolsLand);
    expect(zone(game, carols)).toBe("graveyard");
    expect(zone(game, carolsBears)).toBe("battlefield");
    expect(zone(game, bobs)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("battlefield");
  });
});

describe("Hero in Training", () => {
  it("draws, and gains 2 life only with another Hero", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Hero in Training");
    expect(hand(game)).toHaveLength(before + 1);
    expect(life(game)).toBe(20);
    spawn(game, "Hawkeye, Bowslinger");
    enter(game, "Hero in Training");
    expect(life(game)).toBe(22);
  });
});

describe("Wondrous Revival", () => {
  it("returns up to three Hero creature cards, and only Heroes", () => {
    const { game } = table();
    lands(game, "Plains", 12);
    const heroes = [
      toGraveyard(game, "Hero in Training"),
      toGraveyard(game, "Hawkeye, Bowslinger"),
      toGraveyard(game, "Bucky Barnes, Eager Ally"),
    ];
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Wondrous Revival"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Wondrous Revival"), { targets: heroes.map(ref) });
    for (const hero of heroes) expect(zone(game, hero)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Black Widow, Daring Operative", () => {
  it("each opponent loses life equal to the creature cards in your graveyard, not theirs", () => {
    const { game, a } = table();
    const widow = spawn(game, "Black Widow, Daring Operative");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Opt");
    toGraveyard(game, "Grizzly Bears", B);
    attack(game, a, [widow]);
    expect(life(game, B)).toBe(20 - 3 - 2);
  });
});

describe("Valentina Allegra de Fontaine", () => {
  it("makes her other Villains Heroes, which her connive ability can then target", () => {
    const { game } = table();
    const valentina = spawn(game, "Valentina Allegra de Fontaine");
    const shark = spawn(game, "Tiger Shark, Abyssal Hunter");
    const bears = spawn(game, "Grizzly Bears");
    expect(subtypes(game, shark)).toContain("Hero");
    expect(subtypes(game, valentina)).not.toContain("Hero");
    expect(() => activate(game, valentina, 0, { targets: [ref(bears)] })).toThrow();
    const before = hand(game).length;
    activate(game, valentina, 0, { targets: [ref(shark)] });
    expect(game.state.objects[valentina].tapped).toBe(true);
    // Drew a card, then discarded one.
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Bucky Barnes, Eager Ally", () => {
  it("dies: an Equipment, Hero or Soldier card from the top four into your hand", () => {
    const { game, a } = table();
    const bucky = spawn(game, "Bucky Barnes, Eager Ally");
    toLibrary(game, "Grizzly Bears");
    const hero = toLibrary(game, "Hero in Training");
    toLibrary(game, "Opt");
    const seen = pickFromZone(a, hero);
    destroy(game, bucky);
    expect(seen.offered).toEqual([hero]);
    expect(zone(game, hero)).toBe("hand");
  });
});

describe("Lady Spider, Maybelle Reilly", () => {
  it("puts a +1/+1 counter on a Spider you control for each card you discard", () => {
    const { game, a } = table();
    const spider = spawn(game, "Lady Spider, Maybelle Reilly");
    toHand(game, "Opt");
    toHand(game, "Opt");
    pickTargets(a, spider);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 }, []);
    settle(game);
    expect(counters(game, spider)).toBe(2);
  });
});

describe("Wall Off", () => {
  it("costs {1} less for each creature your opponents control", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Wall Off"));
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(1);
    expect(life(game)).toBe(24);
  });
});

describe("Moon-Boy, Dino Rider", () => {
  it("gets +1/+1 attacking only while you control a Dinosaur", () => {
    const { game, a } = table();
    const moon = spawn(game, "Moon-Boy, Dino Rider");
    attack(game, a, [moon]);
    expect(pt(game, moon)).toEqual({ power: 2, toughness: 2 });
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    spawn(game, "Colossal Dreadmaw");
    attack(game, a, [moon]);
    expect(pt(game, moon)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Hawkeye, Bowslinger", () => {
  it("grows and scries when you cast a spell that targets a creature, not a player", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const hawkeye = spawn(game, "Hawkeye, Bowslinger");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, hawkeye)).toBe(0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(counters(game, hawkeye)).toBe(1);
  });
});

describe("Infinity Formula", () => {
  it("attaches as it enters; the equipped creature gets +1/+2 and gains 2 life as it attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Infinity Formula");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    attack(game, a, [bears]);
    expect(life(game)).toBe(22);
    expect(life(game, B)).toBe(17);
  });
});

describe("Zarda, the Power Princess", () => {
  it("gives exalted to her other Heroes, not herself", () => {
    const { game, a } = table();
    spawn(game, "Zarda, the Power Princess");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    spawn(game, "Hero in Training");
    spawn(game, "Hawkeye, Bowslinger");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(graveyard(game, B)).toHaveLength(0);
  });
});
