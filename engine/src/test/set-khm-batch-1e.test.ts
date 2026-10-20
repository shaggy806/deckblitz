/**
 * Kaldheim (KHM), batch 1, part e (2026-10-20): foretell riders, a free cast
 * at upkeep, an MDFC god, Saga reanimation, the "you may pay" Equipment and
 * boast. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

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
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("Poison the Cup", () => {
  it("scries 2 only when it was foretold", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const scries = (): number => game.eventsOfType("scried").length;

    const bears = spawn(game, "Grizzly Bears", B);
    const fromHand = toHand(game, "Poison the Cup");
    cast(game, fromHand, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(scries()).toBe(0);

    const cup = toHand(game, "Poison the Cup");
    game.dispatch({ type: "foretell", player: A, card: cup });
    expect(zone(game, cup)).toBe("exile");
    toStep(game, "precombat-main");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, cup, { via: "foretell", targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(scries()).toBe(1);
  });
});

describe("In Search of Greatness", () => {
  it("offers only permanent spells of 1 plus the greatest mana value among your other permanents", () => {
    const { game, a } = table();
    spawn(game, "In Search of Greatness");
    const elves = toHand(game, "Llanowar Elves");
    toHand(game, "Grizzly Bears");
    toHand(game, "Centaur Courser");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, offer) => {
      offered = offer.casts.map((c) => c.card);
      const way = offer.casts.find((c) => c.card === elves);
      return way === undefined ? null : { type: "cast-spell", player: A, card: elves, targets: [], via: "effect", free: true };
    };
    toStep(game, "upkeep");
    settle(game);
    // Only lands besides itself: mana value 1 (its own 2 isn't counted).
    expect([...new Set(offered)]).toEqual([elves]);
    expect(zone(game, elves)).toBe("battlefield");
    expect(game.eventsOfType("scried")).toHaveLength(0);
  });

  it("scries 1 when no spell is cast", () => {
    const { game } = table();
    spawn(game, "In Search of Greatness");
    spawn(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(game.eventsOfType("scried")).toHaveLength(1);
  });
});

describe("Egon, God of Death", () => {
  it("exiles two cards from your graveyard at upkeep; with fewer, it's sacrificed and you draw", () => {
    const { game } = table();
    const egon = spawn(game, "Egon, God of Death");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Llanowar Elves");
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game)).toHaveLength(1);
    expect(zone(game, egon)).toBe("battlefield");

    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, egon)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Roots of Wisdom", () => {
  it("returns a milled land; with no land or Elf card there, it draws instead", () => {
    const withLands = table();
    lands(withLands.game, "Forest", 2);
    cast(withLands.game, toHand(withLands.game, "Roots of Wisdom"));
    // Three Wastes milled, one back to hand.
    expect(graveyard(withLands.game)).toHaveLength(3);

    const { game } = table({ deck: "Grizzly Bears" });
    lands(game, "Forest", 2);
    const roots = toHand(game, "Roots of Wisdom");
    const before = hand(game).length;
    cast(game, roots);
    expect(graveyard(game)).toHaveLength(4);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Kardur's Vicious Return", () => {
  it("III returns the creature card, then puts a +1/+1 counter on it, with haste", () => {
    const { game, a } = table();
    const saga = spawn(game, "Kardur's Vicious Return");
    game.state.objects[saga].counters.lore = 2;
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Warchanter Skald", () => {
  it("makes a Dwarf Berserker when it becomes tapped while equipped — not an unequipped one", () => {
    const { game, a } = table();
    const skald = spawn(game, "Warchanter Skald");
    const bare = spawn(game, "Warchanter Skald");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Plains", 1);
    activate(game, splitter, 0, { targets: [ref(skald)] });
    attack(game, a, [skald, bare]);
    expect(tokensNamed(game, "Dwarf Berserker Token", A)).toBe(1);
  });
});

describe("Valkyrie's Sword", () => {
  it("paying {4}{W} creates a 4/4 Angel Warrior wearing the Sword", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    pickModes(a, 0);
    enter(game, "Valkyrie's Sword");
    const angel = game.battlefield.find((id) => game.state.objects[id].cardName === "Angel Warrior Token (Flying, Vigilance)");
    expect(angel).toBeDefined();
    expect(pt(game, angel!)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Axgard Braggart", () => {
  it("boast untaps it and puts a +1/+1 counter on it", () => {
    const { game, a } = table();
    const braggart = spawn(game, "Axgard Braggart");
    lands(game, "Plains", 2);
    attack(game, a, [braggart]);
    expect(game.state.objects[braggart].tapped).toBe(true);
    activate(game, braggart, 0);
    expect(game.state.objects[braggart].tapped).toBe(false);
    expect(counters(game, braggart)).toBe(1);
  });
});

describe("Spirit of the Aldergard", () => {
  it("gets +1/+0 for each other snow permanent you control", () => {
    const { game } = table();
    const spirit = spawn(game, "Spirit of the Aldergard");
    lands(game, "Snow-Covered Forest", 2);
    lands(game, "Forest", 1);
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Skemfar Avenger / Tergrid's Shadow", () => {
  it("draws and loses 1 for another nontoken Elf dying, not for a non-Elf", () => {
    const { game, a } = table();
    spawn(game, "Skemfar Avenger");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    a.chooseSacrificesFn = () => [elves, bears];
    const shadow = toHand(game, "Tergrid's Shadow");
    const before = hand(game).length;
    cast(game, shadow);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
    expect(life(game)).toBe(19);
  });
});
