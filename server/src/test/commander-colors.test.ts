/**
 * A commander that chooses its colour as the deck is built (rule 903.4b —
 * Clara Oswald, The Prismatic Piper) on the server: a seat's deck carries the
 * colour into its `DeckList`, read off the deck's cards when it doesn't say;
 * a malformed one is refused; and an import reports the colour its list's
 * cards settle, or that the player has to choose.
 */
import { describe, expect, it } from "vitest";
import { createDefaultRegistry } from "engine";
import { PendingRoom } from "../pending-room.js";
import { ALICE, BOB } from "../decks.js";
import { formatCheck, parseDecklistText } from "../import-deck.js";

const registry = createDefaultRegistry();
const CLARA_PAIR = ["Clara Oswald", "The Eighth Doctor"];

function claimWith(deck: Parameters<PendingRoom["claimSeat"]>[4]) {
  const room = new PendingRoom("TEST1", 2, { seed: 1 });
  room.claimSeat(ALICE, "alice-token", { send: () => {} }, undefined, deck);
  room.claimSeat(BOB, "bob-token", { send: () => {} });
  return room;
}

describe("a seat's deck with a colour chosen before the game", () => {
  it("carries the deck's chosen colour into its DeckList", () => {
    const room = claimWith({ cards: ["Island"], commanders: CLARA_PAIR, commanderColors: { "Clara Oswald": "R" } });
    const alice = room.toGameConfig().decks.find((d) => d.player === ALICE);
    expect(alice?.commanderColors).toEqual({ "Clara Oswald": "R" });
  });

  it("reads it off the deck's cards when the deck doesn't say", () => {
    const room = claimWith({ cards: ["Lightning Bolt", "Island"], commanders: CLARA_PAIR });
    const alice = room.toGameConfig().decks.find((d) => d.player === ALICE);
    expect(alice?.commanderColors).toEqual({ "Clara Oswald": "R" });
  });

  it("refuses a colour that isn't one", () => {
    expect(() =>
      claimWith({ cards: ["Island"], commanders: CLARA_PAIR, commanderColors: { "Clara Oswald": "purple" as never } }),
    ).toThrow(/W, U, B, R or G/);
  });
});

describe("an import of a deck whose commander chooses its colour", () => {
  const list = (cards: readonly string[]) =>
    ["Commander", "1 Clara Oswald", "1 The Eighth Doctor", "", "Deck", ...cards.map((c) => `1 ${c}`)].join("\n");

  it("settles the colour from the list's cards", () => {
    const { entries, commanders } = parseDecklistText(list(["Lightning Bolt", "Island"]));
    const r = formatCheck(entries, registry, commanders, "section");
    expect(r.commanderColors).toEqual({ "Clara Oswald": "R" });
    expect(r.identity).toBe("WUR");
    expect(r.commanderColorOpen).toBeUndefined();
  });

  it("leaves it to the player when the cards don't need one, without calling the list illegal for it", () => {
    const { entries, commanders } = parseDecklistText(list(["Island"]));
    const r = formatCheck(entries, registry, commanders, "section");
    expect(r.commanderColorOpen).toEqual(["Clara Oswald"]);
    expect(r.violations.some((v) => v.startsWith("choose a colour"))).toBe(false);
  });
});
