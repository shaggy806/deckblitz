/**
 * A `ShardConfig.setup` module for the loopback tests, shaped like
 * dev-rooms' `scripts/dev-rooms-shard.mjs`: a waiting room per shard under a
 * fixed code, and a few ops.
 */

import { COMMANDER_RULES } from "engine";
import type { SetupModule } from "../../shard.js";

export const setup: SetupModule = ({ manager, index, count }) => {
  manager.createPending(2, { seed: 1, mulligans: true, rules: COMMANDER_RULES }, undefined, `FIXA${index}`);
  return {
    control(cmd) {
      const { op, room } = cmd as { op: string; room?: string };
      if (op === "where") return { result: { index, count, rooms: manager.all().map((r) => r.id) } };
      if (op === "reset") return { result: { reset: room }, dropConnections: true };
      throw new Error(`unknown op "${op}"`);
    },
  };
};
