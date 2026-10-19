/**
 * A registry from a given set of card definitions, plus the engine's own
 * synthetic ones every game needs: face-down cards, the locked Room door,
 * emblems, speed, rad counters and the monarch. `createDefaultRegistry` (`registry.ts`) is this over the
 * whole pool; a browser running a game builds one from the card shards it has
 * loaded (`docs/plans/local-rooms.md`), which can't import the pool.
 */

import { CardRegistry } from "./card-registry.js";
import type { CardDefinition } from "./define.js";
import { EMBLEM_DEFINITIONS } from "./emblem.js";
import { FACE_DOWN_DEFINITIONS } from "./face-down.js";
import { LOCKED_ROOM_DEFINITION } from "./locked-room.js";
import { MONARCH_DEFINITIONS } from "./monarch.js";
import { RAD_DEFINITIONS } from "./rad.js";
import { SPEED_DEFINITIONS } from "./speed.js";

export function registryFrom(cards: Iterable<CardDefinition>): CardRegistry {
  const registry = new CardRegistry();
  for (const card of cards) registry.register(card);
  for (const card of FACE_DOWN_DEFINITIONS) registry.register(card);
  registry.register(LOCKED_ROOM_DEFINITION);
  for (const card of EMBLEM_DEFINITIONS) registry.register(card);
  for (const card of SPEED_DEFINITIONS) registry.register(card);
  for (const card of RAD_DEFINITIONS) registry.register(card);
  for (const card of MONARCH_DEFINITIONS) registry.register(card);
  return registry;
}
