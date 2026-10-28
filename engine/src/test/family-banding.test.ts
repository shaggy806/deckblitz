/**
 * The cards freed by the banding family (rule 702.22 — `combat/banding.ts`,
 * `banding.test.ts` for the rule itself): "bands with other" granted (the
 * Legends lands) and printed (Master of the Hunt's Wolves), lost (Shelkin
 * Brownie, Tolaria), and "creatures banded with it" (Icatian Skirmishers,
 * Urza's Engine).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
} from "./harness.js";

const toAttackers = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "attackers");
const asBand = (game: Game, ids: readonly ObjectId[]) =>
  game.canDispatch({ type: "declare-attackers", player: A, attackers: ids.map((attacker) => ({ attacker, defender: B, band: 1 })) });

describe("bands with other legendary creatures (the Legends lands)", () => {
  it("Cathedral of Serra lets white legends band with any legend", () => {
    const { game } = table();
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears");
    toAttackers(game);
    expect(asBand(game, [thalia, isamaru])).toMatch(/can't attack as a band/);
    spawn(game, "Cathedral of Serra");
    expect(keywords(game, thalia).has("bands-with-other")).toBe(true);
    expect(asBand(game, [thalia, isamaru])).toBeNull();
    // Every member has to be of the quality: a Bear isn't legendary.
    expect(asBand(game, [thalia, isamaru, bears])).toMatch(/can't attack as a band/);
  });

  it("Mountain Stronghold grants it to red legends only", () => {
    const { game } = table();
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    spawn(game, "Mountain Stronghold");
    expect(keywords(game, thalia).has("bands-with-other")).toBe(false);
  });
});

describe("Master of the Hunt", () => {
  it("makes Wolves of the Hunt, which band with each other and nothing else", () => {
    const { game } = table();
    spawn(game, "Master of the Hunt");
    lands(game, "Forest", 8);
    activate(game, named(game, "Master of the Hunt")[0], 0);
    activate(game, named(game, "Master of the Hunt")[0], 0);
    // Two identical tokens: one stack, which a band entry wakes into both.
    const wolves = named(game, "Wolves of the Hunt");
    expect(tokensNamed(game, "Wolves of the Hunt")).toBe(2);
    expect(keywords(game, wolves[0]).has("bands-with-other")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    // Past their summoning sickness: alice's next turn.
    nextTurn(game);
    nextTurn(game);
    toAttackers(game);
    expect(asBand(game, wolves)).toBeNull();
    expect(asBand(game, [...wolves, bears])).toMatch(/can't attack as a band/);
  });
});

describe("losing bands with other", () => {
  it("Shelkin Brownie takes a creature's 'bands with other' abilities", () => {
    const { game } = table();
    // Rofellos is green: only Thalia has "bands with other" here, so the
    // band rests on her alone.
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    const rofellos = spawn(game, "Rofellos, Llanowar Emissary");
    spawn(game, "Cathedral of Serra");
    const brownie = spawn(game, "Shelkin Brownie");
    expect(keywords(game, thalia).has("bands-with-other")).toBe(true);
    activate(game, brownie, 0, { targets: [ref(thalia)] });
    expect(keywords(game, thalia).has("bands-with-other")).toBe(false);
    toAttackers(game);
    expect(asBand(game, [thalia, rofellos])).toMatch(/can't attack as a band/);
  });

  it("Tolaria, during an upkeep, takes banding with them", () => {
    const { game } = table();
    const hero = spawn(game, "Benalish Hero", B);
    const tolaria = spawn(game, "Tolaria");
    const use = { type: "activate-ability", player: A, source: tolaria, abilityIndex: 1, targets: [ref(hero)] } as const;
    expect(game.canDispatch(use)).not.toBeNull();
    toStep(game, "upkeep", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.priority.holder === A);
    activate(game, tolaria, 1, { targets: [ref(hero)] });
    expect(keywords(game, hero).has("banding")).toBe(false);
  });
});

describe("creatures banded with it", () => {
  it("Icatian Skirmishers gives its band first strike as it attacks", () => {
    const { game, a } = table();
    const skirmishers = spawn(game, "Icatian Skirmishers");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: skirmishers, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
      { attacker: giant, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, giant).has("first-strike")).toBe(false);
  });

  it("Urza's Engine gives attacking creatures banded with it trample", () => {
    const { game, a } = table();
    const engine = spawn(game, "Urza's Engine");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 6);
    activate(game, engine, 0);
    expect(keywords(game, engine).has("banding")).toBe(true);
    a.declareAttackersFn = () => [
      { attacker: engine, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
      { attacker: giant, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    activate(game, engine, 1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, giant).has("trample")).toBe(false);
  });
});

describe("the rest of the family", () => {
  it("Camel, attacking, prevents a Desert's damage to itself and its band", () => {
    const { game, a } = table();
    const camel = spawn(game, "Camel");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const desert = spawn(game, "Abraded Bluffs", B);
    a.declareAttackersFn = () => [
      { attacker: camel, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
      { attacker: giant, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    for (const id of [camel, bears, giant]) {
      game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(id)], { source: desert });
    }
    expect(game.state.objects[camel].damageMarked).toBe(0);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("Dire Wolves have banding while you control a Plains", () => {
    const { game } = table();
    const wolves = spawn(game, "Dire Wolves");
    expect(keywords(game, wolves).has("banding")).toBe(false);
    spawn(game, "Plains");
    expect(keywords(game, wolves).has("banding")).toBe(true);
  });

  it("Fortified Area gives your Walls +1/+0 and banding", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Junk");
    const opposing = spawn(game, "Wall of Junk", B);
    spawn(game, "Fortified Area");
    expect(keywords(game, wall).has("banding")).toBe(true);
    expect(pt(game, wall).power).toBe(1);
    expect(keywords(game, opposing).has("banding")).toBe(false);
  });

  it("Errand of Duty makes a 1/1 Knight with banding", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Errand of Duty"));
    const [knight] = named(game, "Knight Token (banding)");
    expect(keywords(game, knight).has("banding")).toBe(true);
  });

  it("Urza's Avenger gets -1/-1 and the keyword chosen", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Urza's Avenger");
    pickModes(a, 0);
    activate(game, avenger, 0);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, avenger).has("banding")).toBe(true);
  });

  it("Nature's Blessing's keyword lasts past the turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Nature's Blessing");
    lands(game, "Savannah", 2);
    toHand(game, "Wastes");
    pickModes(a, 1);
    activate(game, named(game, "Nature's Blessing")[0], 0, { targets: [ref(bears)] });
    nextTurn(game);
    expect(keywords(game, bears).has("banding")).toBe(true);
  });

  it("Mishra's War Machine deals 3 to you and taps when you don't discard", () => {
    const { game } = table();
    const machine = spawn(game, "Mishra's War Machine");
    // Each upkeep alice has a card to discard; she declines.
    nextTurn(game);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.turn.step === "draw");
    expect(life(game, A)).toBe(17);
    expect(game.state.objects[machine].tapped).toBe(true);
  });
});
