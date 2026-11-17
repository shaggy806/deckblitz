/**
 * "As long as this creature is enchanted by exactly one Aura, it has base
 * power and toughness 3/3. … exactly two Auras, … 5/5 and vigilance. … three
 * or more Auras, … 10/10, vigilance, and trample." (Timber Paladin): a
 * `source` condition counting the Auras attached to it — the `attachments`
 * filter's `atLeast` and `atMost`. Each static has the Paladin's timestamp
 * (rule 613.7a), so a P/T-setting effect that starts later wins (its ruling).
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, cast, keywords, lands, pt, ref, registryOf, spawn, table, toHand } from "./harness.js";

/** Casts a Pacifism on `creature`, returning it. */
function pacify(game: Game, creature: ObjectId): ObjectId {
  lands(game, "Plains", 2);
  const aura = toHand(game, "Pacifism");
  cast(game, aura, { targets: [ref(creature)] });
  expect(game.state.objects[aura].attachedTo).toBe(creature);
  return aura;
}

describe("Timber Paladin", () => {
  it("is 3/3 with one Aura, 5/5 with vigilance with exactly two, 10/10 with vigilance and trample with three", () => {
    const { game } = table();
    const paladin = spawn(game, "Timber Paladin");
    expect(pt(game, paladin)).toEqual({ power: 1, toughness: 1 });
    pacify(game, paladin);
    expect(pt(game, paladin)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, paladin)).not.toContain("vigilance");
    const exactlyOne = { attachments: { filter: { subtype: "Aura" }, atLeast: 1, atMost: 1 } } as const;
    expect(matchesFilter(game.state, registryOf(game), paladin, exactlyOne, { you: A })).toBe(true);
    const second = pacify(game, paladin);
    // "Exactly one" no longer holds: its 3/3 isn't applied under the 5/5.
    expect(matchesFilter(game.state, registryOf(game), paladin, exactlyOne, { you: A })).toBe(false);
    expect(pt(game, paladin)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, paladin)).toContain("vigilance");
    expect(keywords(game, paladin)).not.toContain("trample");
    pacify(game, paladin);
    expect(pt(game, paladin)).toEqual({ power: 10, toughness: 10 });
    expect([...keywords(game, paladin)]).toEqual(expect.arrayContaining(["vigilance", "trample"]));
    const fourth = pacify(game, paladin);
    expect(pt(game, paladin)).toEqual({ power: 10, toughness: 10 });
    // Down to exactly two again.
    game.debugMove(second, "graveyard");
    game.debugMove(fourth, "graveyard");
    expect(pt(game, paladin)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, paladin)).not.toContain("trample");
  });

  it("counts Auras only: an Equipment attached isn't one", () => {
    const { game } = table();
    const paladin = spawn(game, "Timber Paladin");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Plains", 1);
    activate(game, splitter, 0, { targets: [ref(paladin)] });
    expect(game.state.objects[splitter].attachedTo).toBe(paladin);
    expect(pt(game, paladin)).toEqual({ power: 3, toughness: 1 });
  });

  it("a base P/T Aura that starts applying later overwrites it, though it's the Aura that counts (the ruling)", () => {
    const { game } = table();
    const paladin = spawn(game, "Timber Paladin");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Illusory Wrappings"), { targets: [ref(paladin)] });
    expect(pt(game, paladin)).toEqual({ power: 0, toughness: 2 });
    pacify(game, paladin);
    expect(pt(game, paladin)).toEqual({ power: 0, toughness: 2 });
    expect(keywords(game, paladin)).toContain("vigilance");
  });
});
