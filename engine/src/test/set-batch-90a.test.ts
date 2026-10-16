/**
 * Set walk batch 90, part a (2026-10-16): Fallout (PIP) and Ravnica: Clue Edition (CLU), the rest of the sets.
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
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
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

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const energy = (game: Game, player: PlayerId = A): number => game.state.players[player].energy;
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });

describe("Automated Assembly Line", () => {
  it("one energy per player dealt combat damage by your artifact creatures, however many dealt it", () => {
    const { game, a } = table();
    spawn(game, "Automated Assembly Line");
    const sire = spawn(game, "Myr Sire");
    const memnite = spawn(game, "Memnite");
    attack(game, a, [sire, memnite]);
    expect(life(game, B)).toBe(18);
    expect(energy(game)).toBe(1);
  });

  it("a non-artifact creature's combat damage gets nothing", () => {
    const { game, a } = table();
    spawn(game, "Automated Assembly Line");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(energy(game)).toBe(0);
  });

  it("Pay {E}{E}{E}: a tapped 3/3 colorless Robot artifact creature token", () => {
    const { game } = table();
    const line = spawn(game, "Automated Assembly Line");
    game.state.players[A].energy = 3;
    activate(game, line, 0);
    expect(energy(game)).toBe(0);
    const [robot] = named(game, "Robot Token (Automated Assembly Line)", A);
    expect(isTapped(game, robot)).toBe(true);
    expect(pt(game, robot)).toEqual({ power: 3, toughness: 3 });
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === line)).toBe(false);
  });
});

describe("Paladin Danse, Steel Maverick", () => {
  it("exiles itself: your artifact and Human creatures gain indestructible, nothing else does", () => {
    const { game } = table();
    const danse = spawn(game, "Paladin Danse, Steel Maverick");
    const human = spawn(game, "Elite Vanguard");
    const artifact = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Elite Vanguard", B);
    activate(game, danse, 0);
    expect(zone(game, danse)).toBe("exile");
    expect(keywords(game, human).has("indestructible")).toBe(true);
    expect(keywords(game, artifact).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
    // Fixed as it resolved: a Human arriving later doesn't get it.
    const later = spawn(game, "Elite Vanguard");
    expect(keywords(game, later).has("indestructible")).toBe(false);
  });
});

describe("Paladin Elizabeth Taggerdy", () => {
  it("battalion: draws, then puts a creature card with mana value up to her power onto the battlefield tapped and attacking", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Paladin Elizabeth Taggerdy");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const lions = toHand(game, "Savannah Lions");
    const giant = toHand(game, "Hill Giant");
    const before = hand(game).length;
    const seen = pickFromZone(a, lions);
    attack(game, a, [paladin, one, two]);
    expect(seen.offered).toContain(lions);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, lions)).toBe("battlefield");
    expect(isTapped(game, lions)).toBe(true);
    // Drew one, put one onto the battlefield.
    expect(hand(game).length).toBe(before);
    // 3 + 2 + 2 + the Lions' 2.
    expect(life(game, B)).toBe(11);
  });

  it("X is her power as it resolves: with a +1/+1 counter a four-drop is offered", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Paladin Elizabeth Taggerdy");
    game.state.objects[paladin].counters["+1/+1"] = 1;
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const seen = pickFromZone(a, giant);
    attack(game, a, [paladin, one, two]);
    expect(seen.offered).toContain(giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("with only one other attacker it doesn't trigger", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Paladin Elizabeth Taggerdy");
    const one = spawn(game, "Grizzly Bears");
    toHand(game, "Savannah Lions");
    const before = hand(game).length;
    attack(game, a, [paladin, one]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Sentinel Sarah Lyons", () => {
  it("creatures you control get +2/+2 once an artifact entered under your control this turn, even after it's gone", () => {
    const { game } = table();
    spawn(game, "Sentinel Sarah Lyons");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    makeToken(game, "Treasure Token", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    makeToken(game, "Treasure Token");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const [treasure] = named(game, "Treasure Token", A);
    destroy(game, treasure);
    expect(zone(game, treasure) === "battlefield").toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("battalion: deals damage equal to the number of artifacts you control to target player", () => {
    const { game, a } = table();
    const sarah = spawn(game, "Sentinel Sarah Lyons");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    pickTargets(a, B);
    attack(game, a, [sarah, one, two]);
    // 4 + 2 + 2 combat, and 2 for the two artifacts.
    expect(life(game, B)).toBe(10);
  });
});

describe("Liberty Prime, Recharged", () => {
  it("attacking with {E}{E}, it may pay to stay", () => {
    const { game, a } = table();
    const prime = spawn(game, "Liberty Prime, Recharged");
    game.state.players[A].energy = 3;
    pickModes(a, 0);
    attack(game, a, [prime]);
    expect(zone(game, prime)).toBe("battlefield");
    expect(energy(game)).toBe(1);
    expect(life(game, B)).toBe(12);
  });

  it("declining, or without the energy, it's sacrificed", () => {
    const { game, a } = table();
    const prime = spawn(game, "Liberty Prime, Recharged");
    game.state.players[A].energy = 1;
    pickModes(a, 0);
    attack(game, a, [prime]);
    expect(zone(game, prime)).toBe("graveyard");
    expect(energy(game)).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("blocking triggers it too", () => {
    const { game, a, b } = table();
    const prime = spawn(game, "Liberty Prime, Recharged");
    game.state.players[A].energy = 2;
    pickModes(a);
    toStep(game, "precombat-main", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: prime, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, prime)).toBe("graveyard");
    expect(energy(game)).toBe(2);
  });

  it("{2}, {T}, Sacrifice an artifact: you get {E}{E} and draw a card", () => {
    const { game } = table();
    const prime = spawn(game, "Liberty Prime, Recharged");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: prime, abilityIndex: 0, targets: [], sacrifice: ring });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(energy(game)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Armory Paladin", () => {
  it("casting an Equipment spell exiles the top card, playable until the end of your next turn", () => {
    const { game } = table();
    spawn(game, "Armory Paladin");
    lands(game, "Wastes", 1);
    lands(game, "Forest", 2);
    const top = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Bonesplitter"));
    expect(zone(game, top)).toBe("exile");
    expect(canCast(game, top)).toBe(true);
    toStep(game, "upkeep", B);
    toStep(game, "precombat-main");
    expect(zone(game, top)).toBe("exile");
    expect(canCast(game, top)).toBe(true);
  });

  it("an Aura spell triggers it; another artifact spell doesn't", () => {
    const { game } = table();
    spawn(game, "Armory Paladin");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    lands(game, "Forest", 1);
    const first = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Sol Ring"));
    expect(zone(game, first)).toBe("library");
    cast(game, toHand(game, "Rancor"), { targets: [ref(bears)] });
    expect(zone(game, first)).toBe("exile");
  });
});

describe("Battle of Hoover Dam", () => {
  it("NCR: at your end step returns a creature card with mana value 3 or less with a finality counter", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "NCR";
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Battle of Hoover Dam"));
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const corpse = toGraveyard(game, "Walking Corpse");
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "end");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, corpse].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, corpse)).toBe("graveyard");
    // No Legion: a creature dying puts no counters anywhere.
    const lions = spawn(game, "Savannah Lions");
    destroy(game, bears);
    expect(counters(game, lions)).toBe(0);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Legion: a creature you control dying puts two +1/+1 counters on target creature you control", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Legion";
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Battle of Hoover Dam"));
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, lions);
    destroy(game, bears);
    expect(counters(game, lions)).toBe(2);
    // An opponent's creature dying: nothing.
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, lions)).toBe(2);
    // NCR's end step does nothing.
    toGraveyard(game, "Savannah Lions");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Savannah Lions", A)).toEqual([lions]);
  });
});

describe("James, Wandering Dad // Follow Him", () => {
  it("Follow Him investigates X times, then James is cast from exile", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const card = toHand(game, "James, Wandering Dad");
    cast(game, card, { face: 1, x: 3 });
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
  });

  it("James's {C}{C} can pay for an ability but not cast a spell", () => {
    const { game } = table();
    const james = spawn(game, "James, Wandering Dad");
    const ring = toHand(game, "Sol Ring");
    activate(game, james, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C"]);
    expect(canCast(game, ring)).toBe(false);
    // A Clue's {2} is an ability: the mana pays it.
    makeToken(game, "Clue Token");
    const [clue] = named(game, "Clue Token", A);
    const before = hand(game).length;
    activate(game, clue, 0);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Almost Perfect", () => {
  it("enchanted creature has base 9/10 and indestructible; counters still count", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Almost Perfect"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 10, toughness: 11 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Jason Bright, Glowing Prophet", () => {
  it("a Zombie or Mutant you control dying with power different from its base power draws a card", () => {
    const { game } = table();
    spawn(game, "Jason Bright, Glowing Prophet");
    const corpse = spawn(game, "Walking Corpse");
    game.state.objects[corpse].counters["+1/+1"] = 1;
    const before = hand(game).length;
    destroy(game, corpse);
    expect(hand(game).length).toBe(before + 1);
  });

  it("at its base power, or not a Zombie or Mutant, or an opponent's: no draw", () => {
    const { game } = table();
    spawn(game, "Jason Bright, Glowing Prophet");
    const corpse = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const theirs = spawn(game, "Walking Corpse", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    const before = hand(game).length;
    destroy(game, corpse);
    destroy(game, bears);
    destroy(game, theirs);
    expect(hand(game).length).toBe(before);
  });

  it("Come Fly With Me: {2}, sacrifice a creature: a +1/+1 counter and flying on target creature you control", () => {
    const { game } = table();
    const jason = spawn(game, "Jason Bright, Glowing Prophet");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Wastes", 2);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: jason,
      abilityIndex: 0,
      targets: [ref(lions)],
      sacrifice: bears,
    });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, lions)).toBe(1);
    expect(keywords(game, lions).has("flying")).toBe(true);
  });
});

describe("Vault 75: Middle School", () => {
  it("I exiles every creature with power 4 or greater; II puts a +1/+1 counter on each creature you control", () => {
    const { game } = table();
    const giant = spawn(game, "Craw Wurm");
    const theirs = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears");
    const opposing = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Vault 75: Middle School"));
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "upkeep", B);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, opposing)).toBe(0);
  });
});

