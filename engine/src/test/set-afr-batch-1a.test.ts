/**
 * Adventures in the Forgotten Realms and its Commander set, group a: Cave of the Frost Dragon,
 * Eccentric Apprentice, Reaper's Talisman, Fifty Feet of Rope, Minsc, Beloved Ranger, Bull's
 * Strength, Ranger's Hawk and Gloom Stalker.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toStep,
  types,
} from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

/** Enter Lost Mine of Phandelver whenever asked, and take the first room at a fork. */
const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

describe("Cave of the Frost Dragon", () => {
  it("becomes a 3/4 white Dragon creature with flying until end of turn, still a land", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const cave = spawn(game, "Cave of the Frost Dragon");
    activate(game, cave, 1);
    expect(pt(game, cave)).toEqual({ power: 3, toughness: 4 });
    expect(types(game, cave)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, cave)).toContain("Dragon");
    expect(keywords(game, cave).has("flying")).toBe(true);
    toStep(game, "upkeep", B);
    expect(types(game, cave)).not.toContain("creature");
  });
});

describe("Eccentric Apprentice", () => {
  it("ventures as it enters; at combat, only after a completed dungeon, makes a 1/1 flying Bird", () => {
    const { game, a } = table();
    intoLostMine(a);
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Eccentric Apprentice");
    expect(ventures(game)).toBe(1);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    // No dungeon completed: the intervening "if" keeps it from triggering.
    expect(subtypes(game, bears)).toEqual(["Bear"]);
    toStep(game, "precombat-main", B);
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver"];
    game.state.objects[bears].counters["+1/+1"] = 1;
    toStep(game, "begin-combat");
    settle(game);
    // Base 1/1, its +1/+1 counter still applies; a Bird and nothing else; flying.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, bears)).toEqual(["Bird"]);
    expect(keywords(game, bears).has("flying")).toBe(true);
    toStep(game, "upkeep", B);
    expect(subtypes(game, bears)).toEqual(["Bear"]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Reaper's Talisman", () => {
  const equipped = (game: Game): { talisman: ObjectId; bears: ObjectId } => {
    lands(game, "Swamp", 2);
    const talisman = spawn(game, "Reaper's Talisman");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, talisman, 0, { targets: [ref(bears)] });
    expect(game.state.objects[talisman].attachedTo).toBe(bears);
    return { talisman, bears };
  };

  it("attacking alone: deathtouch, and the defending player loses 2 life as you gain 2", () => {
    const { game, a } = table();
    const { bears } = equipped(game);
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(life(game, B)).toBe(20 - 2 - 2);
    expect(life(game, A)).toBe(22);
  });

  it("attacking beside another creature: deathtouch only", () => {
    const { game, a } = table();
    const { bears } = equipped(game);
    const elves = spawn(game, "Llanowar Elves");
    attack(game, a, [bears, elves]);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, elves).has("deathtouch")).toBe(false);
    expect(life(game, B)).toBe(20 - 2 - 1);
    expect(life(game, A)).toBe(20);
  });
});

describe("Fifty Feet of Rope", () => {
  it("Climb Over targets only a Wall; Rappel Down ventures", () => {
    const { game, a } = table();
    intoLostMine(a);
    const rope = spawn(game, "Fifty Feet of Rope");
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Angelic Wall", B);
    expect(() => activate(game, rope, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, rope, 0, { targets: [ref(wall)] });
    expect(game.state.objects[rope].tapped).toBe(true);
    game.state.objects[rope].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, rope, 2);
    expect(ventures(game)).toBe(1);
  });
});

describe("Minsc, Beloved Ranger", () => {
  it("creates Boo, then {X} makes a creature you control a base X/X Giant until end of turn", () => {
    const { game } = table();
    const minsc = enter(game, "Minsc, Beloved Ranger");
    const [boo] = named(game, "Boo", A);
    expect(boo).toBeDefined();
    expect(supertypes(game, boo)).toContain("legendary");
    expect(subtypes(game, boo)).toEqual(["Hamster"]);
    expect(keywords(game, boo).has("trample")).toBe(true);
    expect(keywords(game, boo).has("haste")).toBe(true);
    lands(game, "Wastes", 4);
    toStep(game, "postcombat-main");
    activate(game, minsc, 0, { targets: [ref(boo)], x: 4 });
    expect(pt(game, boo)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, boo)).toEqual(expect.arrayContaining(["Hamster", "Giant"]));
    toStep(game, "upkeep", B);
    expect(pt(game, boo)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, boo)).toEqual(["Hamster"]);
  });
});

describe("Bull's Strength", () => {
  it("gives +2/+2 and trample, and untaps the creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Bull's Strength"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Ranger's Hawk", () => {
  it("taps another untapped creature you control as a cost, then ventures", () => {
    const { game, a } = table();
    intoLostMine(a);
    lands(game, "Wastes", 3);
    const hawk = spawn(game, "Ranger's Hawk");
    const bears = spawn(game, "Grizzly Bears");
    const alone: Action = { type: "activate-ability", player: A, source: hawk, abilityIndex: 0, targets: [], tap: [hawk] };
    expect(game.canDispatch(alone)).not.toBeNull();
    const action: Action = { type: "activate-ability", player: A, source: hawk, abilityIndex: 0, targets: [], tap: [bears] };
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    expect(game.state.objects[hawk].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(ventures(game)).toBe(1);
  });
});

describe("Gloom Stalker", () => {
  it("has double strike only once you've completed a dungeon", () => {
    const { game } = table();
    const stalker = spawn(game, "Gloom Stalker");
    expect(keywords(game, stalker).has("double-strike")).toBe(false);
    game.state.players[A].completedDungeons = ["Tomb of Annihilation"];
    expect(keywords(game, stalker).has("double-strike")).toBe(true);
  });
});
