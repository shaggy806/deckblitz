/**
 * "An Aura with enchant creature" (`CardFilter.enchantAbility`, rule 702.5a):
 * the Aura's own enchant ability is exactly "Enchant creature" — not "enchant
 * creature you control" (the Cartouche rulings call that another enchant
 * ability) or "enchant land". Rootwater Shaman's flash permission for those
 * Aura spells, and Tallowisp's search for those Aura cards.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";

import { A, cast, hand, lands, pickFromZone, pickModes, spawn, table, toHand, toLibrary, toStep } from "./harness.js";

/** Whether Alice is offered a cast of `card` now. */
const offered = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Aura with enchant creature", () => {
  it("reads the enchant ability itself, not just being an Aura", () => {
    const { game } = table();
    const filter = { subtype: "Aura", enchantAbility: "creature" } as const;
    const read = (name: string): boolean => matchesFilter(game.state, game.registry, toHand(game, name), filter, { you: A });
    expect(read("Pacifism")).toBe(true);
    expect(read("Cartouche of Strength")).toBe(false);
    expect(read("Wild Growth")).toBe(false);
    expect(read("Grizzly Bears")).toBe(false);
  });

  it("Rootwater Shaman: Aura spells with enchant creature may be cast at instant speed, others not", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Forest", 3);
    spawn(game, "Rootwater Shaman", A);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 1);
    const pacifism = toHand(game, "Pacifism");
    const cartouche = toHand(game, "Cartouche of Strength");
    const growth = toHand(game, "Wild Growth");
    toStep(game, "begin-combat");
    expect(offered(game, pacifism)).toBe(true);
    expect(offered(game, cartouche)).toBe(false);
    expect(offered(game, growth)).toBe(false);
  });

  it("Rootwater Shaman: a bestow creature cast bestowed is an Aura spell with enchant creature (702.103b)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Rootwater Shaman", A);
    spawn(game, "Grizzly Bears", A);
    const rollicker = toHand(game, "Nyxborn Rollicker");
    toStep(game, "begin-combat");
    const casts = game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === rollicker);
    expect(casts.map((a) => (a.kind === "cast-spell" ? a.overloadKeyword ?? "plain" : ""))).toEqual(["bestow"]);
  });

  it("without Rootwater Shaman the Aura waits for the main phase", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears", A);
    const pacifism = toHand(game, "Pacifism");
    toStep(game, "begin-combat");
    expect(offered(game, pacifism)).toBe(false);
  });

  it("Tallowisp: casting a Spirit finds only an Aura card with enchant creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    spawn(game, "Tallowisp", A);
    const pacifism = toLibrary(game, "Pacifism");
    toLibrary(game, "Cartouche of Strength");
    toLibrary(game, "Wild Growth");
    pickModes(a, 0);
    const search = pickFromZone(a, pacifism);
    cast(game, toHand(game, "Kami of Ancient Law"));
    expect(search.offered).toEqual([pacifism]);
    expect(hand(game)).toContain(pacifism);
  });
});
