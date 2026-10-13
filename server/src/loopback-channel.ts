/**
 * A shard run in this thread, behind the same `ShardChannel` a worker gives
 * `WorkerRoomHost` — for tests, which can't load TypeScript sources in a
 * worker. Every message crosses as it would between threads: structured-
 * cloned (buffers transferred) and delivered in a later microtask, never
 * shared, so what a test drives is what production sends.
 */

import { createDefaultRegistry } from "engine";
import type { CardRegistry } from "engine";
import { createShard } from "./shard.js";
import type { FromShard, ShardConfig } from "./shard-protocol.js";
import type { ShardChannel } from "./worker-host.js";

let sharedRegistry: CardRegistry | null = null;

export interface LoopbackChannel extends ShardChannel {
  /** Ends the shard as a crash would: no `stop`, an exit code. */
  crash(code?: number): void;
}

export function loopbackChannel(config: ShardConfig): LoopbackChannel {
  // One registry for every in-thread shard: building one is most of a
  // shard's start-up, and nothing writes to it.
  sharedRegistry ??= createDefaultRegistry();
  let listener: ((message: FromShard) => void) | null = null;
  const exitListeners: ((code: number) => void)[] = [];
  let alive = true;

  const shard = createShard(
    config,
    (message, transfer) => {
      const copy = structuredClone(message, { transfer: [...transfer] });
      queueMicrotask(() => {
        if (alive) listener?.(copy);
      });
    },
    sharedRegistry,
  );

  const end = (code: number): void => {
    if (!alive) return;
    alive = false;
    shard.stop();
    queueMicrotask(() => {
      for (const l of exitListeners) l(code);
    });
  };

  return {
    post: (message) => {
      if (!alive) return;
      const copy = structuredClone(message);
      queueMicrotask(() => {
        if (!alive) return;
        shard.receive(copy);
        // A worker given `stop` ends once idle.
        if (copy.t === "stop") end(0);
      });
    },
    onMessage: (l) => {
      listener = l;
    },
    onExit: (l) => {
      exitListeners.push(l);
    },
    terminate: async () => end(1),
    crash: (code = 1) => end(code),
  };
}
