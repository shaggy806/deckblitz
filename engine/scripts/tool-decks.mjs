// The decks a bot tool seats by name (`bot:watch`, `bot:losses`, `bot:judge`:
// `--decks "A,B,C,D"`): the strong decks, then the starter decks and their
// upgrades, then the **tooling precons** — every other Wizards Commander
// precon the pool plays exactly as printed (`data/tooling-precons.json`,
// written by `gen-tooling-precons.mjs`; 69 on 2026-11-16).
//
// The tooling precons exist to watch the bots on cards and plans the starter
// decks don't have (planeswalker commanders, energy, storm, Slivers, …). They
// are read here, by scripts, and by nothing under `src/`: no engine export
// holds them, so the server never deals one and the client never lists one.
// Keep it so (the user's call, 2026-11-16: these aren't for players to use or
// see). A deck comes into the starter list the usual way, in
// `src/sample-decks.ts`, and then leaves this file on the next generate.

import { readFileSync } from "node:fs";

import { STARTER_DECKS, STRONG_DECKS } from "../dist/index.js";

/** `{ name, code, released, commanders, cards }` each: the 99 as printed. */
export const TOOLING_PRECONS = JSON.parse(readFileSync(new URL("../data/tooling-precons.json", import.meta.url), "utf8"));

export const TOOL_DECKS = [...STRONG_DECKS, ...STARTER_DECKS, ...TOOLING_PRECONS];

/**
 * The deck a name asks for: one named exactly that (any case), else the first
 * whose name contains it, in `TOOL_DECKS`' order — so "The Ur-Dragon" is
 * still the strong deck, and "Draconic Domination" the 2017 precon it leads.
 */
export function findDeck(name) {
  const wanted = name.trim().toLowerCase();
  const deck =
    TOOL_DECKS.find((d) => d.name.toLowerCase() === wanted) ?? TOOL_DECKS.find((d) => d.name.toLowerCase().includes(wanted));
  if (deck === undefined) throw new Error(`no deck matching "${name}"`);
  return deck;
}
