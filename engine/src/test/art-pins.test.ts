/**
 * Art pins. A token always pins its printing: it's named for the engine's key
 * ("Wizard Token (Kuja)"), which Scryfall doesn't know, so an unpinned token
 * draws as a text panel (a bug report, 2026-10-18: Kuja's Wizards had no art).
 * `npm run token:art -w engine -- --write` finds and pins them.
 *
 * Art for a card whose name is also another card's second face. The client
 * asks Scryfall for an unpinned card's image by name, and Scryfall answers a
 * name that is also a preparation card's prepare spell or an adventurer's
 * Adventure with *that* card — Rampant Growth came back as Studious
 * First-Year, Lightning Bolt as Emeritus of Conflict (2026-10-11). Such a
 * card pins its own printing (`CardDefinition.art`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { POOL_CARDS, TOKEN_CARDS } from "../cards/generated.js";

const SNAPSHOT = fileURLToPath(new URL("../../data/oracle/cards.jsonl", import.meta.url));

describe("art pins", () => {
  it("every pool card named like another card's prepare spell or Adventure pins its own art", () => {
    const shadowed = new Set<string>();
    for (const line of readFileSync(SNAPSHOT, "utf8").split("\n")) {
      if (line.trim() === "") continue;
      const card = JSON.parse(line) as { layout?: string; faces?: readonly { name: string }[] };
      if (card.layout !== "prepare" && card.layout !== "adventure") continue;
      for (const face of card.faces?.slice(1) ?? []) shadowed.add(face.name);
    }
    const unpinned = POOL_CARDS.filter(
      (def) => !def.prepareSpellOnly && def.art === null && shadowed.has(def.name) && def.faces === null,
    ).map((def) => def.name);
    expect(unpinned).toEqual([]);
  });
});

// Tokens Scryfall has no printing of (checked 2026-10-18, a token search by
// name): nothing to pin, so they draw as a text panel.
const NO_TOKEN_PRINTING = new Set([
  // Mongrel Pack (TMP)'s 1/1 green Dogs were never printed as a token.
  "1/1 Green Dog Token",
  "Banana Token",
  // Goblin Scouts (MIR) never had a token printing.
  "Goblin Scout Token",
  // Carrion (MIR)'s 0/1 black Insects were never printed as a token.
  "Insect Token (Black, 0/1)",
  "Jellyfish Token",
  // Spike Breeder (STH)'s 1/1 green Spikes were never printed as a token.
  "Spike Token",
  // Spirit Mirror (TMP)'s 2/2 white Reflections were never printed as a token.
  "Reflection Token (White, 2/2)",
  "Jumblebones",
  "Nymph Token",
  // Diamond Kaleidoscope (VIS)'s 0/1 Prisms were never printed as a token.
  "Prism Token",
  // The only Robot Hero printing is a 2/1 flier.
  "1/1 Robot Hero Token",
  // The only Spawn printings are 3/3 red.
  "Spawn Token (Spawning Pit)",
  // Daring Piracy (J22) and Lita, Mechanical Engineer's tokens were never
  // printed: the only red 1/1 Pirates can't block, and no Zeppelin token
  // exists (checked 2026-10-19).
  "Pirate Token (Daring Piracy)",
  "Zeppelin",
  // Bottle of Suleiman lists no token printing (the Oracle snapshot, 2026-10-21).
  "5/5 Djinn Artifact Token",
  // Serpent Generator lists none either.
  "Snake Token (artifact, poison)",
  // Boris Devilboon lists none.
  "Minor Demon Token",
  // Phelddagrif's 1/1 Hippo and Phantasmal Sphere's X/X Orb list none (the Oracle snapshot, 2026-10-25).
  "1/1 Green Hippo Token",
  "Orb Token",
  // Broken Visage lists none (the Oracle snapshot, 2026-10-25).
  "X/X Spirit Token (Black)",
  // Wall of Kelp lists none.
  "Kelp Token",
  // Jungle Patrol's Wood lists none.
  "Wood Token",
  "Camarid Token",
  "Caribou Token",
]);

describe("token art", () => {
  it("every token pins a printing, unless Scryfall has none", () => {
    const unpinned = TOKEN_CARDS.filter((def) => def.art === null && !NO_TOKEN_PRINTING.has(def.name)).map(
      (def) => def.name,
    );
    expect(unpinned).toEqual([]);
  });

  it("the no-printing list names only tokens that exist and are still unpinned", () => {
    const byName = new Map(TOKEN_CARDS.map((def) => [def.name, def]));
    for (const name of NO_TOKEN_PRINTING) expect(byName.get(name)?.art, name).toBeNull();
  });
});
