/**
 * The set walk, batch 59, part a (2026-10-11): Marvel Super Heroes. Written
 * on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { hasSubtype } from "../subtypes.js";

describe("The Coming of Galactus", () => {
  it("II drains each opponent 2; IV makes Galactus, who destroys a land as he attacks", () => {
    const { game, a } = table();
    const saga = spawn(game, "The Coming of Galactus");
    pickTargets(a, null);
    settle(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);

    game.state.objects[saga].counters.lore = 3;
    toStep(game, "precombat-main");
    settle(game);
    const [galactus] = named(game, "Galactus", A);
    expect(galactus).toBeDefined();
    expect(pt(game, galactus)).toEqual({ power: 16, toughness: 16 });
    expect(supertypes(game, galactus)).toContain("legendary");
    expect(keywords(game, galactus).has("trample")).toBe(true);
    expect(zone(game, saga)).toBe("graveyard");

    game.state.objects[galactus].summoningSick = false;
    const [land] = lands(game, "Forest", 1, B);
    pickTargets(a, land);
    attack(game, a, [galactus]);
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Thunderbolts Conspiracy", () => {
  it("returns a dying Villain with a finality counter, a Hero too — and it's exiled the second time", () => {
    const { game } = table();
    spawn(game, "Thunderbolts Conspiracy");
    const grapplers = spawn(game, "Glamorous Grapplers");
    destroy(game, grapplers);
    const [back] = named(game, "Glamorous Grapplers", A);
    expect(back).toBeDefined();
    expect(counters(game, back, "finality")).toBe(1);
    expect(subtypes(game, back)).toEqual(expect.arrayContaining(["Villain", "Hero", "Human"]));

    destroy(game, back);
    expect(zone(game, back)).toBe("exile");
    expect(named(game, "Glamorous Grapplers")).toHaveLength(0);
  });

  it("leaves a non-Villain and an opponent's Villain where they die", () => {
    const { game } = table();
    spawn(game, "Thunderbolts Conspiracy");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Glamorous Grapplers", B);
    destroy(game, bears);
    destroy(game, theirs);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(named(game, "Glamorous Grapplers")).toHaveLength(0);
  });
});

describe("Ka-Zar of the Savage Land", () => {
  it("shows only its controller the top card, plays a land from there, and Zabu grows on landfall", () => {
    const { game } = table();
    enter(game, "Ka-Zar of the Savage Land");
    const [zabu] = named(game, "Zabu", A);
    expect(zabu).toBeDefined();
    expect(supertypes(game, zabu)).toContain("legendary");
    expect(pt(game, zabu)).toEqual({ power: 2, toughness: 2 });

    const top = toLibrary(game, "Forest");
    toStep(game, "postcombat-main");
    expect(game.viewFor(A).revealedLibraryTop[A]).toBe(top);
    expect(game.viewFor(B).revealedLibraryTop[A] ?? null).toBeNull();
    game.dispatch({ type: "play-land", player: A, card: top });
    settle(game);
    expect(zone(game, top)).toBe("battlefield");
    expect(counters(game, zabu)).toBe(1);
  });
});

describe("Madame Masque", () => {
  it("connives as she enters, and the second card drawn in a turn makes a Villain", () => {
    const { game, a } = table();
    // Alice drew her first card of the turn in her draw step; the connive's
    // draw is her second.
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    const masque = enter(game, "Madame Masque");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, masque)).toBe(1);
    expect(tokensNamed(game, "Villain Token", A)).toBe(1);
  });
});

describe("Origin of the Avengers", () => {
  it("II puts a Hero with mana value 3 or less from the hand onto the battlefield, and then draws nothing", () => {
    const { game, a } = table();
    const saga = spawn(game, "Origin of the Avengers");
    a.chooseFromZoneFn = () => [];
    settle(game);
    const widow = toHand(game, "Black Widow, Natasha Romanoff");
    toHand(game, "Hulk, Bruce Banner"); // mana value 5: not offered
    const seen = pickFromZone(a, widow);
    toStep(game, "precombat-main");
    const before = hand(game).length;
    settle(game);
    expect(seen.offered).toEqual([widow]);
    expect(zone(game, widow)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
    expect(game.state.objects[saga].counters.lore).toBe(2);
  });

  it("II draws a card when no Hero is put onto the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Origin of the Avengers");
    a.chooseFromZoneFn = () => [];
    settle(game);
    const widow = toHand(game, "Black Widow, Natasha Romanoff");
    pickFromZone(a);
    toStep(game, "precombat-main");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, widow)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("III puts a +1/+1 counter on each creature you control", () => {
    const { game } = table();
    const saga = spawn(game, "Origin of the Avengers");
    settle(game);
    game.state.objects[saga].counters.lore = 2;
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("The Masters of Evil", () => {
  it("gives other Villains you control +2/+1", () => {
    const { game } = table();
    const masters = spawn(game, "The Masters of Evil");
    const grapplers = spawn(game, "Glamorous Grapplers");
    const theirs = spawn(game, "Glamorous Grapplers", B);
    expect(pt(game, masters)).toEqual({ power: 5, toughness: 6 });
    expect(pt(game, grapplers)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });

  it("discards itself from the hand to find a Plan", () => {
    const { game, a } = table();
    const plan = toLibrary(game, "Political Triumph");
    toLibrary(game, "Grizzly Bears");
    const masters = toHand(game, "The Masters of Evil");
    lands(game, "Swamp", 2);
    const seen = pickFromZone(a, plan);
    activate(game, masters, 0);
    expect(zone(game, masters)).toBe("graveyard");
    expect(seen.offered).toEqual([plan]);
    expect(zone(game, plan)).toBe("hand");
  });
});

describe("Super Strength", () => {
  it("gives the enchanted creature +4/+4, trample and ward {1}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Super Strength");
    game.state.objects[aura].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Undercover Skrull", () => {
  it("is a 3/3 of every creature type with two or more creature cards in your graveyard", () => {
    const { game } = table();
    const skrull = spawn(game, "Undercover Skrull");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, skrull)).toEqual({ power: 1, toughness: 1 });
    expect(hasSubtype(subtypes(game, skrull), "Elf")).toBe(false);
    toGraveyard(game, "Llanowar Elves");
    expect(pt(game, skrull)).toEqual({ power: 3, toughness: 3 });
    expect(hasSubtype(subtypes(game, skrull), "Elf")).toBe(true);
  });
});

describe("Avengers: Under Siege", () => {
  it("I makes two Villains; II deals 2 to each non-Villain creature and each opponent; III a Treasure per Villain", () => {
    const { game } = table();
    const saga = spawn(game, "Avengers: Under Siege");
    settle(game);
    expect(tokensNamed(game, "Villain Token", A)).toBe(2);

    const bears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const grapplers = spawn(game, "Glamorous Grapplers", B);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(game.state.objects[grapplers].damageMarked).toBe(0);
    expect(tokensNamed(game, "Villain Token", A)).toBe(2);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);

    expect(game.state.objects[saga].counters.lore).toBe(2);
    toStep(game, "precombat-main");
    settle(game);
    // Alice's two Villain tokens; Bob's Grapplers aren't hers.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});
