/**
 * The card registry every room on this thread shares — its games, its bots,
 * deck checks, scenario and lesson boards.
 *
 * One copy rather than one per game and bot (`Game.create` and each bot used
 * to build their own: about five a blitz room). In Node it is the whole pool,
 * built the first time a room needs it (the engine's `defaultRegistry`). A
 * browser running a solo game (`docs/plans/local-rooms.md`) has no pool to fall
 * back on — its bundle swaps `defaultRegistry` for a stub that throws — so its
 * host builds a registry from the card shards it loaded (`registryFrom`) and
 * hands it over with `provideCardRegistry` before any room starts.
 */

import { defaultRegistry } from "engine/local";
import type { CardRegistry } from "engine/local";

let shared: CardRegistry | null = null;

/** This thread's registry, from now on. */
export function provideCardRegistry(registry: CardRegistry): void {
  shared = registry;
}

/** This thread's registry: the one handed over, or (in Node) the whole pool. */
export function cardRegistry(): CardRegistry {
  return (shared ??= defaultRegistry());
}
