/**
 * Casting abilities granted to the spells you cast (the
 * `static:grant-abilities-to-spells` family): a `grantsToSpells` static's
 * `convoke` (Chief Engineer — rule 702.51), `improvise` (Inspiring Statuary
 * — 702.126; with a printed convoke, both in one payment) and `prowl`
 * (Hunting Velociraptor — 702.76), and an impulse permission's `undaunted`
 * (Durnan of the Yawning Portal — 702.125).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  attack,
  cast,
  lands,
  nextTurn,
  pickFromZone,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const castsOf = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

const tapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => game.state.objects[id].tapped).length;

describe("Chief Engineer", () => {
  it("gives artifact spells convoke, and nothing else", () => {
    const { game } = table();
    spawn(game, "Chief Engineer");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const stone = toHand(game, "Mind Stone");
    const divination = toHand(game, "Divination");
    const [offer] = castsOf(game, stone);
    expect(offer?.convoke?.candidates).toEqual(expect.arrayContaining(bears));
    expect(castsOf(game, divination)).toEqual([]);
    cast(game, stone, { convoke: bears.map((creature) => ({ creature })) });
    expect(zone(game, stone)).toBe("battlefield");
    expect(tapped(game, bears)).toBe(2);
  });

  it("is gone once Chief Engineer leaves", () => {
    const { game } = table();
    const engineer = spawn(game, "Chief Engineer");
    spawn(game, "Grizzly Bears");
    const stone = toHand(game, "Mind Stone");
    game.debugMove(engineer, "graveyard");
    expect(castsOf(game, stone)).toEqual([]);
  });
});

describe("Inspiring Statuary", () => {
  it("gives nonartifact spells improvise: artifacts pay generic mana only", () => {
    const { game } = table();
    const statuary = spawn(game, "Inspiring Statuary");
    const stones = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    const [offer] = castsOf(game, divination);
    expect(offer?.convoke?.improvise).toBe(true);
    expect(offer?.convoke?.candidates).toEqual(expect.arrayContaining([statuary, ...stones]));
    cast(game, divination, { convoke: stones.map((creature) => ({ creature })) });
    expect(zone(game, divination)).toBe("graveyard");
    // An artifact spell doesn't get it.
    const stone = toHand(game, "Mind Stone");
    expect(castsOf(game, stone)).toEqual([]);
  });

  it("goes with a printed convoke: creatures convoke, artifacts improvise, in one payment", () => {
    const { game } = table();
    spawn(game, "Inspiring Statuary");
    const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves")];
    const thopters = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    lands(game, "Wastes", 2);
    const wurm = toHand(game, "Siege Wurm");
    const [offer] = castsOf(game, wurm);
    expect(offer?.convoke?.alsoImprovise).toBe(true);
    // {5}{G}{G}: two green Elves for the green, the thopters (artifact
    // creatures, colourless) and two Wastes for the rest.
    cast(game, wurm, { convoke: [...elves, ...thopters].map((creature) => ({ creature })) });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(tapped(game, [...elves, ...thopters])).toBe(5);
  });

  it("never lets an artifact that isn't a creature pay a coloured pip", () => {
    const { game } = table();
    const statuary = spawn(game, "Inspiring Statuary");
    const stone = spawn(game, "Mind Stone");
    lands(game, "Wastes", 5);
    const wurm = toHand(game, "Siege Wurm");
    // Two Elves are missing: the {G}{G} can't be paid by the artifacts.
    expect(() =>
      cast(game, wurm, { convoke: [statuary, stone].map((creature) => ({ creature, pays: "G" as const })) }),
    ).toThrow();
  });
});

describe("Hunting Velociraptor", () => {
  it("gives Dinosaur spells prowl {2}{R} once a Dinosaur of yours dealt combat damage to a player", () => {
    const { game, a } = table();
    const raptor = spawn(game, "Hunting Velociraptor");
    lands(game, "Mountain", 3);
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    expect(castsOf(game, dreadmaw).some((x) => x.altCost === true)).toBe(false);
    attack(game, a, [raptor]);
    settle(game);
    const prowl = castsOf(game, dreadmaw).find((x) => x.altCost === true);
    expect(prowl).toBeDefined();
    cast(game, dreadmaw, { altCost: true, settle: false });
    expect(game.state.objects[dreadmaw].prowlPaid).toBe(true);
    settle(game);
    expect(zone(game, dreadmaw)).toBe("battlefield");
  });

  it("doesn't give prowl to a spell that isn't a Dinosaur", () => {
    const { game, a } = table();
    const raptor = spawn(game, "Hunting Velociraptor");
    lands(game, "Mountain", 3);
    const wurm = toHand(game, "Siege Wurm");
    attack(game, a, [raptor]);
    settle(game);
    expect(castsOf(game, wurm).some((x) => x.altCost === true)).toBe(false);
  });
});

describe("Durnan of the Yawning Portal", () => {
  it("exiles a creature card from the top four, castable while it stays exiled, with undaunted", () => {
    const { game, a } = table();
    const durnan = spawn(game, "Durnan of the Yawning Portal");
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    pickFromZone(a, dreadmaw);
    attack(game, a, [durnan]);
    settle(game);
    expect(zone(game, dreadmaw)).toBe("exile");
    // A later turn: still castable, {1} less for the one opponent.
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    lands(game, "Forest", 4);
    expect(castsOf(game, dreadmaw).some((x) => x.via === "impulse")).toBe(false);
    lands(game, "Forest", 1);
    cast(game, dreadmaw, { via: "impulse" });
    expect(zone(game, dreadmaw)).toBe("battlefield");
  });
});
