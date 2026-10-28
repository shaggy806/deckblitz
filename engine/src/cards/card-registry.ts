/**
 * `CardRegistry` — resolves a card name to its printed definition.
 *
 * Its own module, apart from `createDefaultRegistry` (`registry.ts`), because
 * that one imports every card: a web page builds its registry from the card
 * shards it has loaded instead, and must be able to reach the class without
 * the pool (see `client.ts`).
 */

import type { CardDefinition } from "./define.js";

/** The prefix of a merged permanent's combined definition's key (rule 730 —
 * `GameObject.merged`, `state.ts`'s `mergedTextName`): the component names
 * follow, topmost first, each after a {@link MERGED_SEPARATOR}. */
export const MERGED_PREFIX = "\u0001merged\u0001";
/** What separates the component names in a merged key. */
export const MERGED_SEPARATOR = "\u0001";

export class CardRegistry {
  private readonly byName = new Map<string, CardDefinition>();
  /** Combined definitions already built, by key. */
  private readonly merged = new Map<string, CardDefinition>();

  register(def: CardDefinition): this {
    if (this.byName.has(def.name)) {
      throw new Error(`card already registered: ${def.name}`);
    }
    this.byName.set(def.name, def);
    return this;
  }

  has(name: string): boolean {
    if (name.startsWith(MERGED_PREFIX)) return this.mergedParts(name).every((part) => this.byName.has(part));
    return this.byName.has(name);
  }

  get(name: string): CardDefinition {
    if (name.startsWith(MERGED_PREFIX)) return this.mergedDefinition(name);
    const def = this.byName.get(name);
    if (def === undefined) throw new Error(`unknown card: ${name}`);
    return def;
  }

  /** Every definition registered, in registration order. */
  definitions(): IterableIterator<CardDefinition> {
    return this.byName.values();
  }

  get size(): number {
    return this.byName.size;
  }

  private mergedParts(key: string): readonly string[] {
    return key.slice(MERGED_PREFIX.length).split(MERGED_SEPARATOR);
  }

  /**
   * A merged permanent's abilities (rule 702.140e): "all abilities of each
   * card and token that represents it", its other characteristics the
   * topmost's (730.2a). Read only through `rulesTextName`, so only the
   * ability fields matter: the topmost component's definition with every
   * component's keywords, activated, triggered and static abilities, in
   * component order (topmost first, so the topmost card's own indices are
   * unchanged), and their texts one after another. Fields that work only off
   * the battlefield — casting, cycling, a graveyard's — are the topmost's:
   * a merged permanent that leaves comes apart into its cards (730.3).
   */
  private mergedDefinition(key: string): CardDefinition {
    const known = this.merged.get(key);
    if (known !== undefined) return known;
    const parts = this.mergedParts(key).map((part) => this.get(part));
    const [top] = parts;
    if (top === undefined) throw new Error("a merged key with no components");
    const def: CardDefinition = {
      ...top,
      keywords: [...new Set(parts.flatMap((p) => p.keywords))],
      toxic: parts.reduce((n, p) => n + p.toxic, 0),
      activated: parts.flatMap((p) => p.activated),
      triggered: parts.flatMap((p) => p.triggered),
      static: parts.flatMap((p) => p.static),
      revealsOwnLibraryTop: parts.some((p) => p.revealsOwnLibraryTop),
      looksAtOwnLibraryTop: parts.some((p) => p.looksAtOwnLibraryTop),
      text: parts
        .map((p) => p.text)
        .filter((t) => t.length > 0)
        .join("\n"),
    };
    this.merged.set(key, def);
    return def;
  }
}
