/**
 * Star Trek (TRK) — completing the set after its release (author-by-set,
 * batch 3): the cards an earlier batch left blocked, each on the clause that
 * blocked it.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  lands,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "add-counter", target: 0, counter, amount }, [
    ref(id),
  ]);

/** The seat casts every card it's offered, once each; records the offers. */
function castEverything(seat: ScriptedController): { offered: ObjectId[][] } {
  const seen = { offered: [] as ObjectId[][] };
  const done = new Set<ObjectId>();
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push([...offer.cards]);
    const pick = offer.cards.find((id) => !done.has(id));
    if (pick === undefined) return null;
    done.add(pick);
    const way = offer.casts.find((c) => c.card === pick)!;
    return { type: "cast-spell", player: seat.playerId, card: pick, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Borg Cube", () => {
  it("exiles a creature when none is exiled with it, then assimilates that card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, bears);
    const cube = enter(game, "Borg Cube");
    expect(zone(game, bears)).toBe("exile");

    // Stationed to 12, it attacks: the bear comes back assimilated, and the
    // target chosen this time (the elves) isn't exiled.
    addCounters(game, cube, "charge", 12);
    pickTargets(a, elves);
    a.declareAttackersFn = () => [{ attacker: cube, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(types(game, bears)).toContain("artifact");
    expect(subtypes(game, bears)).toEqual(["Borg"]);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Starfleet Academy", () => {
  it("adds one colour, as much as the creature types among non-Borg creatures you control", () => {
    const { game } = table();
    const academy = spawn(game, "Starfleet Academy");
    spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Llanowar Elves"); // Elf Druid
    spawn(game, "Assimilation Assessor"); // Borg: not counted
    lands(game, "Wastes", 5);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: academy,
      abilityIndex: 1,
      targets: [],
      manaColors: ["R", "R", "R"] satisfies readonly ManaType[],
    });
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 3 });
  });
});

describe("Kira Nerys, Firebrand", () => {
  it("has a creature that enters while you control an attacker enter tapped and attacking", () => {
    const { game, a } = table();
    spawn(game, "Kira Nerys, Firebrand");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Raise the Alarm"));
    const soldiers = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Soldier Token",
    );
    expect(soldiers.length).toBeGreaterThan(0);
    for (const id of soldiers) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(game.state.objects[id].attacking).toBe(B);
    }
    toStep(game, "postcombat-main");
    // The bear (2) and two 1/1 Soldiers each pumped +1/+1 by Kira.
    expect(game.state.players[B].life).toBe(20 - 2 - 2 * 2);
  });

  it("does nothing while no creature you control is attacking", () => {
    const { game } = table();
    spawn(game, "Kira Nerys, Firebrand");
    lands(game, "Plains", 2);
    toStep(game, "precombat-main");
    cast(game, toHand(game, "Raise the Alarm"));
    for (const id of game.state.zones.shared.battlefield) {
      if (game.state.objects[id].cardName !== "Soldier Token") continue;
      expect(game.state.objects[id].tapped).toBe(false);
      expect(game.state.objects[id].attacking).toBeNull();
    }
  });
});

describe("Guinan, Ancient Advisor", () => {
  it("draws when it put two or more counters, counting counters rather than creatures", () => {
    const { game } = table();
    const guinan = spawn(game, "Guinan, Ancient Advisor");
    lands(game, "Plains", 2);
    toStep(game, "precombat-main"); // Guinan entered on an earlier turn
    enter(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, guinan);
    expect(hand(game).length).toBe(before); // one counter on one creature

    // Hardened Scales makes one creature's counter two.
    const { game: g2 } = table();
    const guinan2 = spawn(g2, "Guinan, Ancient Advisor");
    spawn(g2, "Hardened Scales");
    lands(g2, "Plains", 1);
    toStep(g2, "precombat-main");
    const bear = enter(g2, "Grizzly Bears");
    const before2 = hand(g2).length;
    activate(g2, guinan2);
    expect(counters(g2, bear, "+1/+1")).toBe(2);
    expect(hand(g2).length).toBe(before2 + 1);
  });
});

describe("Jean-Luc Picard, Luminary", () => {
  it("draws for another historic permanent of mana value 3 or more, not a lesser one", () => {
    const { game } = table();
    spawn(game, "Jean-Luc Picard, Luminary");
    const before = hand(game).length;
    enter(game, "Solemn Simulacrum"); // artifact, MV 4 (its own trigger may search)
    const afterSolemn = hand(game).length;
    expect(afterSolemn).toBe(before + 1);
    enter(game, "Mind Stone"); // artifact, MV 2
    enter(game, "Hill Giant"); // MV 4, not historic
    expect(hand(game).length).toBe(afterSolemn);
  });

  it("seeks out: a +1/+1 counter on another creature and two charge counters on a Spacecraft", () => {
    const { game, a } = table();
    spawn(game, "Jean-Luc Picard, Luminary");
    const bears = spawn(game, "Grizzly Bears");
    const sphere = spawn(game, "Borg Scout Sphere");
    pickTargets(a, bears, sphere);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    expect(counters(game, sphere, "charge")).toBe(2);
  });
});

describe("Werewolf Pack Leader", () => {
  it("is just a Werewolf until end of turn (its Oracle text since 2026-11)", () => {
    const { game } = table();
    const leader = spawn(game, "Werewolf Pack Leader");
    lands(game, "Forest", 4);
    activate(game, leader, 0);
    expect(subtypes(game, leader)).toEqual(["Werewolf"]);
  });
});

describe("Captain Benjamin Sisko", () => {
  it("makes an Officer for each dilemma faced this turn", () => {
    const { game } = table();
    spawn(game, "Captain Benjamin Sisko");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Izzet Charm"), { modes: [2] });
    cast(game, toHand(game, "Izzet Charm"), { modes: [2] });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Officer Token")).toBe(2);
  });

  it("casts the exiled spells whose mana value is at most the Officers you control, free", () => {
    const { game, a } = table();
    const seen = castEverything(a);
    const sisko = spawn(game, "Captain Benjamin Sisko");
    spawn(game, "Officer Token");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Wastes"]) spawn(game, land);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Hill Giant"); // MV 4: too big
    const bears = toLibrary(game, "Grizzly Bears"); // MV 2, on top
    activate(game, sisko);
    expect(zone(game, bears)).toBe("battlefield");
    expect(seen.offered.flat().every((id) => id === bears)).toBe(true);
    expect(
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Hill Giant"),
    ).toHaveLength(0);
  });
});

describe("The Caretaker", () => {
  it("at each end step after you faced a dilemma, casts an opponent's next nonland card free", () => {
    const { game, a } = table();
    castEverything(a);
    spawn(game, "The Caretaker");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    toLibrary(game, "Forest", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    toStep(game, "end"); // no dilemma: nothing
    settle(game);
    expect(zone(game, bears)).toBe("library");
    toStep(game, "precombat-main");
    cast(game, toHand(game, "Izzet Charm"), { modes: [2] });
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});
