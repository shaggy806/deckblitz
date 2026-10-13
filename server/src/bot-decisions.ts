/**
 * This thread's bot-decision histogram (microseconds), for `/status`'s
 * decision p99 (`LoadMonitor`): Node's `perf_hooks` histogram, plugged into the
 * room code's recorder (`recordBotDecisionsTo` in `room.ts`) the first time a
 * Node host asks for it — the in-process host, or a shard. The room code
 * itself imports nothing Node-only, since a browser runs it too.
 */

import { createHistogram } from "node:perf_hooks";
import type { RecordableHistogram } from "node:perf_hooks";
import { recordBotDecisionsTo } from "./room.js";

let histogram: RecordableHistogram | null = null;

/** This thread's histogram, recording from the first call on. */
export function botDecisions(): RecordableHistogram {
  if (histogram === null) {
    const made = createHistogram();
    recordBotDecisionsTo({ record: (micros) => made.record(micros) });
    histogram = made;
  }
  return histogram;
}
