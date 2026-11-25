// Which decks `deck-winrates.mjs` deals tables from, shared with its worker
// (which inherits the environment): every starter deck; with `--pool
// upgraded` the precons beside their upgrades (`UPGRADED_DECKS`), to measure
// what an upgrade is worth; with `--pool blitz` the upgrades alone, the
// field a blitz deals from, to see how even it is; with `--pool upgrades`
// every upgrade, those kept from the bots too; with `--pool strong`
// the real players' decks (`STRONG_DECKS`) against those upgrades; or with
// `--pool strong-only` the strong decks among themselves; or with `--pool
// tooling` the tooling precons (`tool-decks.mjs`: the other Wizards precons
// the pool plays as printed, kept from players), to see which of their cards
// the bots leave uncast.
import { SAMPLE_DECKS, STRONG_DECKS, UPGRADED_DECKS, botPool } from "../dist/index.js";
import { TOOLING_PRECONS, findDeck } from "./tool-decks.mjs";

const POOLS = {
  // What a Bracket 2 bot is dealt (the lobby's `botDecksOf("precon")`): the
  // starters as printed, less any kept from the bots.
  precon: () => [...botPool(SAMPLE_DECKS)],
  upgraded: () => [...SAMPLE_DECKS.filter((d) => UPGRADED_DECKS.some((u) => u.upgradeOf === d.name)), ...UPGRADED_DECKS],
  // What a blitz really deals: less the decks kept from the bots.
  blitz: () => [...botPool(UPGRADED_DECKS)],
  // Every upgrade, those kept from the bots too (`bots: false`): the field
  // `upgraded-decks.md`'s Run 3 measured, for comparing against it.
  upgrades: () => [...UPGRADED_DECKS],
  strong: () => [...UPGRADED_DECKS, ...STRONG_DECKS],
  // The strong decks among themselves: whether one holds its own in the pool
  // a host deals "Strong" bots from.
  "strong-only": () => [...STRONG_DECKS],
  tooling: () => [...TOOLING_PRECONS],
};

// `--with "A,B"` (`DECK_POOL_WITH`): those decks too, matched as the deck
// tools match a name (`tool-decks.mjs`'s `findDeck`: a strong deck, a
// starter, a tooling precon) — how a deck kept from players would sit in a
// pool before it joins one (Multiverse Reforged among Bracket 2, 2026-11-24).
const extra = (process.env.DECK_POOL_WITH ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter((name) => name.length > 0)
  .map(findDeck);

export const DECK_POOL = [...(POOLS[process.env.DECK_POOL]?.() ?? SAMPLE_DECKS), ...extra];
