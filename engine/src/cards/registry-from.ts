/**
 * A registry from a given set of card definitions, plus the engine's own
 * synthetic ones every game needs: face-down cards, the locked Room door,
 * emblems and speed. `createDefaultRegistry` (`registry.ts`) is this over the
 * whole pool; a browser running a game builds one from the card shards it has
 * loaded (`docs/plans/local-rooms.md`), which can't import the pool.
 */

import { CardRegistry } from "./card-registry.js";
import type { CardDefinition } from "./define.js";
import { EMBLEM_DEFINITIONS } from "./emblem.js";
import { FACE_DOWN_DEFINITIONS } from "./face-down.js";
import { LOCKED_ROOM_DEFINITION } from "./locked-room.js";
import { SPEED_DEFINITIONS } from "./speed.js";

export function registryFrom(cards: Iterable<CardDefinition>): CardRegistry {
  const registry = new CardRegistry();
  for (const card of cards) registry.register(card);
  for (const card of FACE_DOWN_DEFINITIONS) registry.register(card);
  registry.register(LOCKED_ROOM_DEFINITION);
  for (const card of EMBLEM_DEFINITIONS) registry.register(card);
  for (const card of SPEED_DEFINITIONS) registry.register(card);
  return registry;
}
