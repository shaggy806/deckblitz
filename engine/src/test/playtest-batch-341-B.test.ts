/**
 * Playtest cards, batch 341 group B: one focused test per card whose behaviour
 * is more than a stat line or a copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";

import type { Table } from "./harness.js";
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
  nextTurn,
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Choose the offered mode whose text starts with `start` (unchoosable modes aren't offered). */
function pickMode(seat: Table["a"], start: string): void {
  seat.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.startsWith(start))];
}

describe("Seer of the Bright Side", () => {
  it("is caged until the last cage counter comes off, which destroys a creature", () => {
    const { game, a } = table();
    const seer = enter(game, "Seer of the Bright Side");
    expect(counters(game, seer, "cage")).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, seer, "cage")).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, seer, "cage")).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Hish of the Snake Cult", () => {
  it("makes Serpents Snakes, and Snakes get deathtouch and poisonous 2", () => {
    const { game, a } = table();
    const hish = spawn(game, "Hish of the Snake Cult");
    const serpent = spawn(game, "Sea Serpent");
    expect(subtypes(game, serpent)).toContain("Snake");
    expect(keywords(game, serpent).has("deathtouch")).toBe(true);
    attack(game, a, [hish]);
    expect(game.state.players[B].counters.poison).toBe(2);
  });
});

describe("Rat of God", () => {
  it("destroys non-Rats, then each player amasses Rats equal to the Rats they control", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    const rat = spawn(game, "Rat Token");
    const bobBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rat of God"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bobBears)).toBe("graveyard");
    expect(zone(game, rat)).toBe("battlefield");
    const armies = named(game, "Army Token", A);
    expect(armies.length).toBe(1);
    expect(counters(game, armies[0])).toBe(1);
    expect(subtypes(game, armies[0])).toContain("Rat");
    // Bob controlled no Rats: his 0/0 Army is gone.
    expect(named(game, "Army Token", B).length).toBe(0);
  });
});

describe("Another Night in Vegas", () => {
  it("Life of the Party: you gain 2 life whenever a spell is cast this turn", () => {
    const { game, a } = table();
    spawn(game, "Another Night in Vegas");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    pickMode(a, "Life of the Party");
    toStep(game, "upkeep");
    settle(game);
    const before = life(game, A);
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, A)).toBe(before + 2);
  });

  it("Breakfast at Dawn: two Foods, and the enchantment is sacrificed", () => {
    const { game, a } = table();
    const vegas = spawn(game, "Another Night in Vegas");
    pickMode(a, "Breakfast at Dawn");
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    expect(zone(game, vegas)).toBe("graveyard");
  });
});

describe("Windmill Slam", () => {
  it("creates a 4/4 Windmill that deals 4 damage to any target", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    pickTargets(a, B);
    cast(game, toHand(game, "Windmill Slam"));
    expect(tokensNamed(game, "Windmill Token", A)).toBe(1);
    expect(life(game, B)).toBe(16);
  });
});

describe("Welcome to Mini-apolis", () => {
  it("copies an opponent's creature spell as a 1/1 token under your control", () => {
    const { game } = table();
    spawn(game, "Welcome to Mini-apolis");
    lands(game, "Forest", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    const mine = named(game, "Grizzly Bears", A);
    expect(mine.length).toBe(1);
    expect(pt(game, mine[0])).toEqual({ power: 1, toughness: 1 });
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("The Roaring Toeclaws", () => {
  it("puts counters equal to its power on itself as it untaps, not on a small creature", () => {
    const { game } = table();
    const toeclaws = spawn(game, "The Roaring Toeclaws", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, toeclaws)).toBe(5);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Frenemy of the Guildpact", () => {
  it("has protection from a two-color enemy pair, not from a mono-colored spell", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Plains", 2);
    const frenemy = spawn(game, "Frenemy of the Guildpact", B);
    expect(() => cast(game, toHand(game, "Anguished Unmaking"), { targets: [ref(frenemy)] })).toThrow();
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(frenemy)] });
    expect(zone(game, frenemy)).toBe("graveyard");
  });
});

describe("Avacyn's Collar, the Symbol of Her Church", () => {
  it("shackles onto a creature you don't control, which then can't use its abilities", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const collar = spawn(game, "Avacyn's Collar, the Symbol of Her Church");
    const pyro = spawn(game, "Prodigal Pyromancer", B);
    activate(game, collar, 0, { targets: [ref(pyro)] });
    expect(game.state.objects[collar].attachedTo).toBe(pyro);
    expect(game.state.objects[collar].controller).toBe(A);
    expect(game.canDispatch({ type: "activate-ability", player: B, source: pyro, abilityIndex: 0, targets: [ref(A)] })).not.toBeNull();
  });
});

describe("Karlov's Crossbow", () => {
  it("forecast makes later Crossbows cost {1} less", () => {
    const { game } = table();
    const crossbow = toHand(game, "Karlov's Crossbow");
    toStep(game, "upkeep");
    activate(game, crossbow, 1);
    expect(zone(game, crossbow)).toBe("hand");
    toStep(game, "precombat-main");
    lands(game, "Wastes", 4);
    cast(game, crossbow);
    expect(zone(game, crossbow)).toBe("battlefield");
  });
});

describe("The Forgotten Place", () => {
  it("draws a card for each Locus and/or Sphere in your graveyard, itself included", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const place = spawn(game, "The Forgotten Place");
    game.state.objects[place].tapped = false;
    toGraveyard(game, "Cloudpost");
    const before = hand(game).length;
    activate(game, place, 1);
    expect(hand(game).length).toBe(before + 2);
    expect(graveyard(game)).toContain(place);
  });
});

describe("Myojin of Night's Reach and Grim Betrayal", () => {
  it("empties opponents' hands, then takes every creature card put into a graveyard this turn", () => {
    const { game } = table();
    const myojin = spawn(game, "Myojin of Night's Reach and Grim Betrayal");
    game.state.objects[myojin].counters.indestructible = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    const inHand = toHand(game, "Hill Giant", B);
    activate(game, myojin, 0);
    expect(hand(game, B).length).toBe(0);
    const taken = named(game, "Grizzly Bears", A);
    expect(taken.length).toBe(1);
    expect(named(game, "Hill Giant", A).length).toBe(1);
    expect(zone(game, inHand)).not.toBe("hand");
  });
});

describe("Phyrexian Chimney Imp", () => {
  it("makes the target opponent put two cards from hand on top of their library", () => {
    const { game, b } = table();
    const imp = spawn(game, "Phyrexian Chimney Imp");
    const before = hand(game, B).length;
    const [x, y] = hand(game, B);
    pickFromZone(b, x, y);
    destroy(game, imp);
    settle(game);
    expect(hand(game, B).length).toBe(before - 2);
    expect(zone(game, x)).toBe("library");
  });
});

describe("The Juzam Master", () => {
  it("gives creatures +1/+0 and an upkeep ping each", () => {
    const { game } = table();
    spawn(game, "The Juzam Master");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    const before = life(game, A);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(before - 2);
  });
});

describe("Riku and Riku", () => {
  it("copies an instant or sorcery once", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const riku = spawn(game, "Riku and Riku");
    const div = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, div, { settle: false });
    activate(game, riku, 0, { targets: [ref(div)] });
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(() => activate(game, riku, 0, { targets: [ref(div)] })).toThrow();
  });
});

describe("The Powerful Dragon", () => {
  it("exiles the top card to play when a +1/+1 counter goes on a creature you control", () => {
    const { game, a } = table();
    const dragon = spawn(game, "The Powerful Dragon");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [dragon, bears]);
    expect(counters(game, bears)).toBe(1);
    expect(Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === A).length).toBe(1);
  });
});
