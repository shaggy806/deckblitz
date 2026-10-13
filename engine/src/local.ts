/**
 * The engine as a browser runs a game with it (`engine/local`): everything
 * `engine/client` has, plus `Game`, the bots and what a room needs to run one
 * — for solo games played in the player's browser (`docs/plans/local-rooms.md`).
 *
 * Like `client.ts`, it must never reach a card definition: the page builds its
 * registry from the card shards it loads (`registryFrom`) and hands it to the
 * game and every bot. The one route from here to the pool is the registry a
 * game or bot falls back on (`cards/default-registry.ts`), which a browser
 * build resolves to `default-registry.browser.ts` instead — a bundler plugin
 * does the swap, and `test/local-entry.test.ts` walks this entry's imports
 * with the same swap and fails if any reach a card file.
 */

export type * from "./index.js";

export * from "./client.js";
export { registryFrom } from "./cards/registry-from.js";
// The registry a game or bot falls back on: the whole pool in Node, the stub
// that refuses in a browser bundle. Re-exported for the room code
// (`server/src/card-registry.ts`), which runs in both.
export { defaultRegistry } from "./cards/default-registry.js";
export { actionPlayer } from "./actions.js";
export { computeCharacteristics } from "./characteristics.js";
export { autoAnswerFor, decisionHasSource, mayActOn } from "./decisions/registry.js";
export * from "./game.js";
export * from "./controller.js";
export * from "./auto-settle.js";
// The bots themselves, not `bot/index.ts`: its training scenarios build the
// whole pool.
export * from "./bot/eval-bot.js";
export * from "./bot/evaluate.js";
