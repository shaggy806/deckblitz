/**
 * Protection from mana values (rule 702.16a): a quality no colour or card type
 * names, a filter on the source's own mana value. `protection.manaValuesAmong`
 * — "each mana value among artifacts you control", read as things are now
 * (Rebbec, Architect of Ascension).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, cast, lands, named, ref, spawn, table, toHand } from "./harness.js";

type G = ReturnType<typeof table>["game"];

/** Whether bob, with priority, may cast `card` at `target`. */
const bobCanCast = (game: G, card: ObjectId, target: ObjectId): boolean =>
  game.canDispatch({ type: "cast-spell", player: B, card, targets: [ref(target)] }) === null;

/** Alice passes on her own main phase: bob has priority. */
const toBob = (game: G): void => {
  game.dispatch({ type: "pass-priority", player: A });
  expect(game.state.priority.holder).toBe(B);
};

describe("Rebbec, Architect of Ascension", () => {
  it("artifacts you control have protection from each mana value among them, as it is now", () => {
    const { game } = table();
    spawn(game, "Rebbec, Architect of Ascension");
    const rebbec = named(game, "Rebbec, Architect of Ascension")[0];
    const myr = spawn(game, "Gold Myr");
    const ornithopter = spawn(game, "Ornithopter");
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    toBob(game);
    // Mana values 2 and 0: Lightning Bolt (1) still reaches them.
    expect(bobCanCast(game, bolt, myr)).toBe(true);
    expect(bobCanCast(game, bolt, ornithopter)).toBe(true);
    // A mana value 1 artifact: now they're protected from 1, Sol Ring itself too.
    const ring = spawn(game, "Sol Ring");
    expect(bobCanCast(game, bolt, myr)).toBe(false);
    expect(bobCanCast(game, bolt, ornithopter)).toBe(false);
    // Rebbec isn't an artifact.
    expect(bobCanCast(game, bolt, rebbec)).toBe(true);
    // Sol Ring gone: Lightning Bolt reaches them again.
    game.debugMove(ring, "graveyard");
    expect(bobCanCast(game, bolt, myr)).toBe(true);
  });

  it("only its controller's artifacts count, and only its controller's are protected", () => {
    const { game } = table();
    spawn(game, "Rebbec, Architect of Ascension");
    const myr = spawn(game, "Gold Myr");
    spawn(game, "Sol Ring", B);
    const bobs = spawn(game, "Memnite", B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    toBob(game);
    // Bob's Sol Ring (1) gives alice's nothing.
    expect(bobCanCast(game, bolt, myr)).toBe(true);
    // Bob's own artifacts have no protection: alice's Gold Myr (2) doesn't
    // reach them through Rebbec.
    expect(bobCanCast(game, bolt, bobs)).toBe(true);
  });

  it("a creature of a protected mana value can't block it", () => {
    const { game, a } = table();
    spawn(game, "Rebbec, Architect of Ascension");
    const myr = spawn(game, "Gold Myr");
    const bears = spawn(game, "Grizzly Bears", B);
    const ornithopter = spawn(game, "Ornithopter", B);
    // Gold Myr has protection from 2 (its own): Grizzly Bears (2) can't block
    // it; Ornithopter (0) can.
    blockOffer(game, a, [myr]);
    const block = (blocker: ObjectId): string | null =>
      game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker, attacker: myr }] });
    expect(block(bears)).not.toBeNull();
    expect(block(ornithopter)).toBeNull();
  });
});

describe("Lavabrink Venturer", () => {
  for (const quality of ["odd", "even"] as const) {
    it(`has protection from each ${quality} mana value`, () => {
      const { game, a } = table();
      a.chooseCreatureTypeFn = () => quality;
      lands(game, "Plains", 3);
      const venturer = toHand(game, "Lavabrink Venturer");
      cast(game, venturer);
      expect(game.state.objects[venturer].chosenOnEnter).toBe(quality);
      lands(game, "Mountain", 1, B);
      lands(game, "Swamp", 2, B);
      const bolt = toHand(game, "Lightning Bolt", B);
      const blade = toHand(game, "Doom Blade", B);
      toBob(game);
      expect(bobCanCast(game, bolt, venturer)).toBe(quality === "even");
      expect(bobCanCast(game, blade, venturer)).toBe(quality === "odd");
    });
  }
});

describe("Haktos the Unscarred", () => {
  /** A black removal spell of each mana value Haktos may keep. */
  const SPELL_OF = { "2": "Doom Blade", "3": "Murder", "4": "Price of Fame" } as const;

  it("draws 2, 3 or 4 as it enters, and has protection from every other mana value", () => {
    const drawn = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 2);
      lands(game, "Plains", 2);
      const haktos = toHand(game, "Haktos the Unscarred");
      game.dispatch({ type: "cast-spell", player: A, card: haktos, targets: [] });
      game.dispatch({ type: "pass-priority", player: A });
      game.dispatch({ type: "pass-priority", player: B });
      expect(game.state.objects[haktos].zone).toBe("battlefield");
      const chosen = game.state.objects[haktos].chosenOnEnter as keyof typeof SPELL_OF;
      expect(Object.keys(SPELL_OF)).toContain(chosen);
      drawn.add(chosen);
      // Announced, and drawn, not asked.
      expect(game.eventsOfType("chosen-at-random").some((e) => e.source === haktos && e.chosen.kind === "option")).toBe(true);
      lands(game, "Swamp", 4, B);
      lands(game, "Mountain", 1, B);
      toBob(game);
      // Lightning Bolt (1) never reaches it.
      expect(bobCanCast(game, toHand(game, "Lightning Bolt", B), haktos)).toBe(false);
      for (const [n, spell] of Object.entries(SPELL_OF)) {
        expect(bobCanCast(game, toHand(game, spell, B), haktos)).toBe(n === chosen);
      }
    }
    // The seeds between them drew each number.
    expect(drawn.size).toBe(3);
  });

  it("has no protection with no number chosen", () => {
    const { game } = table();
    const haktos = spawn(game, "Haktos the Unscarred");
    game.state.objects[haktos].chosenOnEnter = null;
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    toBob(game);
    expect(bobCanCast(game, bolt, haktos)).toBe(true);
  });
});
