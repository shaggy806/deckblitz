/**
 * Reality Fracture (FRA), batch 1, part b (2026-10-11): the set's top cards by EDHREC rank.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  loyalty,
  named,
  nextTurn,
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
  tokensNamed,
  zone,
} from "./harness.js";

const gainLife = (game: Game, amount: number, player = A): void => {
  game.debugApplyEffect(player, { kind: "gain-life", amount }, []);
  settle(game);
};

const jaceToken = (game: Game, player = A): ObjectId => {
  const [jace] = named(game, "Jace Token", player);
  if (jace === undefined) throw new Error(`${player} has no Jace token`);
  return jace;
};

describe("Way of the Pyromancer", () => {
  it("empowers Jace 2, and its planeswalkers' granted +1: Add {R} is a loyalty ability on the stack", () => {
    const { game } = table();
    enter(game, "Way of the Pyromancer");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(2);
    // Settling the enters trigger ran on into combat; loyalty abilities want a main phase.
    toStep(game, "postcombat-main");
    // The Jace token's two printed abilities come first; the granted one is third.
    activate(game, jace, 2, { settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(game.state.players[A].manaPool).toHaveLength(0);
    expect(counters(game, jace, "loyalty")).toBe(3);
    settle(game);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(1);
    expect(pool[0].type).toBe("R");
    // It was that planeswalker's one loyalty activation this turn (the ruling).
    expect(() => loyalty(game, jace, -1)).toThrow(/already been activated/);
  });

  it("grants it to a nontoken planeswalker too", () => {
    const { game } = table();
    spawn(game, "Way of the Pyromancer");
    const beleren = spawn(game, "Jace Beleren");
    const printed = game.registry.get("Jace Beleren").activated.length;
    const before = counters(game, beleren, "loyalty");
    activate(game, beleren, printed);
    expect(counters(game, beleren, "loyalty")).toBe(before + 1);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R"]);
  });
});

describe("Way of the Necromancer", () => {
  it("puts a loyalty counter on each planeswalker you control when a creature you control dies", () => {
    const { game } = table();
    spawn(game, "Way of the Necromancer");
    const beleren = spawn(game, "Jace Beleren");
    const theirs = spawn(game, "Jace Beleren", B);
    const mine = spawn(game, "Grizzly Bears");
    const theirBear = spawn(game, "Grizzly Bears", B);
    const before = counters(game, beleren, "loyalty");
    const theirsBefore = counters(game, theirs, "loyalty");
    destroy(game, mine);
    expect(counters(game, beleren, "loyalty")).toBe(before + 1);
    expect(counters(game, theirs, "loyalty")).toBe(theirsBefore);
    destroy(game, theirBear);
    expect(counters(game, beleren, "loyalty")).toBe(before + 1);
  });
});

describe("Ingris Stingerquill", () => {
  it("the attacking creature deals the 1 damage, so its lifelink applies", () => {
    const { game, a } = table();
    spawn(game, "Ingris Stingerquill");
    const nighthawk = spawn(game, "Vampire Nighthawk");
    attack(game, a, [nighthawk]);
    // 1 from the trigger + 2 combat, both from the Nighthawk.
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("{4} makes a 2/2 Cadet, then creatures you control gain haste", () => {
    const { game } = table();
    const ingris = spawn(game, "Ingris Stingerquill");
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Wastes", 4);
    activate(game, ingris, 0);
    const [cadet] = named(game, "Cadet", A);
    expect(cadet).toBeDefined();
    expect(pt(game, cadet)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, cadet).has("haste")).toBe(true);
    expect(keywords(game, fresh).has("haste")).toBe(true);
  });
});

describe("Kwia Vigorbloom", () => {
  it("makes one Lotus however many times you gain life in a turn", () => {
    const { game } = table();
    spawn(game, "Kwia Vigorbloom");
    gainLife(game, 1);
    gainLife(game, 1);
    expect(tokensNamed(game, "Lotus", A)).toBe(1);
    nextTurn(game);
    gainLife(game, 1);
    expect(tokensNamed(game, "Lotus", A)).toBe(2);
  });
});

describe("Aerid Konstrari", () => {
  it("makes a Heartwood as it enters, and {6} counts the new Heartwood in its +X/+0", () => {
    const { game } = table();
    const aerid = enter(game, "Aerid Konstrari");
    expect(tokensNamed(game, "Heartwood Token", A)).toBe(1);
    spawn(game, "Sol Ring", B);
    lands(game, "Wastes", 6);
    activate(game, aerid, 0);
    expect(tokensNamed(game, "Heartwood Token", A)).toBe(2);
    // Your two Heartwoods, not the opponent's Sol Ring.
    expect(pt(game, aerid)).toEqual({ power: 7, toughness: 4 });
  });
});

describe("Liliana the Repentant", () => {
  it("exhaust reanimates a creature card and grows Liliana, once; the arrival mills two", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana the Repentant");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 12);
    activate(game, liliana, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, liliana)).toBe(1);
    // The Bears entering milled two Wastes.
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(2);
    const again = toGraveyard(game, "Hill Giant");
    expect(() => activate(game, liliana, 0, { targets: [ref(again)] })).toThrow(/only once/);
  });
});

describe("Enlightened Confidant", () => {
  const surveilTop = (game: Game, seat: ReturnType<typeof table>["a"]): void => {
    seat.chooseScryFn = (_view, cards) => cards;
    toStep(game, "end");
    settle(game);
  };

  it("returns the surveilled card when its mana value is at most the life gained this turn", () => {
    const { game, a } = table();
    spawn(game, "Enlightened Confidant");
    const bears = toLibrary(game, "Grizzly Bears");
    gainLife(game, 2);
    surveilTop(game, a);
    expect(hand(game)).toContain(bears);
  });

  it("leaves a costlier card in the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Enlightened Confidant");
    const giant = toLibrary(game, "Hill Giant");
    gainLife(game, 3);
    surveilTop(game, a);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("doesn't trigger without life gained this turn", () => {
    const { game, a } = table();
    spawn(game, "Enlightened Confidant");
    let asked = 0;
    a.chooseScryFn = (_view, cards) => {
      asked += 1;
      return cards;
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
  });
});

describe("Roiling Canopy", () => {
  it("pumps only with five other Forests besides the one that entered", () => {
    const { game, a } = table();
    spawn(game, "Roiling Canopy");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    pickTargets(a, bears);
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Return to the Light Realms", () => {
  it("returns every nonland permanent card, and no land — an artifact land included", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const seat = toGraveyard(game, "Seat of the Synod");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Plains", 9);
    cast(game, toHand(game, "Return to the Light Realms"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, seat)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
