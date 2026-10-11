/**
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

import { POOL_CARDS } from "../cards/generated.js";

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
