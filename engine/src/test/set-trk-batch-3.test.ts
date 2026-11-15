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
  keywords,
  lands,
  nextTurn,
  pickTargets,
  ref,
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

describe("H.M.S. Bounty, Unlikely Timeship", () => {
  it("takes an extra turn with a Whale only until an extra turn of yours has begun this game", () => {
    const { game, a } = table();
    const bounty = spawn(game, "H.M.S. Bounty, Unlikely Timeship");
    addCounters(game, bounty, "charge", 8);
    spawn(game, "Aethertide Whale");
    a.declareAttackersFn = () => [{ attacker: bounty, defender: B }];
    toStep(game, "postcombat-main");
    expect(game.state.extraTurns).toEqual([A]);

    // The extra turn begins; two rounds later, Bounty connects again.
    toStep(game, "precombat-main");
    expect(game.state.turn.isExtra).toBe(true);
    a.declareAttackersFn = () => [];
    toStep(game, "precombat-main");
    toStep(game, "precombat-main");
    expect(game.state.turn.isExtra).toBe(false);
    const before = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: bounty, defender: B }];
    toStep(game, "postcombat-main");
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.extraTurns).toEqual([]);
  });
});

describe("Sulu, Heroic Helmsman", () => {
  it("stations as though his power were tripled", () => {
    const { game, a } = table();
    const sulu = spawn(game, "Sulu, Heroic Helmsman");
    const sphere = spawn(game, "Borg Scout Sphere");
    a.choosePermanentsFn = () => [sulu];
    activate(game, sphere, 0);
    expect(counters(game, sphere, "charge")).toBe(6);
    expect(game.state.objects[sulu].tapped).toBe(true);
  });

  it("crews as though his power were tripled", () => {
    const { game } = table();
    spawn(game, "Sulu, Heroic Helmsman");
    const vehicle = spawn(game, "Smuggler's Copter"); // crew 1
    const titan = spawn(game, "Parhelion II"); // crew 4
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === titan)).toBe(true);
    expect(vehicle).toBeDefined();
  });
});

describe("Sarek, Federation Ambassador", () => {
  it("draws a card for every five creature types, and three or more pump every creature", () => {
    const { game } = table();
    const sarek = spawn(game, "Sarek, Federation Ambassador"); // Vulcan Advisor
    // Fifteen more types: three cards, so two counters on each creature.
    for (const name of ["Grizzly Bears", "Llanowar Elves", "Goblin Guide", "Savannah Lions", "Merfolk Looter", "Hill Giant", "Squadron Hawk", "Walking Corpse", "Typhoid Rats", "Wall of Omens"]) {
      spawn(game, name);
    }
    const types = new Set<string>();
    for (const id of game.state.zones.shared.battlefield) for (const t of subtypes(game, id)) types.add(t);
    const draws = Math.floor(types.size / 5);
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(before + draws);
    expect(counters(game, sarek, "+1/+1")).toBe(draws >= 3 ? 2 : 0);
    expect(draws).toBeGreaterThanOrEqual(3);
  });

  it("draws one for five types and puts no counters", () => {
    const { game } = table();
    const sarek = spawn(game, "Sarek, Federation Ambassador"); // Vulcan Advisor
    spawn(game, "Llanowar Elves"); // Elf Druid
    spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Assimilation Assessor"); // Borg: none
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, sarek, "+1/+1")).toBe(0);
  });
});

describe("Rules of Acquisition", () => {
  it("the 3rd Rule: takes the permanent, and the player it was taken from draws three", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const relic = spawn(game, "Darksteel Relic", B);
    const before = game.state.zones.perPlayer[B].hand.length;
    cast(game, toHand(game, "Rules of Acquisition"), { modes: [0], targets: [ref(relic)] });
    expect(game.state.objects[relic].controller).toBe(A);
    expect(game.state.zones.perPlayer[B].hand.length).toBe(before + 3);
  });

  it("the 98th Rule: gives the permanent away, then you draw three", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const relic = spawn(game, "Darksteel Relic");
    const before = hand(game).length;
    const roa = toHand(game, "Rules of Acquisition");
    cast(game, roa, { modes: [1], targets: [ref(B), ref(relic)] });
    expect(game.state.objects[relic].controller).toBe(B);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Nog, Ambitious Cadet", () => {
  it("becomes a Scout, then an Officer who plays lands from the graveyard and an extra land", () => {
    const { game } = table();
    game.state.rules.maxLandsPerTurn = 1; // the harness allows any number
    const nog = spawn(game, "Nog, Ambitious Cadet");
    lands(game, "Swamp", 4);
    activate(game, nog, 1); // not a Scout yet: nothing
    expect(subtypes(game, nog)).toEqual(["Ferengi", "Rogue"]);
    activate(game, nog, 0);
    expect(subtypes(game, nog)).toEqual(["Ferengi", "Scout"]);
    toStep(game, "precombat-main"); // his next turn: lands untapped
    activate(game, nog, 1);
    expect(subtypes(game, nog)).toEqual(["Ferengi", "Officer"]);
    const forest = toGraveyard(game, "Forest");
    const mountain = toHand(game, "Mountain");
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    game.dispatch({ type: "play-land", player: A, card: mountain });
    expect(zone(game, mountain)).toBe("battlefield");
    expect(game.canDispatch({ type: "play-land", player: A, card: toHand(game, "Plains") })).not.toBeNull();
  });
});

describe("Kai Winn, Faithless Leader", () => {
  it("drains an opponent for a mana ability of a permanent and a cycling from hand with the chosen name", () => {
    const { game } = table();
    const kai = spawn(game, "Kai Winn, Faithless Leader");
    game.state.objects[kai].chosenNames = ["Llanowar Elves"];
    const elves = spawn(game, "Llanowar Elves", B);
    nextTurn(game); // bob's turn, his priority
    game.dispatch({ type: "activate-ability", player: B, source: elves, abilityIndex: 0, targets: [] });
    settle(game);
    expect(game.state.players[B].life).toBe(17);

    game.state.objects[kai].chosenNames = ["Street Wraith"];
    const wraith = toHand(game, "Street Wraith", B);
    const cycle = game
      .legalActions(B)
      .find((x) => x.kind === "activate-ability" && x.source === wraith);
    expect(cycle).toBeDefined();
    if (cycle?.kind !== "activate-ability") return;
    game.dispatch({ type: "activate-ability", player: B, source: wraith, abilityIndex: cycle.abilityIndex, targets: [] });
    settle(game);
    expect(game.state.players[B].life).toBe(17 - 2 - 3);
  });
});

describe("Romulan Bird-of-Prey", () => {
  it("has hexproof only while it isn't a creature, and charges on noncreature spells then", () => {
    const { game } = table();
    const bird = spawn(game, "Romulan Bird-of-Prey");
    expect(keywords(game, bird)).toContain("hexproof");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, bird, "charge")).toBe(2);
    addCounters(game, bird, "charge", 6);
    expect(types(game, bird)).toContain("creature");
    expect(keywords(game, bird)).not.toContain("hexproof");
    expect(keywords(game, bird)).toContain("flying");
    cast(game, toHand(game, "Opt"));
    expect(counters(game, bird, "charge")).toBe(8);
  });
});

describe("The City on the Edge of Forever", () => {
  it("phases out every artifact and creature, which stay out while the Human remains", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Darksteel Relic");
    enter(game, "The City on the Edge of Forever");
    expect(zone(game, bears)).toBe("phased-out");
    expect(zone(game, relic)).toBe("phased-out");
    expect(tokensNamed(game, "Human Token (Permanents can't phase in)")).toBe(1);
    nextTurn(game); // bob's untap step: his Bears can't phase in
    expect(zone(game, bears)).toBe("phased-out");
  });

  it("III: sacrifices a creature token for 5 life", () => {
    const { game } = table();
    spawn(game, "Soldier Token");
    const city = enter(game, "The City on the Edge of Forever");
    game.state.objects[city].counters.lore = 2;
    toStep(game, "precombat-main"); // the next draw step adds the third lore counter
    settle(game);
    expect(tokensNamed(game, "Soldier Token")).toBe(0);
    expect(game.state.players[A].life).toBeGreaterThanOrEqual(20 + 5 - 2);
  });
});

describe("Dr. Beverly Crusher", () => {
  it("makes her own life-gain trigger happen an additional time", () => {
    const { game } = table();
    const crusher = spawn(game, "Dr. Beverly Crusher");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(counters(game, crusher, "+1/+1")).toBe(2);
  });
});

describe("Brad Boimler, Eager Ensign", () => {
  it("becoming tapped makes counters on your permanents one more until end of turn", () => {
    const { game } = table();
    const brad = spawn(game, "Brad Boimler, Eager Ensign");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounters(game, bears, "+1/+1", 1);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(brad)]);
    settle(game);
    addCounters(game, bears, "+1/+1", 1);
    expect(counters(game, bears, "+1/+1")).toBe(3);
    addCounters(game, theirs, "+1/+1", 1);
    expect(counters(game, theirs, "+1/+1")).toBe(1);
    nextTurn(game);
    addCounters(game, bears, "+1/+1", 1);
    expect(counters(game, bears, "+1/+1")).toBe(4);
  });
});

describe("Lwaxana Troi, Charming Guest", () => {
  it("doubles the chosen creature's triggers while she stays tapped", () => {
    const { game, a } = table();
    const lwaxana = spawn(game, "Lwaxana Troi, Charming Guest");
    const julian = spawn(game, "Julian Bashir, Frontier Doctor"); // seek out: a counter on himself
    lands(game, "Mountain", 2);
    pickTargets(a, julian);
    activate(game, lwaxana, 0, { targets: [ref(julian)] });
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, julian, "+1/+1")).toBe(2);
    a.choosePermanentsFn = () => []; // her untap step: she untaps, and it ends
    toStep(game, "precombat-main");
    expect(game.state.objects[lwaxana].tapped).toBe(false);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, julian, "+1/+1")).toBe(3);
  });
});

describe("Dominion Saboteur", () => {
  it("enters as a nonlegendary copy with the copied permanent's counters", () => {
    const { game, a } = table();
    const julian = spawn(game, "Julian Bashir, Frontier Doctor", B);
    addCounters(game, julian, "+1/+1", 2);
    addCounters(game, julian, "charge", 1);
    a.chooseCopyFn = (_view, _source, options) => (options.includes(julian) ? julian : (options[0] ?? null));
    lands(game, "Island", 5);
    const saboteur = toHand(game, "Dominion Saboteur");
    cast(game, saboteur);
    expect(game.state.objects[saboteur].zone).toBe("battlefield");
    expect(subtypes(game, saboteur)).toContain("Human");
    expect(supertypes(game, saboteur)).not.toContain("legendary");
    expect(counters(game, saboteur, "+1/+1")).toBe(2);
    expect(counters(game, saboteur, "charge")).toBe(1);
  });
});

describe("Scotty, Miracle Worker", () => {
  const offers = (game: Game, card: ObjectId) =>
    game.legalActions(A).filter((x) => x.kind === "cast-spell" && x.card === card && x.via === "flashback");

  it("gives instants and sorceries in your graveyard beam me up at their mana cost, in your main phase", () => {
    const { game } = table();
    const scotty = spawn(game, "Scotty, Miracle Worker");
    lands(game, "Island", 1);
    const opt = toGraveyard(game, "Opt");
    expect(offers(game, opt)).toHaveLength(0); // only Scotty to return: he can't be
    const bears = spawn(game, "Grizzly Bears");
    expect(offers(game, opt)).toHaveLength(1);
    cast(game, opt, { via: "flashback" });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, scotty)).toBe("battlefield");
    expect(zone(game, opt)).toBe("exile");
  });

  it("does nothing outside your main phase", () => {
    const { game } = table();
    spawn(game, "Scotty, Miracle Worker");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    const opt = toGraveyard(game, "Opt");
    toStep(game, "upkeep");
    expect(offers(game, opt)).toHaveLength(0);
  });
});

describe("Marooned", () => {
  it("the enchanted creature can't be returned for beam me up", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Marooned"), { targets: [ref(bears)] });
    const comms = toGraveyard(game, "Open Communications");
    const offered = () =>
      game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === comms && x.via === "flashback");
    expect(offered()).toBe(false);
    spawn(game, "Grizzly Bears");
    expect(offered()).toBe(true);
  });
});
