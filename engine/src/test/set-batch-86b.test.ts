/**
 * Set walk batch 86, part b (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
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

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
const pool = (game: Game, player: PlayerId = A): readonly string[] =>
  game.state.players[player].manaPool.map((u) => u.type);
const loseLife = (game: Game, player: PlayerId, amount = 1): void =>
  game.debugApplyEffect(player, { kind: "lose-life", amount, target: 0 }, [ref(player)]);
const gainLife = (game: Game, player: PlayerId = A, amount = 1): void =>
  game.debugApplyEffect(player, { kind: "gain-life", amount });
const libraryOf = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Fireglass Mentor", () => {
  it("in your second main phase, if an opponent lost life, exiles the top two and only the chosen one may be played", () => {
    const { game, a } = table();
    spawn(game, "Fireglass Mentor");
    loseLife(game, B);
    const second = toLibrary(game, "Lightning Bolt");
    const first = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, first);
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    lands(game, "Mountain", 1);
    expect(canCast(game, first)).toBe(true);
    expect(canCast(game, second)).toBe(false);
    // "Until end of turn": gone by the next turn.
    nextTurn(game);
    expect(canCast(game, first, A)).toBe(false);
  });

  it("does nothing if no opponent lost life this turn", () => {
    const { game } = table();
    spawn(game, "Fireglass Mentor");
    loseLife(game, A);
    const top = toLibrary(game, "Lightning Bolt");
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, top)).toBe("library");
  });
});

describe("Brazen Collector", () => {
  it("adds {R} as it attacks, kept through the steps until the turn ends", () => {
    const { game, a } = table();
    const collector = spawn(game, "Brazen Collector");
    expect(keywords(game, collector).has("first-strike")).toBe(true);
    attack(game, a, [collector]);
    expect(pool(game)).toEqual(["R"]);
    nextTurn(game);
    expect(pool(game)).toEqual([]);
  });
});

describe("Skyskipper Duo", () => {
  it("exiles up to one other creature you control and returns it at the next end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const duo = enter(game, "Skyskipper Duo");
    // Only another creature *you* control — not the Duo, not bob's Bears.
    expect(seen.offered[0]).toEqual([bears]);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(zone(game, duo)).toBe("battlefield");
  });

  it("may exile nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    enter(game, "Skyskipper Duo");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Star Charter", () => {
  it("if you gained life this turn, finds a creature card with power 3 or less among the top four", () => {
    const { game, a } = table();
    spawn(game, "Star Charter");
    gainLife(game);
    const wurm = toLibrary(game, "Craw Wurm");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, giant);
    toStep(game, "end");
    settle(game);
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(zone(game, giant)).toBe("hand");
    expect(libraryOf(game).slice(-3)).toEqual(expect.arrayContaining([wurm, bolt, bears]));
  });

  it("losing life counts too; neither, and it doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Star Charter");
    const bears = toLibrary(game, "Grizzly Bears");
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    expect(libraryOf(game)[0]).toBe(bears);
    // Life lost on bob's turn isn't "this turn" by alice's next end step.
    nextTurn(game);
    loseLife(game, A);
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    toStep(game, "precombat-main");
    loseLife(game, A);
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(1);
  });
});

describe("Starlit Soothsayer", () => {
  it("surveils 1 at your end step only if you gained or lost life this turn", () => {
    const { game, a } = table();
    spawn(game, "Starlit Soothsayer");
    a.chooseScryFn = (_view, cards) => [...cards];
    const kept = toLibrary(game, "Lightning Bolt");
    toStep(game, "end");
    settle(game);
    expect(zone(game, kept)).toBe("library");
    toStep(game, "precombat-main");
    const top = toLibrary(game, "Lightning Bolt");
    loseLife(game, A);
    toStep(game, "end");
    settle(game);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Starseer Mentor", () => {
  it("at your end step, if you gained life, target opponent loses 3 unless they sacrifice or discard", () => {
    const { game, b } = table();
    spawn(game, "Starseer Mentor");
    spawn(game, "Grizzly Bears", B);
    let offered: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [];
    };
    gainLife(game);
    toStep(game, "end");
    settle(game);
    expect(offered).toEqual(["Sacrifice a nonland permanent", "Discard a card"]);
    expect(life(game, B)).toBe(17);
  });

  it("doesn't trigger without a life change", () => {
    const { game } = table();
    spawn(game, "Starseer Mentor");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Flamecache Gecko", () => {
  it("adds {B}{R} as it enters only if an opponent lost life this turn", () => {
    const { game } = table();
    enter(game, "Flamecache Gecko");
    expect(pool(game)).toEqual([]);
    loseLife(game, B);
    enter(game, "Flamecache Gecko");
    expect([...pool(game)].sort()).toEqual(["B", "R"]);
  });

  it("{1}{R}, discard a card: draw a card", () => {
    const { game, a } = table();
    const gecko = spawn(game, "Flamecache Gecko");
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [bolt];
    activate(game, gecko);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Harvestrite Host", () => {
  it("pumps as it or another Rabbit enters, and draws on the second resolution this turn only", () => {
    const { game, a } = table();
    const start = hand(game).length;
    // The Host is the only creature: its own entry targets it.
    const host = enter(game, "Harvestrite Host");
    expect(pt(game, host)).toEqual({ power: 4, toughness: 3 });
    expect(hand(game).length).toBe(start);
    // A non-Rabbit, or an opponent's Rabbit, doesn't trigger it.
    enter(game, "Grizzly Bears");
    enter(game, "Brave-Kin Duo", B);
    expect(pt(game, host)).toEqual({ power: 4, toughness: 3 });
    // Another Rabbit: the same ability's second resolution, so it draws.
    pickTargets(a, host);
    enter(game, "Brave-Kin Duo");
    expect(pt(game, host)).toEqual({ power: 5, toughness: 3 });
    expect(hand(game).length).toBe(start + 1);
    // The third doesn't draw.
    enter(game, "Brave-Kin Duo");
    expect(pt(game, host)).toEqual({ power: 6, toughness: 3 });
    expect(hand(game).length).toBe(start + 1);
  });
});

describe("Manifold Mouse", () => {
  it("at the beginning of combat, a target Mouse you control gains your choice of double strike or trample", () => {
    const { game, a } = table();
    const mouse = spawn(game, "Manifold Mouse");
    const duo = spawn(game, "Brave-Kin Duo");
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [duo]);
    pickModes(a, 1);
    toStep(game, "begin-combat");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([mouse, duo].sort());
    expect(keywords(game, duo).has("trample")).toBe(true);
    expect(keywords(game, duo).has("double-strike")).toBe(false);
  });

  it("offspring {2} makes a 1/1 token copy", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Manifold Mouse"), { kicked: true });
    const mice = named(game, "Manifold Mouse");
    expect(mice).toHaveLength(2);
    const token = mice.find((id) => game.state.objects[id].isToken)!;
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Builder's Talent", () => {
  it("makes a 0/4 Wall; level 2 counters a creature once per batch of noncreature, nonland permanents", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const talent = toHand(game, "Builder's Talent");
    cast(game, talent);
    expect(tokensNamed(game, "Wall Token (Builder's Talent)", A)).toBe(1);
    const wall = named(game, "Wall Token (Builder's Talent)")[0];
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 4 });
    expect(keywords(game, wall).has("defender")).toBe(true);
    // Level 1: an artifact entering does nothing.
    enter(game, "Sol Ring");
    expect(counters(game, wall)).toBe(0);
    activate(game, talent, 0);
    expect(game.state.objects[talent].classLevel).toBe(2);
    enter(game, "Sol Ring");
    expect(counters(game, wall)).toBe(1);
    // Two Treasures at once are one batch: one counter.
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 2 });
    settle(game);
    expect(counters(game, wall)).toBe(2);
    // A creature or a land isn't one.
    pickTargets(a, wall);
    enter(game, "Grizzly Bears");
    enter(game, "Plains");
    expect(counters(game, wall)).toBe(2);
  });

  it("level 3 returns a noncreature, nonland permanent card from your graveyard to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const talent = spawn(game, "Builder's Talent");
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Plains");
    const anthem = toGraveyard(game, "Glorious Anthem");
    activate(game, talent, 0);
    const seen = watchTargets(a, () => [ring]);
    activate(game, talent, 1);
    expect(game.state.objects[talent].classLevel).toBe(3);
    expect([...seen.offered[0]].sort()).toEqual([ring, anthem].sort());
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Wishing Well", () => {
  it("puts a coin counter on, then may cast an instant or sorcery with that mana value from your graveyard free, exiling it", () => {
    const { game, a } = table();
    const well = spawn(game, "Wishing Well");
    const opt = toGraveyard(game, "Opt");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const seen = watchTargets(a, () => [opt]);
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: opt,
      targets: [],
      via: offer.casts.find((c) => c.card === opt)!.via,
      ...(offer.free ? { free: true } : {}),
    });
    const before = hand(game).length;
    activate(game, well);
    expect(counters(game, well, "coin")).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([opt, bolt].sort());
    expect(seen.offered[0]).not.toContain(divination);
    expect(zone(game, opt)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });

  it("counts the counters after the new one: at three, a mana value 3 card", () => {
    const { game, a } = table();
    const well = spawn(game, "Wishing Well");
    game.state.objects[well].counters.coin = 2;
    toGraveyard(game, "Opt");
    const divination = toGraveyard(game, "Divination");
    let offeredCast = 0;
    a.chooseCastNowFn = () => {
      offeredCast += 1;
      return null;
    };
    activate(game, well);
    expect(counters(game, well, "coin")).toBe(3);
    expect(offeredCast).toBe(1);
    // Declined: it stays in the graveyard.
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("is activated only as a sorcery", () => {
    const { game } = table();
    const well = spawn(game, "Wishing Well");
    toStep(game, "upkeep", B);
    expect(() => activate(game, well)).toThrow();
  });
});

describe("Thornplate Intimidator", () => {
  it("as it enters, target opponent loses 3 life unless they sacrifice or discard; its offspring copy does it again", () => {
    const { game, b } = table();
    b.chooseModesFn = () => [];
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Thornplate Intimidator"), { kicked: true });
    expect(named(game, "Thornplate Intimidator")).toHaveLength(2);
    expect(life(game, B)).toBe(14);
  });

  it("the opponent may discard instead", () => {
    const { game, b } = table();
    b.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Discard a card")];
    const before = hand(game, B).length;
    enter(game, "Thornplate Intimidator");
    expect(life(game, B)).toBe(20);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Hired Claw", () => {
  it("deals 1 damage to target opponent once per attack with one or more Lizards", () => {
    const { game, a } = table();
    const claw = spawn(game, "Hired Claw");
    const monitor = spawn(game, "Canal Monitor");
    attack(game, a, [claw, monitor]);
    // 1 (trigger, once) + 1 + 5 combat.
    expect(life(game, B)).toBe(13);
  });

  it("an attack with no Lizard doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Hired Claw");
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    expect(life(game, B)).toBe(18);
  });

  it("{1}{R}: a +1/+1 counter, only if an opponent lost life this turn and only once each turn", () => {
    const { game } = table();
    const claw = spawn(game, "Hired Claw");
    lands(game, "Mountain", 4);
    expect(() => activate(game, claw)).toThrow();
    loseLife(game, B);
    activate(game, claw);
    expect(counters(game, claw)).toBe(1);
    expect(() => activate(game, claw)).toThrow();
  });
});

describe("Brambleguard Captain", () => {
  it("at the beginning of combat, target creature you control gets +X/+0, X its power", () => {
    const { game, a } = table();
    spawn(game, "Brambleguard Captain");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("a negative power gives +0/+0", () => {
    const { game, a } = table();
    const captain = spawn(game, "Brambleguard Captain");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -5, toughness: 0, duration: "end-of-turn" }, [ref(captain)]);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, captain).power).toBe(-3);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
