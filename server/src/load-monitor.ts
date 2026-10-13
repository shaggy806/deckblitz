/**
 * How busy one thread is: its event-loop delay (`monitorEventLoopDelay`), its
 * event-loop utilisation, its heap, and — on a thread that runs rooms — how
 * long its bots took to decide. Read over a rolling window, so `/status`
 * shows the last few seconds rather than everything since start.
 *
 * Per thread: a worker's `LoadMonitor` sees only its own loop and heap.
 * Main-side (no engine), so the main thread and a shard both use it.
 */

import { monitorEventLoopDelay, performance } from "node:perf_hooks";
import type { EventLoopUtilization, IntervalHistogram, RecordableHistogram } from "node:perf_hooks";
import { getHeapStatistics } from "node:v8";

/** One thread's load over the last window. Times in milliseconds. */
export interface LoadReport {
  /** Event-loop utilisation, 0-1: the share of the window the loop was busy. */
  readonly elu: number;
  readonly delayP50Ms: number;
  readonly delayP99Ms: number;
  readonly delayMaxMs: number;
  /** This thread's own heap (a worker has its own). */
  readonly heapUsedMb: number;
  /** Bot decisions in the window, and the slowest 1% of them (`null` with
   * none, or on a thread that runs no rooms). */
  readonly botDecisions: number;
  readonly botDecisionP99Ms: number | null;
  /** How long the window ran. */
  readonly windowMs: number;
}

const DEFAULT_WINDOW_MS = 10_000;
/** How often the delay histogram samples. Each sample is the whole time
 * between two ticks of a timer this often, so the resolution itself is taken
 * off to leave the delay (Windows' coarse timers still show a few ms idle). */
const RESOLUTION_MS = 10;
const ms = (ns: number): number => Math.max(0, Math.round((ns / 1e6 - RESOLUTION_MS) * 10) / 10);

export class LoadMonitor {
  private readonly delay: IntervalHistogram;
  private readonly decisions: RecordableHistogram | null;
  private readonly timer: ReturnType<typeof setInterval>;
  private elu: EventLoopUtilization;
  private startedAt: number;
  private last: LoadReport | null = null;

  /** `decisions`: a histogram of bot decision times in microseconds
   * (`BOT_DECISIONS` in `room.ts`), on a thread that runs rooms. */
  constructor(options: { readonly windowMs?: number; readonly decisions?: RecordableHistogram } = {}) {
    this.delay = monitorEventLoopDelay({ resolution: RESOLUTION_MS });
    this.delay.enable();
    this.decisions = options.decisions ?? null;
    this.elu = performance.eventLoopUtilization();
    this.startedAt = performance.now();
    this.timer = setInterval(() => {
      this.last = this.measure();
      this.delay.reset();
      this.decisions?.reset();
      this.elu = performance.eventLoopUtilization();
      this.startedAt = performance.now();
    }, options.windowMs ?? DEFAULT_WINDOW_MS);
    this.timer.unref();
  }

  /** The last whole window, or the one under way if none has finished. */
  read(): LoadReport {
    return this.last ?? this.measure();
  }

  stop(): void {
    clearInterval(this.timer);
    this.delay.disable();
  }

  private measure(): LoadReport {
    const decisions = this.decisions;
    const count = decisions?.count ?? 0;
    return {
      elu: Math.round(performance.eventLoopUtilization(this.elu).utilization * 1000) / 1000,
      // An empty histogram reads NaN (or a huge minimum) before its first
      // sample, which a fresh thread can hit.
      delayP50Ms: this.delay.count > 0 ? ms(this.delay.percentile(50)) : 0,
      delayP99Ms: this.delay.count > 0 ? ms(this.delay.percentile(99)) : 0,
      delayMaxMs: this.delay.count > 0 ? ms(this.delay.max) : 0,
      heapUsedMb: Math.round(getHeapStatistics().used_heap_size / 1024 / 1024),
      botDecisions: count,
      botDecisionP99Ms: decisions !== null && count > 0 ? Math.round(decisions.percentile(99) / 1000) : null,
      windowMs: Math.round(performance.now() - this.startedAt),
    };
  }
}
