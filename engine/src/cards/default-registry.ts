/**
 * The registry a game or a bot falls back on when it isn't handed one: every
 * built-in card (`createDefaultRegistry`).
 *
 * Its own module so a browser build can do without it: `Game` and the bots
 * reach the whole pool only through here, and a page that runs a game (a solo
 * game in a Web Worker, `docs/plans/local-rooms.md`) resolves this file to
 * `default-registry.browser.ts` instead, which refuses — such a page builds
 * its registry from the card shards (`registryFrom`) and passes it in.
 * `test/local-entry.test.ts` holds `engine/local` to that.
 */

import type { CardRegistry } from "./card-registry.js";
import { createDefaultRegistry } from "./registry.js";

export function defaultRegistry(): CardRegistry {
  return createDefaultRegistry();
}
