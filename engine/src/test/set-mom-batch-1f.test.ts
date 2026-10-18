/**
 * March of the Machine (MOM), batch 1, group f (2026-10-17). Each test is
 * written from the card's Oracle text and rulings, on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
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
  zone,
} from "./harness.js";

describe("Conjurer's Mantle", () => {
  it("offers only cards that share a creature type with the attacker, any card type, and bottoms the rest", () => {
    const { game, a } = table();
    const elf = spawn(game, "Llanowar Elves");
    const mantle = spawn(game, "Conjurer's Mantle");
    lands(game, "Plains", 1);
    activate(game, mantle, 0, { targets: [ref(elf)] });
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, elf).has("vigilance")).toBe(true);
    const bears = toLibrary(game, "Grizzly Bears");
    const mystic = toLibrary(game, "Elvish Mystic");
    const seen = pickFromZone(a, mystic);
    attack(game, a, [elf]);
    expect(seen.offered).toEqual([mystic]);
    expect(hand(game)).toContain(mystic);
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    // The five cards not taken went to the bottom: the Bears is among them.
    expect(library.slice(-5)).toContain(bears);
    expect(game.state.objects[elf].tapped).toBe(false);
  });
});

describe("Mirror-Style Master", () => {
  it("copies each attacking modified creature you control, tapped and attacking, without its counters, exiled at end of combat", () => {
    const { game, a } = table();
    const master = spawn(game, "Mirror-Style Master");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    attack(game, a, [master, bears, giant]);
    // Master 3 + Bears 3 + Giant 3 + one 2/2 Bears copy (no counter) = 11.
    expect(life(game, B)).toBe(9);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
    expect(tokensNamed(game, "Hill Giant")).toBe(0);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
  });

  it("backup grants the attack trigger to another creature until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Mountain", 6);
    const master = toHand(game, "Mirror-Style Master");
    cast(game, master);
    expect(counters(game, bears)).toBe(1);
    // Only the Bears attacks: its granted trigger copies it (it's modified).
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 3 - 2);
  });
});

describe("Tiller of Flesh", () => {
  it("incubates 2 for a spell that targets a permanent, not one that targets only a player", () => {
    const { game } = table();
    spawn(game, "Tiller of Flesh");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(named(game, "Incubator Token", A)).toHaveLength(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    const [incubator] = named(game, "Incubator Token", A);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(2);
  });
});

describe("Terror of Towashi", () => {
  it("pays {3}{B} to return a creature card from your graveyard, which is a Phyrexian too", () => {
    const { game, a } = table();
    const terror = spawn(game, "Terror of Towashi");
    const dead = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    pickTargets(a, dead);
    attack(game, a, [terror]);
    expect(zone(game, dead)).toBe("battlefield");
    expect(subtypes(game, dead)).toEqual(expect.arrayContaining(["Giant", "Phyrexian"]));
    expect(game.state.objects[dead].controller).toBe(A);
  });

  it("returns nothing when you don't pay", () => {
    const { game, a } = table();
    const terror = spawn(game, "Terror of Towashi");
    const dead = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 4);
    pickModes(a);
    attack(game, a, [terror]);
    expect(graveyard(game)).toContain(dead);
  });
});

describe("Herbology Instructor // Malady Invoker", () => {
  it("transforming gives target creature an opponent controls -0/-X, X its power", () => {
    const { game, a } = table();
    const instructor = spawn(game, "Herbology Instructor");
    const tiller = spawn(game, "Tiller of Flesh", B);
    lands(game, "Swamp", 7);
    pickTargets(a, tiller);
    activate(game, instructor, 0);
    expect(pt(game, instructor)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, tiller)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Phyrexian Awakening", () => {
  it("incubates 4, and Phyrexians you control have vigilance", () => {
    const { game } = table();
    const ogre = spawn(game, "Terror of Towashi");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Terror of Towashi", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Phyrexian Awakening"));
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(4);
    expect(keywords(game, ogre).has("vigilance")).toBe(true);
    expect(keywords(game, giant).has("vigilance")).toBe(false);
    expect(keywords(game, theirs).has("vigilance")).toBe(false);
    lands(game, "Plains", 2);
    activate(game, incubator, 0);
    expect(keywords(game, incubator).has("vigilance")).toBe(true);
  });
});

describe("Stormclaw Rager", () => {
  it("sacrifices another creature or artifact for a counter and a card", () => {
    const { game } = table();
    const rager = spawn(game, "Stormclaw Rager");
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === rager && o.abilityIndex === 0);
    expect(offer).toBeDefined();
    const choices = offer && "sacrifice" in offer ? (offer.sacrifice?.choices ?? []) : [];
    expect([...choices].sort()).toEqual([thopter, bears].sort());
    game.dispatch({ type: "activate-ability", player: A, source: rager, abilityIndex: 0, targets: [], sacrifice: thopter });
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, rager)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Zephyr Winder", () => {
  it("untaps up to one target creature when it deals combat damage to a player", () => {
    const { game, a } = table();
    const winder = spawn(game, "Zephyr Winder");
    const tapped = spawn(game, "Hill Giant", A, { tapped: true });
    pickTargets(a, tapped);
    attack(game, a, [winder]);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[tapped].tapped).toBe(false);
  });
});
