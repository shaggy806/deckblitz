/**
 * Commander Legends: Battle for Baldur's Gate, group e. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { goadersOf } from "../goad.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
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
  watchTargets,
  zone,
} from "./harness.js";

const goadedBy = (game: Game, id: ObjectId): readonly PlayerId[] => goadersOf(game.state, game.registry, id);
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const addCounter = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
  settle(game);
};

describe("Oji, the Exquisite Blade", () => {
  it("gains 2 life and scries 2 as it enters", () => {
    const { game } = table();
    enter(game, "Oji, the Exquisite Blade");
    expect(life(game)).toBe(22);
  });

  it("blinks a creature you control on your second spell of the turn, not the first", () => {
    const { game, a } = table();
    spawn(game, "Oji, the Exquisite Blade");
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    pickTargets(a, bears);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, bears)).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    // A new object back from exile: its counter is gone (the ruling).
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("offers only creatures you control, and may target none", () => {
    const { game, a } = table();
    spawn(game, "Oji, the Exquisite Blade");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounter(game, bears);
    cast(game, toHand(game, "Ornithopter"));
    const seen = watchTargets(a);
    cast(game, toHand(game, "Ornithopter"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Popular Entertainer", () => {
  it("gives a commander creature you own the goad trigger, which any creature of yours hitting a player sets off", () => {
    const { game, a } = table();
    spawn(game, "Popular Entertainer");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const raider = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [raider]);
    expect(life(game, B)).toBe(17);
    expect(goadedBy(game, theirs)).toContain(A);
  });

  it("does nothing without a commander creature", () => {
    const { game, a } = table();
    spawn(game, "Popular Entertainer");
    const raider = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [raider]);
    expect(life(game, B)).toBe(17);
    expect(goadedBy(game, theirs)).toEqual([]);
  });
});

describe("Taunting Kobold", () => {
  it("goads a creature an opponent controls as it attacks", () => {
    const { game, a } = table();
    const kobold = spawn(game, "Taunting Kobold", A, { sick: true });
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [theirs]);
    attack(game, a, [kobold]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([theirs, other]));
    expect(seen.offered[0]).not.toContain(mine);
    expect(goadedBy(game, theirs)).toContain(A);
    expect(goadedBy(game, other)).toEqual([]);
  });
});

describe("Scouting Hawk", () => {
  it("fetches a basic Plains tapped when an opponent has more lands", () => {
    const { game, a } = table();
    lands(game, "Plains", 2, B);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    enter(game, "Scouting Hawk");
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
  });

  it("does nothing when no opponent has more lands", () => {
    const { game, a } = table();
    lands(game, "Plains", 2, B);
    lands(game, "Plains", 2);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    enter(game, "Scouting Hawk");
    expect(zone(game, plains)).toBe("library");
  });
});

describe("Atrocious Experiment", () => {
  it("makes the target player mill two, draw two and lose 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const handBefore = hand(game, B).length;
    const libraryBefore = library(game, B).length;
    cast(game, toHand(game, "Atrocious Experiment"), { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(2);
    expect(hand(game, B).length).toBe(handBefore + 2);
    expect(library(game, B).length).toBe(libraryBefore - 4);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(20);
  });
});

describe("Owlbear Shepherd", () => {
  it("draws at your end step with total power 8 or greater", () => {
    const { game } = table();
    spawn(game, "Owlbear Shepherd");
    spawn(game, "Craw Wurm");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't with total power 7", () => {
    const { game } = table();
    spawn(game, "Owlbear Shepherd");
    spawn(game, "Craw Wurm");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Clockwork Fox", () => {
  it("leaving the battlefield draws you two and each opponent one", () => {
    const { game } = table({ players: 3 });
    const fox = spawn(game, "Clockwork Fox");
    const mine = hand(game).length;
    const bob = hand(game, B).length;
    const carol = hand(game, C).length;
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(fox)]);
    settle(game);
    expect(hand(game).length).toBe(mine + 3); // the Fox itself, and two cards
    expect(hand(game, B).length).toBe(bob + 1);
    expect(hand(game, C).length).toBe(carol + 1);
  });
});

describe("Crystal Dragon // Rob the Hoard", () => {
  it("Rob the Hoard returns a legendary card, then the Dragon is cast from exile", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const legend = toGraveyard(game, "Isamaru, Hound of Konda");
    const card = toHand(game, "Crystal Dragon");
    cast(game, card, { face: 1, targets: [ref(legend)] });
    expect(zone(game, legend)).toBe("hand");
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("vigilance")).toBe(true);
  });

  it("takes an artifact or enchantment card, but not a nonlegendary creature card", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Crystal Dragon");
    expect(() => cast(game, card, { face: 1, targets: [ref(bears)] })).toThrow();
    cast(game, card, { face: 1, targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Blessed Hippogriff // Tyr's Blessing", () => {
  it("gives an attacking creature without flying flying", () => {
    const { game, a } = table();
    const hippogriff = spawn(game, "Blessed Hippogriff");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const flier = spawn(game, "Suntail Hawk");
    const home = spawn(game, "Craw Wurm");
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [hippogriff, bears, giant, flier]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered[0]).not.toContain(flier);
    expect(seen.offered[0]).not.toContain(hippogriff);
    expect(seen.offered[0]).not.toContain(home);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, giant).has("flying")).toBe(false);
  });

  it("Tyr's Blessing makes a creature indestructible, and the card goes on an adventure", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Blessed Hippogriff");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Myconid Spore Tender", () => {
  it("destroys up to one target artifact or enchantment", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    enter(game, "Myconid Spore Tender");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Javelin of Lightning", () => {
  it("attaches as it enters; +2/+0 and first strike only during your turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const javelin = enter(game, "Javelin of Lightning");
    expect(game.state.objects[javelin].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("can be cast with no creature and stays unattached", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const javelin = toHand(game, "Javelin of Lightning");
    cast(game, javelin);
    expect(zone(game, javelin)).toBe("battlefield");
    expect(game.state.objects[javelin].attachedTo ?? null).toBeNull();
  });
});

describe("Sharpshooter Elf", () => {
  it("has power equal to your creatures and shoots an opponent's flier for that much", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const hawk = spawn(game, "Suntail Hawk", B);
    const ground = spawn(game, "Craw Wurm", B);
    const myFlier = spawn(game, "Suntail Hawk");
    const seen = watchTargets(a, () => [angel]);
    const elf = enter(game, "Sharpshooter Elf");
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 2 });
    expect(seen.offered[0]).toEqual(expect.arrayContaining([angel, hawk]));
    expect(seen.offered[0]).not.toContain(ground);
    expect(seen.offered[0]).not.toContain(myFlier);
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Ghastly Death Tyrant", () => {
  it("Disintegration Ray destroys an opponent's enchantment and costs its mana value in life", () => {
    const { game, a } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [anthem]);
    enter(game, "Ghastly Death Tyrant");
    expect(zone(game, anthem)).toBe("graveyard");
    expect(life(game)).toBe(17);
    // Only an opponent's enchantment: alice's own isn't offered.
    expect(seen.asked).toBe(0);
  });

  it("Death Ray gives your creatures deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Glorious Anthem", B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    const tyrant = enter(game, "Ghastly Death Tyrant");
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, tyrant).has("deathtouch")).toBe(true);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });
});

describe("Myrkul's Invoker", () => {
  it("{8}: creatures you control get +2/+0 and menace", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const invoker = spawn(game, "Myrkul's Invoker");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, invoker);
    expect(pt(game, invoker)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
