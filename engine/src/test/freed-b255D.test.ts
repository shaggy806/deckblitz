/**
 * Batch 255, group D: cards freed by the switch-pt, piles, hand-exile,
 * chosen-player and per-player-count families. One test per clause most likely
 * to be wrong.
 */

import { describe, expect, it } from "vitest";
import { goadersOf } from "../goad.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
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
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
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
} from "./harness.js";

describe("Palantír of Orthanc", () => {
  it("counter, scry, then the opponent lets you draw: no mill, no life lost", () => {
    const { game, a, b } = table();
    spawn(game, "Palantír of Orthanc");
    pickTargets(a, B);
    pickModes(b, 0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    const palantir = named(game, "Palantír of Orthanc")[0];
    expect(counters(game, palantir, "influence")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(20);
  });

  it("if they don't, you mill X, where X counts the new counter, and they lose the total mana value", () => {
    const { game, a, b } = table();
    const palantir = spawn(game, "Palantír of Orthanc");
    game.state.objects[palantir].counters.influence = 1;
    const second = toLibrary(game, "Hill Giant");
    const first = toLibrary(game, "Grizzly Bears");
    pickTargets(a, B);
    pickModes(b, 1);
    toStep(game, "end");
    settle(game);
    expect(counters(game, palantir, "influence")).toBe(2);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 2 - 4);
    expect(life(game, A)).toBe(20);
  });
});

describe("Red Death, Shipwrecker", () => {
  it("uses the stack; goads, its controller draws, and you add {R}", () => {
    const { game } = table();
    const redDeath = spawn(game, "Red Death, Shipwrecker");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    activate(game, redDeath, 0, { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(game.state.players[A].manaPool.length).toBe(0);
    settle(game);
    expect(goadersOf(game.state, registryOf(game), bears)).toEqual([A]);
    expect(hand(game, B).length).toBe(before + 1);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R"]);
  });
});

describe("the per-player counts", () => {
  it("Acidic Soil deals each player damage equal to their own lands", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 1, B);
    cast(game, toHand(game, "Acidic Soil"));
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(19);
  });

  it("Stronghold Discipline: each player loses life for their own creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Stronghold Discipline"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
  });
});

describe("Pandemonium", () => {
  it("the entering creature's controller chooses the target and whether it deals the damage", () => {
    const { game, a, b } = table();
    spawn(game, "Pandemonium");
    const aliceAsked = watchTargets(a);
    pickTargets(b, A);
    pickModes(b, 0);
    enter(game, "Hill Giant", B);
    expect(aliceAsked.asked).toBe(0);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("they may decline", () => {
    const { game, b } = table();
    spawn(game, "Pandemonium");
    pickTargets(b, A);
    pickModes(b);
    enter(game, "Hill Giant", B);
    expect(life(game, A)).toBe(20);
  });

  it("the creature's power as it last existed, if it has left", () => {
    const { game, b } = table();
    spawn(game, "Pandemonium");
    pickTargets(b, A);
    pickModes(b, 0);
    const giant = enter(game, "Hill Giant", B, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    destroy(game, giant, A);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
  });
});

describe("Invert // Invent", () => {
  it("Invert switches each of two creatures' own power and toughness", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const lions = spawn(game, "Savannah Lions");
    const theirs = spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Invert // Invent"), { face: 1, targets: [ref(lions), ref(theirs)] });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
  });

  it("Invert kills a 0/4: its toughness is 0", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const wall = spawn(game, "Wall of Omens", B);
    cast(game, toHand(game, "Invert // Invent"), { face: 1, targets: [ref(wall), null] });
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("Invert with one target, or none", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const lions = spawn(game, "Savannah Lions");
    cast(game, toHand(game, "Invert // Invent"), { face: 1, targets: [ref(lions), null] });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 2 });
    cast(game, toHand(game, "Invert // Invent"), { face: 1, targets: [null, null] });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 2 });
  });

  it("Invent finds an instant and a sorcery, not two of one", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const shock = toLibrary(game, "Shock");
    const bolt = toLibrary(game, "Lightning Bolt");
    const divination = toLibrary(game, "Divination");
    const offered: ObjectId[][] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push([...eligible]);
      return [shock, divination];
    };
    cast(game, toHand(game, "Invert // Invent"), { face: 2 });
    expect(offered[0]).toEqual(expect.arrayContaining([shock, bolt, divination]));
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, divination)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
  });
});

describe("the hand exiles", () => {
  it("Aggressive Negotiations exiles a nonland card and puts the counter on your creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears");
    const shock = toHand(game, "Shock", B);
    const island = toHand(game, "Island", B);
    const seen = pickFromZone(a, shock);
    cast(game, toHand(game, "Aggressive Negotiations"), { targets: [ref(B), ref(mine)] });
    expect(seen.offered).toContain(shock);
    expect(seen.offered).not.toContain(island);
    expect(zone(game, shock)).toBe("exile");
    expect(counters(game, mine)).toBe(1);
  });

  it("Aggressive Negotiations with no creature still exiles", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const shock = toHand(game, "Shock", B);
    pickFromZone(a, shock);
    cast(game, toHand(game, "Aggressive Negotiations"), { targets: [ref(B), null] });
    expect(zone(game, shock)).toBe("exile");
  });

  it("Transgress the Mind takes only mana value 3 or greater, and has no color", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const giant = toHand(game, "Hill Giant", B);
    const shock = toHand(game, "Shock", B);
    const seen = pickFromZone(a, giant);
    const spell = toHand(game, "Transgress the Mind");
    expect(registryOf(game).get("Transgress the Mind").colors).toEqual([]);
    cast(game, spell, { targets: [ref(B)] });
    expect(seen.offered).toContain(giant);
    expect(seen.offered).not.toContain(shock);
    expect(zone(game, giant)).toBe("exile");
  });

  it("Kyoki: a Spirit spell makes the target opponent exile a card of their choice", () => {
    const { game, a, b } = table();
    spawn(game, "Kyoki, Sanity's Eclipse");
    lands(game, "Plains", 2);
    pickTargets(a, B);
    const keep = toHand(game, "Shock", B);
    const lose = toHand(game, "Hill Giant", B);
    pickFromZone(b, lose);
    cast(game, toHand(game, "Kami of Ancient Law"));
    expect(zone(game, lose)).toBe("exile");
    expect(zone(game, keep)).toBe("hand");
  });
});

describe("Doomfall", () => {
  it("first mode: the opponent exiles a creature they control", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Doomfall"), { modes: [0], targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("second mode: you exile a nonland card; only lands in hand and nothing happens", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock", B);
    pickFromZone(a, shock);
    cast(game, toHand(game, "Doomfall"), { modes: [1], targets: [ref(B)] });
    expect(zone(game, shock)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wei Assassins", () => {
  it("the target opponent's creature is destroyed, theirs to choose", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    enter(game, "Wei Assassins");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Severance Priest", () => {
  it("the exiled card's owner gets an X/X Spirit as it leaves", () => {
    const { game, a } = table();
    const giant = toHand(game, "Hill Giant", B);
    pickTargets(a, B);
    pickFromZone(a, giant);
    const priest = enter(game, "Severance Priest");
    expect(zone(game, giant)).toBe("exile");
    destroy(game, priest);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token (Abzan Monument)", B)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Abzan Monument)", A)).toBe(0);
    expect(pt(game, named(game, "Spirit Token (Abzan Monument)", B)[0])).toEqual({ power: 4, toughness: 4 });
  });

  it("you may choose nothing, and then nobody gets a token", () => {
    const { game, a } = table();
    const giant = toHand(game, "Hill Giant", B);
    pickTargets(a, B);
    pickFromZone(a);
    const priest = enter(game, "Severance Priest");
    expect(zone(game, giant)).toBe("hand");
    destroy(game, priest);
    settle(game);
    expect(tokensNamed(game, "Spirit Token (Abzan Monument)")).toBe(0);
  });
});

describe("Parallax Nexus", () => {
  it("fades as it's used, the opponent chooses, and the card comes back as it leaves", () => {
    const { game, b } = table();
    const nexus = enter(game, "Parallax Nexus");
    expect(counters(game, nexus, "fade")).toBe(5);
    toHand(game, "Shock", B);
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(b, giant);
    activate(game, nexus, 0, { targets: [ref(B)] });
    expect(counters(game, nexus, "fade")).toBe(4);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, nexus);
    settle(game);
    expect(hand(game, B)).toContain(giant);
  });

  it("activates only as a sorcery", () => {
    const { game } = table({ step: "upkeep" });
    const nexus = enter(game, "Parallax Nexus");
    expect(() => activate(game, nexus, 0, { targets: [ref(B)] })).toThrow();
  });

  it("is sacrificed at the upkeep it can't remove a counter", () => {
    const { game } = table();
    const nexus = enter(game, "Parallax Nexus");
    game.state.objects[nexus].counters.fade = 1;
    nextTurn(game);
    nextTurn(game, "draw");
    settle(game);
    expect(counters(game, nexus, "fade")).toBe(0);
    nextTurn(game);
    nextTurn(game, "draw");
    settle(game);
    expect(zone(game, nexus)).toBe("graveyard");
  });
});

describe("Reap Intellect", () => {
  it("exiles up to X nonland cards and you search all three zones for their namesakes", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const fromHand = toHand(game, "Hill Giant", B);
    const twin = toHand(game, "Hill Giant", B);
    const inGraveyard = toGraveyard(game, "Hill Giant", B);
    const inLibrary = toLibrary(game, "Hill Giant", B);
    const shock = toHand(game, "Shock", B);
    const island = toHand(game, "Island", B);
    const offered: ObjectId[][] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push([...eligible]);
      return offered.length === 1 ? [fromHand] : eligible.filter((id) => id !== twin);
    };
    cast(game, toHand(game, "Reap Intellect"), { targets: [ref(B)], x: 1 });
    expect(offered[0]).toContain(shock);
    expect(offered[0]).not.toContain(island);
    expect(offered[1]).toEqual(expect.arrayContaining([twin, inGraveyard, inLibrary]));
    expect(offered[1]).not.toContain(shock);
    expect(zone(game, fromHand)).toBe("exile");
    expect(zone(game, inGraveyard)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("exile");
    // You may leave one where it is (the ruling).
    expect(zone(game, twin)).toBe("hand");
    expect(zone(game, shock)).toBe("hand");
  });

  it("with X = 0 nothing is exiled and nothing is searched", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const giant = toHand(game, "Hill Giant", B);
    const inLibrary = toLibrary(game, "Hill Giant", B);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    cast(game, toHand(game, "Reap Intellect"), { targets: [ref(B)], x: 0 });
    expect(asked).toBe(0);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, inLibrary)).toBe("library");
  });
});

describe("Treacherous Urge", () => {
  it("puts their creature under your control with haste, and sacrifices it at the end step", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const giant = toHand(game, "Hill Giant", B);
    const shock = toHand(game, "Shock", B);
    const seen = pickFromZone(a, giant);
    cast(game, toHand(game, "Treacherous Urge"), { targets: [ref(B)] });
    expect(seen.offered).toContain(giant);
    expect(seen.offered).not.toContain(shock);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(graveyard(game, B)).toContain(giant);
  });

  it("you may put nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a);
    cast(game, toHand(game, "Treacherous Urge"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("hand");
  });

  it("cast in the end step, it stays until the next one (the ruling)", () => {
    const { game, a } = table({ step: "end" });
    lands(game, "Swamp", 5);
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, toHand(game, "Treacherous Urge"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
    nextTurn(game);
    expect(graveyard(game, B)).toContain(giant);
  });
});

describe("Truth or Tale", () => {
  const library = (game: ReturnType<typeof table>["game"]): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
  const topFive = (game: ReturnType<typeof table>["game"]): ObjectId[] =>
    ["Llanowar Elves", "Counterspell", "Island", "Shock", "Grizzly Bears"].map((name) => toLibrary(game, name)).reverse();
  /** The bottom `n` cards, whichever end of the list the bottom is. */
  const bottom = (game: ReturnType<typeof table>["game"], topIsFront: boolean, n: number): readonly ObjectId[] =>
    topIsFront ? library(game).slice(-n) : library(game).slice(0, n);

  it("takes one card of the chosen pile; every other revealed card goes to the bottom", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    const cards = topFive(game);
    const topIsFront = library(game).indexOf(cards[0]) < library(game).indexOf(cards[4]);
    a.separatePilesFn = () => [cards.slice(0, 2), cards.slice(2)];
    b.choosePileFn = () => 0;
    // The pile's card, then one ordering of all that's left, both piles mixed.
    const order = [cards[3], cards[0], cards[4], cards[2]];
    const seen: { offered: readonly ObjectId[] }[] = [];
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      if (max === 1) seen.push({ offered: [...eligible] });
      return max === 1 ? [cards[1]] : max === 0 ? [] : order;
    };
    const before = hand(game).length;
    const libraryBefore = library(game).length;
    cast(game, toHand(game, "Truth or Tale"));
    expect(seen[0].offered).toEqual(expect.arrayContaining(cards.slice(0, 2)));
    expect(seen[0].offered.length).toBe(2);
    expect(zone(game, cards[1])).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    const down = [...bottom(game, topIsFront, 4)];
    expect(down.sort()).toEqual([...order].sort());
    const asOrdered = [...bottom(game, topIsFront, 4)];
    expect([order.join(), [...order].reverse().join()]).toContain(asOrdered.join());
    expect(library(game).length).toBe(libraryBefore - 1);
  });

  it("with several opponents you pick which one knowing the cards (the ruling's order)", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Island", 2);
    const cards = topFive(game);
    let knownWhenAsked = false;
    a.chooseModesFn = () => {
      knownWhenAsked = cards.every((id) => game.state.revealedThisTurn.includes(id));
      return [1];
    };
    a.separatePilesFn = () => [[cards[0]], cards.slice(1)];
    let bobAsked = false;
    b.choosePileFn = () => {
      bobAsked = true;
      return 1;
    };
    c.choosePileFn = () => 0;
    cast(game, toHand(game, "Truth or Tale"));
    expect(knownWhenAsked).toBe(true);
    expect(bobAsked).toBe(false);
    expect(zone(game, cards[0])).toBe("hand");
  });

  it("an empty chosen pile: no card, and all five go to the bottom", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    const cards = topFive(game);
    const topIsFront = library(game).indexOf(cards[0]) < library(game).indexOf(cards[4]);
    a.separatePilesFn = () => [[], cards];
    b.choosePileFn = () => 0;
    const before = hand(game).length;
    cast(game, toHand(game, "Truth or Tale"));
    expect(hand(game).length).toBe(before);
    expect([...bottom(game, topIsFront, 5)].sort()).toEqual([...cards].sort());
  });

  it("a one-card chosen pile asks nothing, and the other four go down", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    const cards = topFive(game);
    const topIsFront = library(game).indexOf(cards[0]) < library(game).indexOf(cards[4]);
    a.separatePilesFn = () => [[cards[2]], [...cards.slice(0, 2), ...cards.slice(3)]];
    b.choosePileFn = () => 0;
    cast(game, toHand(game, "Truth or Tale"));
    expect(zone(game, cards[2])).toBe("hand");
    expect([...bottom(game, topIsFront, 4)].sort()).toEqual([...cards.slice(0, 2), ...cards.slice(3)].sort());
  });
});
