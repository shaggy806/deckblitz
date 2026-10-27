/**
 * Legions (LGN) group B: Duskworker's blocked-regeneration, Gempalm
 * Polluter's and Gempalm Sorcerer's cycle triggers over every player's
 * creatures, Ward Sliver's chosen-colour protection for every Sliver, Magma
 * Sliver's granted Sliver-counting pump, and Tribal Forcemage's
 * chosen-type turn-face-up trigger.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
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
  toHand,
  zone,
} from "./harness.js";

describe("Duskworker", () => {
  it("regenerates when it becomes blocked, surviving a bigger blocker", () => {
    const { game, a, b } = table();
    const dusk = spawn(game, "Duskworker");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: dusk }];
    attack(game, a, [dusk]);
    expect(zone(game, dusk)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Gempalm Polluter", () => {
  it("cycled, has target player lose life per Zombie on the battlefield, each player's", () => {
    const { game, a } = table();
    spawn(game, "Walking Corpse");
    spawn(game, "Walking Corpse", B);
    spawn(game, "Walking Corpse", B);
    lands(game, "Swamp", 2);
    const card = toHand(game, "Gempalm Polluter");
    pickTargets(a, B);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Gempalm Sorcerer", () => {
  it("cycled, gives every Wizard creature flying and nothing else", () => {
    const { game } = table();
    const wizard = spawn(game, "Voidmage Apprentice", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Gempalm Sorcerer") });
    settle(game);
    expect(keywords(game, wizard).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Ward Sliver", () => {
  it("gives every Sliver, an opponent's too, protection from the chosen colour only", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    a.chooseCreatureTypeFn = () => "R";
    cast(game, toHand(game, "Ward Sliver"));
    const theirs = spawn(game, "Plated Sliver", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const at = (id: string): Action => ({ type: "cast-spell", player: A, card: bolt, targets: [ref(id as never)] });
    expect(game.canDispatch(at(theirs))).not.toBeNull();
    expect(game.canDispatch(at(bears))).toBeNull();
  });
});

describe("Magma Sliver", () => {
  it("grants every Sliver a tap: +X/+0, X counting each player's Slivers", () => {
    const { game } = table();
    spawn(game, "Magma Sliver");
    const plated = spawn(game, "Plated Sliver");
    spawn(game, "Plated Sliver", B);
    expect(pt(game, plated)).toEqual({ power: 1, toughness: 3 });
    activate(game, plated, 0, { targets: [ref(plated)] });
    expect(pt(game, plated)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Tribal Forcemage", () => {
  it("turned face up, pumps and grants trample to the chosen type, an opponent's creatures too", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    const mage = toHand(game, "Tribal Forcemage");
    cast(game, mage, { via: "face-down" });
    a.chooseCreatureTypeFn = () => "Bear";
    game.dispatch({ type: "turn-face-up", player: A, permanent: mage, morph: true } as Action);
    settle(game);
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, theirs).has("trample")).toBe(true);
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
  });
});
