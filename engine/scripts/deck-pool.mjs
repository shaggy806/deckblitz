// Which decks `deck-winrates.mjs` deals tables from, shared with its worker
// (which inherits the environment): every starter deck; with `--pool
// upgraded` the precons beside their upgrades (`UPGRADED_DECKS`), to measure
// what an upgrade is worth; with `--pool blitz` the upgrades alone, the
// field a blitz deals from, to see how even it is; or with `--pool strong`
// the real players' decks (`STRONG_DECKS`) against those upgrades.
import { SAMPLE_DECKS, STRONG_DECKS, UPGRADED_DECKS } from "../dist/index.js";

const POOLS = {
  upgraded: () => [...SAMPLE_DECKS.filter((d) => UPGRADED_DECKS.some((u) => u.upgradeOf === d.name)), ...UPGRADED_DECKS],
  blitz: () => [...UPGRADED_DECKS],
  strong: () => [...UPGRADED_DECKS, ...STRONG_DECKS],
};

export const DECK_POOL = POOLS[process.env.DECK_POOL]?.() ?? SAMPLE_DECKS;
