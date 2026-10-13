/**
 * `default-registry.ts` as a browser build resolves it: there's no whole pool
 * to fall back on in a page, so a game or a bot built without a registry is a
 * bug — pass the one built from the loaded card shards (`registryFrom`).
 * See `default-registry.ts` for why this swap exists.
 */

import type { CardRegistry } from "./card-registry.js";

export function defaultRegistry(): CardRegistry {
  throw new Error(
    "no card registry was passed: in a browser, build one from the card shards (registryFrom) and pass it to the game and every bot",
  );
}
