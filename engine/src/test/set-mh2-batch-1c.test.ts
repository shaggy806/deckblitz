/**
 * Modern Horizons 2 and Commander 2021, group c: Master of Death, Squirrel Sanctuary, Arcbound
 * Tracker, Sly Instigator, Excavation Technique, Chrome Courier, Flametongue Yearling, Bloodbraid
 * Marauder, Territorial Kavu, Disciple of the Sun, Radiant Epicure and Mount Velus Manticore.
 */
import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import type { GameState } from "../state.js";

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
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  registryOf,
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

describe("Master of Death", () => {
  it("in your graveyard at your upkeep, pays 1 life to return to your hand", () => {
    const { game, a } = table();
    const master = toGraveyard(game, "Master of Death");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, master)).toBe("hand");
    expect(life(game, A)).toBe(19);
  });

  it("declined, it stays in the graveyard and no life is paid", () => {
    const { game, a } = table();
    const master = toGraveyard(game, "Master of Death");
    pickModes(a);
    toStep(game, "precombat-main");
    expect(zone(game, master)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});

describe("Squirrel Sanctuary", () => {
  it("makes a Squirrel; a nontoken creature dying lets you pay {1} to return it, a token dying doesn't", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const sanctuary = enter(game, "Squirrel Sanctuary");
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(1);
    pickModes(a, 0);
    const squirrel = game.battlefield.find((id) => game.state.objects[id].cardName === "Squirrel Token")!;
    destroy(game, squirrel);
    expect(zone(game, sanctuary)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, sanctuary)).toBe("hand");
  });
});

describe("Arcbound Tracker", () => {
  it("enters with two counters and grows on each spell after your first this turn", () => {
    const { game } = table();
    const tracker = enter(game, "Arcbound Tracker");
    expect(counters(game, tracker)).toBe(2);
    cast(game, toHand(game, "Memnite"));
    expect(counters(game, tracker)).toBe(2);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, tracker)).toBe(3);
    cast(game, toHand(game, "Memnite"));
    expect(counters(game, tracker)).toBe(4);
  });
});

describe("Sly Instigator", () => {
  it("makes an opponent's creature unblockable and goaded until your next turn", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const instigator = spawn(game, "Sly Instigator");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, instigator, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(goadersOf(game.state, registryOf(game), bears)).toEqual([A]);
    nextTurn(game);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    expect(goadersOf(game.state, registryOf(game), bears)).toEqual([]);
  });
});

describe("Excavation Technique", () => {
  it("destroys a nonland permanent and its controller makes two Treasures", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a); // no demonstrate copy
    cast(game, toHand(game, "Excavation Technique"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", B)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Chrome Courier", () => {
  it("one of the top two to hand, the other to the graveyard; 3 life only for an artifact kept", () => {
    for (const keepRing of [true, false]) {
      const { game, a } = table();
      const ring = toLibrary(game, "Sol Ring");
      const bears = toLibrary(game, "Grizzly Bears");
      const seen = pickFromZone(a, keepRing ? ring : bears);
      enter(game, "Chrome Courier");
      expect([...seen.offered].sort()).toEqual([ring, bears].sort());
      expect(zone(game, keepRing ? ring : bears)).toBe("hand");
      expect(zone(game, keepRing ? bears : ring)).toBe("graveyard");
      expect(life(game, A)).toBe(keepRing ? 23 : 20);
    }
  });
});

describe("Flametongue Yearling", () => {
  it("multikicked once, enters with a counter and deals damage equal to its power", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const yearling = toHand(game, "Flametongue Yearling");
    cast(game, yearling, { kicked: true, kickCount: 1 });
    expect(counters(game, yearling)).toBe(1);
    expect(pt(game, yearling)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Bloodbraid Marauder", () => {
  const castMarauder = (delirium: boolean): { awaiting: string | undefined; bolt: string } => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Murder");
    if (delirium) toGraveyard(game, "Sol Ring");
    cast(game, toHand(game, "Bloodbraid Marauder"), { settle: false });
    game.advanceUntil((s: GameState) => s.awaiting?.kind === "cast-now" || quiet(s));
    return { awaiting: game.state.awaiting?.kind, bolt: zone(game, bolt) };
  };

  it("has cascade with delirium", () => {
    expect(castMarauder(true)).toEqual({ awaiting: "cast-now", bolt: "exile" });
  });

  it("has no cascade with three card types in the graveyard", () => {
    expect(castMarauder(false)).toEqual({ awaiting: undefined, bolt: "library" });
  });
});

describe("Territorial Kavu", () => {
  it("is as big as your basic land types, and can exile a graveyard card as it attacks", () => {
    const { game, a } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    spawn(game, "Forest");
    spawn(game, "Forest");
    const kavu = spawn(game, "Territorial Kavu");
    expect(pt(game, kavu)).toEqual({ power: 3, toughness: 3 });
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickTargets(a, card);
    attack(game, a, [kavu]);
    expect(zone(game, card)).toBe("exile");
    expect(life(game, B)).toBe(17);
  });

  it("the other mode discards a card, then draws one", () => {
    const { game, a } = table();
    spawn(game, "Mountain");
    const kavu = spawn(game, "Territorial Kavu");
    const before = hand(game).length;
    const gyBefore = graveyard(game).length;
    pickModes(a, 0);
    attack(game, a, [kavu]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(gyBefore + 1);
  });
});

describe("Disciple of the Sun", () => {
  it("returns a permanent card with mana value 3 or less — a land counts, an instant doesn't", () => {
    const { game, a } = table();
    const wastes = toGraveyard(game, "Wastes");
    const bears = toGraveyard(game, "Grizzly Bears");
    const murder = toGraveyard(game, "Murder");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Disciple of the Sun");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([wastes, bears]));
    expect(seen.offered[0]).not.toContain(murder);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Radiant Epicure", () => {
  it("drains for the number of colors of mana spent to cast it", () => {
    const { game } = table();
    spawn(game, "Swamp");
    spawn(game, "Mountain");
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Radiant Epicure"));
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Mount Velus Manticore", () => {
  it("discarding a card deals damage equal to its number of card types", () => {
    const { game, a } = table();
    spawn(game, "Mount Velus Manticore");
    const orni = toHand(game, "Ornithopter");
    a.chooseDiscardsFn = () => [orni];
    pickModes(a, 0);
    pickTargets(a, B);
    toStep(game, "postcombat-main");
    expect(zone(game, orni)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
