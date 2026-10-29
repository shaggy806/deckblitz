/**
 * B251 group E: the repeat process's stop conditions (Rally the Horde's "last
 * card exiled", Primal Surge's "if you do", Sphinx's Tutelage's nonland pair,
 * Scalpelexis's shared name, Sin's land), its counts (Torment of Hailfire,
 * Professor Onyx, Progenitor Exarch), and Tempt with Immortality's "for each
 * opponent who does".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, attack, cast, counters, enter, graveyard, lands, life, loyalty, pickModes, spawn, table, toGraveyard, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Put `names` on top of `player`'s library, the first name on top. */
function stack(game: Game, player: PlayerId, names: readonly string[]): ObjectId[] {
  const ids = [...names].reverse().map((name) => toLibrary(game, name, player));
  return ids.reverse();
}

describe("Rally the Horde", () => {
  it("repeats only while the third card of a process isn't a land, and makes a Warrior per nonland card", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    // Process 1: land, Bears, Bears (last nonland: repeat). Process 2:
    // land, Bears, land (last a land: stop) — the land in the middle doesn't.
    const ids = stack(game, A, ["Wastes", "Grizzly Bears", "Grizzly Bears", "Wastes", "Grizzly Bears", "Wastes", "Grizzly Bears"]);
    const spell = toHand(game, "Rally the Horde");
    cast(game, spell);
    expect(ids.slice(0, 6).map((id) => zone(game, id))).toEqual(Array(6).fill("exile"));
    expect(zone(game, ids[6])).toBe("library");
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(3);
  });
});

describe("Primal Surge", () => {
  it("keeps going while you put the card onto the battlefield, and stops at a nonpermanent card", () => {
    const { game, a } = table();
    lands(game, "Forest", 10);
    const ids = stack(game, A, ["Grizzly Bears", "Hill Giant", "Lightning Bolt", "Grizzly Bears"]);
    const spell = toHand(game, "Primal Surge");
    pickModes(a, 0);
    cast(game, spell);
    expect(ids.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "exile", "library"]);
  });

  it("stops when you decline", () => {
    const { game, a } = table();
    lands(game, "Forest", 10);
    const ids = stack(game, A, ["Grizzly Bears", "Hill Giant"]);
    const spell = toHand(game, "Primal Surge");
    pickModes(a);
    cast(game, spell);
    expect(ids.map((id) => zone(game, id))).toEqual(["exile", "library"]);
  });
});

describe("Sphinx's Tutelage", () => {
  it("repeats while a pass mills two nonland cards sharing a colour", () => {
    const { game, a } = table();
    spawn(game, "Sphinx's Tutelage");
    // Bears+Bears (green: again), Giant+Bears (no shared colour: stop).
    const ids = stack(game, B, ["Grizzly Bears", "Grizzly Bears", "Hill Giant", "Grizzly Bears", "Grizzly Bears"]);
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(ids.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard", "graveyard", "library"]);
  });

  it("two lands don't repeat it", () => {
    const { game, a } = table();
    spawn(game, "Sphinx's Tutelage");
    const before = library(game, B).length;
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(library(game, B).length).toBe(before - 2);
  });
});

describe("Scalpelexis", () => {
  it("repeats while two of a pass's four cards share a name", () => {
    const { game, a } = table();
    const beast = spawn(game, "Scalpelexis");
    const ids = stack(game, B, [
      "Grizzly Bears",
      "Hill Giant",
      "Grizzly Bears",
      "Island",
      "Grizzly Bears",
      "Hill Giant",
      "Mountain",
      "Forest",
      "Lightning Bolt",
    ]);
    attack(game, a, [beast]);
    expect(ids.slice(0, 8).map((id) => zone(game, id))).toEqual(Array(8).fill("exile"));
    expect(zone(game, ids[8])).toBe("library");
  });
});

describe("Sin, Spira's Punishment", () => {
  it("repeats while the card exiled is a land, each copy a tapped token", () => {
    const { game } = table();
    toGraveyard(game, "Forest");
    toGraveyard(game, "Island");
    toGraveyard(game, "Lightning Bolt");
    enter(game, "Sin, Spira's Punishment");
    const tokens = game.battlefield.map((id) => game.state.objects[id]).filter((o) => o.isToken);
    expect(tokens.map((o) => o.cardName).sort()).toEqual(["Forest", "Island"]);
    expect(tokens.every((o) => o.tapped)).toBe(true);
    expect(graveyard(game, A).map((id) => game.state.objects[id].cardName)).toEqual(["Lightning Bolt"]);
  });
});

describe("Torment of Hailfire and Professor Onyx", () => {
  it("Torment repeats the punisher X times", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    pickModes(b);
    const spell = toHand(game, "Torment of Hailfire");
    cast(game, spell, { x: 2 });
    expect(life(game, B)).toBe(14);
  });

  it("Onyx's −8 is seven passes", () => {
    const { game, b } = table({ life: 40 });
    const onyx = spawn(game, "Professor Onyx");
    pickModes(b);
    loyalty(game, onyx, -8, { atLeast: 8 });
    expect(life(game, B)).toBe(19);
  });
});

describe("Progenitor Exarch", () => {
  it("incubates 3 X times", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const exarch = toHand(game, "Progenitor Exarch");
    cast(game, exarch, { x: 2 });
    expect(tokensNamed(game, "Incubator Token", A)).toBe(2);
    const incubators = game.battlefield.filter((id) => game.state.objects[id].cardName === "Incubator Token");
    expect(incubators.every((id) => counters(game, id) === 3)).toBe(true);
  });
});

describe("Tempt with Immortality", () => {
  it("you return one more for each opponent who returned a card, not for one who accepted with none", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 5);
    const mine = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    const giant = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", C);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    b.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    c.chooseFromZoneFn = () => [];
    pickModes(b, 0);
    pickModes(c, 0);
    const spell = toHand(game, "Tempt with Immortality");
    cast(game, spell);
    expect(zone(game, giant)).toBe("battlefield");
    expect(mine.filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
  });
});
