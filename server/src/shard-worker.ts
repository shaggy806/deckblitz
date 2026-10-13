/**
 * A worker thread's entry point: one shard (`shard.ts`), configured by the
 * `ShardConfig` main passed as `workerData`, talking to main over the
 * worker's port. Its log lines carry the shard's index.
 */

import { parentPort, workerData } from "node:worker_threads";
import { createShard } from "./shard.js";
import type { ShardConfig, ToShard } from "./shard-protocol.js";

const port = parentPort;
if (port === null) throw new Error("shard-worker.ts runs as a worker thread");
const config = workerData as ShardConfig;

const tag = `[shard ${config.index}]`;
for (const level of ["log", "info", "warn", "error"] as const) {
  const write = console[level].bind(console);
  console[level] = (...args: unknown[]) => write(tag, ...args);
}

const shard = createShard(config, (message, transfer) => port.postMessage(message, [...transfer]));
port.on("message", (message: ToShard) => {
  shard.receive(message);
  // Stopped: let the thread end once nothing else is pending.
  if (message.t === "stop") port.close();
});
