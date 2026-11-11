import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { validateCommanderDeck } from "../deck-validation.js";
import { SAMPLE_DECKS, STRONG_DECKS, UPGRADED_DECKS } from "../sample-decks.js";

const reg = createDefaultRegistry();

describe("SAMPLE_DECKS", () => {
  for (const deck of SAMPLE_DECKS) {
    describe(deck.name, () => {
      it("is a legal 100-card Commander deck of implemented cards", () => {
        expect(deck.commanders).toHaveLength(1);
        // validateCommanderDeck only checks cards it knows, so an
        // unimplemented name has to be caught here.
        const unimplemented = [...deck.commanders!, ...deck.cards].filter((n) => !reg.has(n));
        expect(unimplemented).toEqual([]);

        const result = validateCommanderDeck(
          { commanders: deck.commanders!, cards: deck.cards, size: 100 },
          reg,
        );
        expect(result.violations).toEqual([]);
        expect(result.legal).toBe(true);
      });

      it("substitutes only cards the engine still doesn't implement", () => {
        // A substitution is a stand-in until its original is authored. Once
        // it is, delete the entry so the deck plays the printed card.
        const nowImplemented = (deck.substitutions ?? [])
          .map((s) => s.original)
          .filter((name) => reg.has(name));
        expect(
          nowImplemented,
          "implemented now — delete these entries from its substitutions table",
        ).toEqual([]);
      });

      it("plays the printed list with exactly its substitutions swapped in", () => {
        const printed = deck.printed ?? [];
        expect(printed).toHaveLength(99);
        const swap = new Map((deck.substitutions ?? []).map((s) => [s.original, s.substitute]));
        expect(deck.cards).toEqual(printed.map((n) => swap.get(n) ?? n));
        // Two entries for the same original, or a substitute that's also a
        // printed card, would break singleton in a way the table hides.
        expect(swap.size).toBe((deck.substitutions ?? []).length);
        for (const s of deck.substitutions ?? []) {
          expect(printed, `${s.substitute} is already in the printed list`).not.toContain(s.substitute);
        }
      });
    });
  }
});

describe("UPGRADED_DECKS", () => {
  it("upgrades each starter precon once", () => {
    expect(UPGRADED_DECKS.map((d) => d.upgradeOf)).toEqual(SAMPLE_DECKS.map((d) => d.name));
    expect(new Set(UPGRADED_DECKS.map((d) => d.name)).size).toBe(UPGRADED_DECKS.length);
  });

  for (const deck of UPGRADED_DECKS) {
    describe(deck.name, () => {
      it("is a legal 100-card Commander deck of implemented cards", () => {
        const unimplemented = [...deck.commanders!, ...deck.cards].filter((n) => !reg.has(n));
        expect(unimplemented).toEqual([]);
        const result = validateCommanderDeck({ commanders: deck.commanders!, cards: deck.cards, size: 100 }, reg);
        expect(result.violations).toEqual([]);
        expect(result.legal).toBe(true);
      });

      it("swaps land for land and spell for spell, so the land count holds", () => {
        const base = SAMPLE_DECKS.find((d) => d.name === deck.upgradeOf)!;
        const isLand = (n: string) => reg.get(n).types.includes("land");
        for (const [cut, add] of deck.swaps ?? []) {
          expect(isLand(add), `${cut} -> ${add}`).toBe(isLand(cut));
        }
        expect(deck.cards.filter(isLand)).toHaveLength(base.cards.filter(isLand).length);
        expect(deck.commanders).toEqual(base.commanders);
      });
    });
  }
});

describe("STRONG_DECKS", () => {
  it("has a name of its own for every deck, none a starter deck's", () => {
    const names = [...SAMPLE_DECKS, ...UPGRADED_DECKS, ...STRONG_DECKS].map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const deck of STRONG_DECKS) {
    describe(deck.name, () => {
      it("is a legal 100-card Commander deck of implemented cards", () => {
        expect(deck.commanders).toHaveLength(1);
        const unimplemented = [...deck.commanders!, ...deck.cards].filter((n) => !reg.has(n));
        expect(unimplemented).toEqual([]);
        const result = validateCommanderDeck({ commanders: deck.commanders!, cards: deck.cards, size: 100 }, reg);
        expect(result.violations).toEqual([]);
        expect(result.legal).toBe(true);
      });

      it("credits its creator, with the deck's Archidekt page", () => {
        expect(deck.credit?.author).toBeTruthy();
        expect(deck.credit?.archidektId).toBeGreaterThan(0);
        expect(deck.name).toContain(`by ${deck.credit?.author}`);
      });

      it("plays its creator's list exactly: no stand-ins", () => {
        expect(deck.printed).toHaveLength(99);
        expect(deck.substitutions).toEqual([]);
        expect(deck.cards).toEqual(deck.printed);
      });
    });
  }
});

describe("starter deck printings", () => {
  const SCRYFALL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  it("give every card a precon plays from the real product its printing there, and nothing else one", () => {
    for (const deck of SAMPLE_DECKS) {
      if (deck.printed === undefined) continue;
      const printings = deck.printings ?? {};
      const standIns = new Set((deck.substitutions ?? []).map((s) => s.substitute));
      for (const name of [...(deck.commanders ?? []), ...deck.cards]) {
        if (standIns.has(name)) {
          expect(printings[name], `${deck.name}: stand-in ${name}`).toBeUndefined();
        } else {
          expect(printings[name], `${deck.name}: ${name}`).toMatch(SCRYFALL_ID);
        }
      }
    }
  });

  it("carry into an upgraded deck for the cards it keeps, not the ones it adds", () => {
    for (const deck of UPGRADED_DECKS) {
      const base = SAMPLE_DECKS.find((d) => d.name === deck.upgradeOf);
      for (const [cut, add] of deck.swaps ?? []) {
        expect(deck.printings?.[add], `${deck.name}: ${add}`).toBeUndefined();
        // A basic land cut once is still played: its other copies stay.
        if (!deck.cards.includes(cut)) expect(deck.printings?.[cut], `${deck.name}: ${cut}`).toBeUndefined();
      }
      for (const [name, id] of Object.entries(deck.printings ?? {})) {
        expect(base?.printings?.[name]).toBe(id);
      }
    }
  });
});
