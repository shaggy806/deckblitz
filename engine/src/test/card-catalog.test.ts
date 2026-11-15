/**
 * The card catalog (`cards/catalog.ts`) against the whole pool: what the
 * library and the deck builder read off a catalog card must be what they'd
 * read off the definition. Every kept field is compared, and every deck rule
 * those pages call is asked on both.
 */
import { describe, expect, it } from "vitest";
import {
  CardRegistry,
  POOL_CARDS,
  TOKEN_CARDS,
  CARD_CATALOG_CHUNKS,
  buildCardCatalog,
  isCardFront,
  isCatalogCard,
  isDeckableCard,
  isTokenCard,
  readCatalogChunk,
  tokensCreatedBy,
  tokensMadeBy,
} from "../cards.js";
import type { CardDefinition } from "../cards.js";
import { companionProblem } from "../companion.js";
import {
  attractionDeckProblems,
  canCommandAlone,
  canPairCommanders,
  fitsDeckIdentity,
  hasPartner,
  rulebreakersOf,
  validateCommanderDeck,
} from "../deck-validation.js";
import { colorIdentityOf, identityString } from "../identity.js";
import { STARTER_DECKS } from "../sample-decks.js";

const json = (value: unknown): string | undefined =>
  JSON.stringify(value, (_key, inner: unknown) => (typeof inner === "function" ? undefined : inner));

const chunks = buildCardCatalog(POOL_CARDS, TOKEN_CARDS);
// Through JSON, as a page gets them.
const read = chunks.map((chunk) => readCatalogChunk(JSON.parse(JSON.stringify(chunk)) as typeof chunk));
const catalog = new Map<string, CardDefinition>();
for (const piece of read) for (const def of [...piece.pool, ...piece.tokens]) catalog.set(def.name, def);
const whole = [...POOL_CARDS, ...TOKEN_CARDS];

const registryOf = (defs: Iterable<CardDefinition>): CardRegistry => {
  const registry = new CardRegistry();
  for (const def of defs) registry.register(def);
  return registry;
};
const full = registryOf(whole);
const slim = registryOf(catalog.values());

describe("the card catalog", () => {
  it("holds every card and token once, in its chunks", () => {
    expect(chunks).toHaveLength(CARD_CATALOG_CHUNKS);
    expect(read.reduce((n, piece) => n + piece.pool.length, 0)).toBe(POOL_CARDS.length);
    expect(read.reduce((n, piece) => n + piece.tokens.length, 0)).toBe(TOKEN_CARDS.length);
    expect(catalog.size).toBe(whole.length);
    const sizes = chunks.map((chunk) => chunk.pool.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it("is a fraction of the definitions' size", () => {
    const bytes = chunks.reduce((n, chunk) => n + JSON.stringify(chunk).length, 0);
    // About 350 bytes a card, most of it the card's own text: the effect
    // trees it cuts are several times that.
    expect(bytes / whole.length).toBeLessThan(450);
  });

  it("keeps every field but the ones it cuts, as it was", () => {
    const changed: string[] = [];
    for (const def of whole) {
      const card = catalog.get(def.name) as unknown as Record<string, unknown>;
      // Either's fields: a rare field the definition doesn't have mustn't
      // turn up on its catalog card (every card was once an Attraction).
      const fields = def as unknown as Record<string, unknown>;
      for (const key of new Set([...Object.keys(def), ...Object.keys(card)])) {
        if (key === "effect" || key === "activated" || key === "triggered" || key === "static") continue;
        if (json(fields[key]) !== json(card[key])) changed.push(`${def.name}.${key}`);
      }
    }
    expect(changed).toEqual([]);
  });

  it("keeps each ability's text, an activated ability's mana and what a static says of itself off the battlefield", () => {
    const changed: string[] = [];
    for (const def of whole) {
      const card = catalog.get(def.name)!;
      const same =
        json(def.activated.map((a) => [a.text, a.cost.mana ?? null])) === json(card.activated.map((a) => [a.text, a.cost.mana ?? null])) &&
        json(def.triggered.map((a) => a.text)) === json(card.triggered.map((a) => a.text)) &&
        json(def.static.map((a) => [a.text, a.selfOutsideBattlefield])) === json(card.static.map((a) => [a.text, a.selfOutsideBattlefield]));
      if (!same) changed.push(def.name);
    }
    expect(changed).toEqual([]);
  });

  it("knows the tokens each card makes, which its effects would have said", () => {
    const wrong = whole.filter((def) => json(tokensMadeBy(catalog.get(def.name)!)) !== json(tokensCreatedBy(def)));
    expect(wrong.map((def) => def.name)).toEqual([]);
    expect(whole.some((def) => tokensCreatedBy(def).length > 0)).toBe(true);
    expect(isCatalogCard(catalog.get(whole[0].name)!)).toBe(true);
    expect(isCatalogCard(whole[0])).toBe(false);
  });

  it("answers what a card is, and its colour identity, as the definition does", () => {
    const wrong: string[] = [];
    for (const def of whole) {
      const card = catalog.get(def.name)!;
      const asked = (c: CardDefinition, registry: CardRegistry) =>
        [
          isTokenCard(c),
          isCardFront(c),
          isDeckableCard(c),
          canCommandAlone(c),
          hasPartner(registry, c.name),
          identityString(colorIdentityOf(c, registry)),
          json(rulebreakersOf([c.name], registry)),
        ].join("|");
      if (asked(def, full) !== asked(card, slim)) wrong.push(def.name);
    }
    expect(wrong).toEqual([]);
  });

  it("pairs commanders as the definitions do", () => {
    const partners = POOL_CARDS.filter((def) => def.pairing !== null || def.subtypes.includes("Background")).map((def) => def.name);
    expect(partners.length).toBeGreaterThan(50);
    let pairs = 0;
    const wrong: string[] = [];
    for (const a of partners) {
      for (const b of partners) {
        if (a === b) continue;
        const legal = canPairCommanders(full, a, b);
        if (legal) pairs += 1;
        if (legal !== canPairCommanders(slim, a, b)) wrong.push(`${a} + ${b}`);
      }
    }
    expect(wrong).toEqual([]);
    expect(pairs).toBeGreaterThan(0);
  });

  it("validates decks, companions and Attraction decks as the definitions do", () => {
    const companions = POOL_CARDS.filter((def) => def.companion !== null).map((def) => def.name);
    expect(companions.length).toBeGreaterThan(5);
    const attractions = POOL_CARDS.filter((def) => def.attractionLights !== undefined && def.attractionLights !== null).map((def) => def.name);
    for (const deck of STARTER_DECKS) {
      const list = { cards: deck.cards, commanders: deck.commanders ?? [] };
      expect(json(validateCommanderDeck({ ...list, size: 100 }, slim)), deck.name).toBe(
        json(validateCommanderDeck({ ...list, size: 100 }, full)),
      );
      for (const name of companions) {
        expect(companionProblem(name, list, slim), `${name} with ${deck.name}`).toBe(companionProblem(name, list, full));
      }
      const commanders = list.commanders.filter((name) => full.has(name));
      const identity = new Set(commanders.flatMap((name) => [...colorIdentityOf(full.get(name), full)]));
      const breakers = rulebreakersOf(commanders, full);
      for (const name of deck.cards.slice(0, 40)) {
        if (!full.has(name)) continue;
        expect(fitsDeckIdentity(slim.get(name), identity, rulebreakersOf(commanders, slim), slim), name).toBe(
          fitsDeckIdentity(full.get(name), identity, breakers, full),
        );
      }
    }
    expect(json(attractionDeckProblems(attractions, slim))).toBe(json(attractionDeckProblems(attractions, full)));
    expect(json(attractionDeckProblems(attractions.slice(0, 3), slim))).toBe(json(attractionDeckProblems(attractions.slice(0, 3), full)));
  });
});
