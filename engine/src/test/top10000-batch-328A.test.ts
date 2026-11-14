/**
 * Batch 328, group A. Pins the clauses most likely to be wired wrong:
 * Vikya's excess-damage draw, Immard's reflexive modes off a removed counter,
 * Nightmares and Daydreams' delayed mill by mana value, Lo and Li's two
 * trigger events, the TMNT duos' different-player modes (Splinter & Leo,
 * Mikey & Mona), The Meep's base P/T from the sacrificed
 * creature, Nyla's linked exile and Clues, Henry Wu's exploit draw and
 * Treasure, Chong and Lily's lore count, Illusory Angel's cast restriction,
 * Bilbo's reanimation under the owner's control, Bolg's combat pump, Enkira's
 * Zombie count and Moku's paid haste.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = B): readonly ObjectId[] =>
  game.state.zones.perPlayer[player].library;

describe("Vikya, Scorching Stalwart", () => {
  it("draws only when the damage to a creature is more than lethal", () => {
    const { game } = table();
    const vikya = spawn(game, "Vikya, Scorching Stalwart", A, { tapped: true });
    lands(game, "Mountain", 10);
    const elves = spawn(game, "Llanowar Elves", B);
    const before = hand(game).length;
    activate(game, vikya, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    // Discarded one, drew one.
    expect(hand(game).length).toBe(before);

    game.state.objects[vikya].tapped = true;
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, vikya, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // Exactly lethal: no excess, no draw.
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Immard, the Stormcleaver", () => {
  it("puts a charge counter on as it enters, then removes it on attack for the reflexive 4 damage", () => {
    const { game, a } = table();
    const answers: number[][] = [[0], [1], [0]];
    a.chooseModesFn = () => answers.shift() ?? [0];
    const immard = enter(game, "Immard, the Stormcleaver");
    expect(counters(game, immard, "charge")).toBe(1);
    pickTargets(a, B);
    attack(game, a, [immard]);
    expect(counters(game, immard, "charge")).toBe(0);
    expect(life(game, B)).toBe(20 - 4 - 4);
  });

  it("removing a counter it doesn't have triggers nothing", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    pickTargets(a, B);
    const immard = spawn(game, "Immard, the Stormcleaver");
    attack(game, a, [immard]);
    expect(asked).toBe(1);
    expect(life(game, B)).toBe(20 - 4);
  });
});

describe("Nightmares and Daydreams", () => {
  it("chapter I: casting an instant or sorcery mills target player its mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Nightmares and Daydreams"));
    const before = library(game).length;
    pickTargets(a, B);
    cast(game, toHand(game, "Divination"));
    expect(library(game).length).toBe(before - 3);
  });
});

describe("Lo and Li, Royal Advisors", () => {
  it("one counter per opponent mill, one per card an opponent discards", () => {
    const { game } = table();
    const lo = spawn(game, "Lo and Li, Royal Advisors");
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(counters(game, lo)).toBe(1);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(counters(game, lo)).toBe(3);
  });
});

describe("Splinter & Leo, Father & Son", () => {
  it("one mode gives a player a Mutant, the other counters each other creature of a different player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.chooseModesFn = () => [0, 1];
    pickTargets(a, B, A);
    const splinter = enter(game, "Splinter & Leo, Father & Son");
    expect(tokensNamed(game, "Mutant Token", B)).toBe(1);
    expect(tokensNamed(game, "Mutant Token", A)).toBe(0);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, splinter)).toBe(0);
  });
});

describe("Mikey & Mona, Mutant Sitters", () => {
  it("the target player chooses which of their creatures gets two counters", () => {
    const { game, a, b } = table();
    spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    pickTargets(a, B);
    pickPermanents(b, second);
    enter(game, "Mikey & Mona, Mutant Sitters");
    expect(counters(game, second)).toBe(2);
  });
});

describe("The Meep", () => {
  it("sacrificing a creature makes your creatures' base power and toughness its mana value", () => {
    const { game, a } = table();
    const meep = spawn(game, "The Meep");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => [giant];
    attack(game, a, [meep]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Nyla, Shirshu Sleuth", () => {
  it("exiles a creature card for X life and X Clues, and returns it at an end step with no Clues", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(a, giant);
    enter(game, "Nyla, Shirshu Sleuth");
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(16);
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    for (const clue of named(game, "Clue Token", A)) destroy(game, clue);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Henry Wu, InGen Geneticist", () => {
  it("exploiting a non-Human with power 3 draws and makes a Treasure", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => [giant];
    const before = hand(game).length;
    enter(game, "Henry Wu, InGen Geneticist");
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("exploiting a Human triggers nothing", () => {
    const { game, a } = table();
    const vanguard = spawn(game, "Elite Vanguard");
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => [vanguard];
    const before = hand(game).length;
    enter(game, "Henry Wu, InGen Geneticist");
    expect(zone(game, vanguard)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Chong and Lily, Nomads", () => {
  it("pumps your creatures +1/+0 per lore counter among your Sagas", () => {
    const { game, a } = table();
    const chong = spawn(game, "Chong and Lily, Nomads");
    const saga = spawn(game, "Founding of Omashu");
    game.state.objects[saga].counters = { ...game.state.objects[saga].counters, lore: 2 };
    a.chooseModesFn = () => [1];
    attack(game, a, [chong]);
    expect(life(game, B)).toBe(20 - 5);
  });
});

describe("Illusory Angel", () => {
  it("can be cast only after another spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const angel = toHand(game, "Illusory Angel");
    expect(() => cast(game, angel)).toThrow(/refused/);
    cast(game, toHand(game, "Opt"));
    cast(game, angel);
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Bilbo, Unexpected Adventurer", () => {
  it("puts an opponent's card from their graveyard onto the battlefield under their control", () => {
    const { game, a } = table();
    const bilbo = spawn(game, "Bilbo, Unexpected Adventurer");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    attack(game, a, [bilbo]);
    expect(zone(game, card)).toBe("battlefield");
    expect(controller(game, card)).toBe(B);
    expect(graveyard(game, B)).not.toContain(card);
  });
});

describe("Bolg, Erebor's Reckoning", () => {
  it("each combat: other Goblins +2/+2, opponents' creatures -1/-1", () => {
    const { game, a } = table();
    const bolg = spawn(game, "Bolg, Erebor's Reckoning");
    const goblin = spawn(game, "Goblin Piker");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, []);
    expect(pt(game, goblin)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bolg)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Enkira, Hostile Scavenger", () => {
  it("gains indestructible only when two Zombies attack beside it", () => {
    const { game, a } = table();
    const enkira = spawn(game, "Enkira, Hostile Scavenger");
    const one = spawn(game, "Walker Token");
    attack(game, a, [enkira, one]);
    expect(keywords(game, enkira).has("indestructible")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    const two = spawn(game, "Walker Token");
    attack(game, a, [enkira, one, two]);
    expect(keywords(game, enkira).has("indestructible")).toBe(true);
  });
});

describe("Moku, Meandering Drummer", () => {
  it("paying {1} on a noncreature spell pumps Moku and gives your creatures haste", () => {
    const { game, a } = table();
    const moku = spawn(game, "Moku, Meandering Drummer");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Island", 2);
    a.chooseModesFn = () => [0];
    cast(game, toHand(game, "Opt"));
    expect(pt(game, moku)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
