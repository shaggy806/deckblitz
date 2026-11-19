/**
 * One game held by several rooms at once, in one process: the check of step 2
 * of `docs/plans/replicated-rooms.md`, and nothing a server or a page runs.
 *
 * Each person at the table has a `Room` of their own, a copy (`RoomCopy`)
 * built from the same seed and decks, answering only for that person's seat;
 * one of them also answers for the bots (the host). Whatever a copy does to
 * its game it sends, and an in-memory order here hands every input to every
 * other copy in the order they were made — what the server will do for real
 * (step 3), without a network. If the cut in `room.ts` is whole (every write
 * to the game an input, no copy writing for a seat that isn't its own), the
 * copies' games stay identical, which `agree` checks by their digests.
 *
 * `playCopies` fuzzes it: random players, bots on the host's copy, and on
 * the way the things people do out of turn — auto-pass, pass the turn,
 * resolve the stack, settings, a seat handed to a bot and taken back, a
 * concession, the host changing, a copy taking another's state
 * (`Room.replaceGame`). Nothing here races: an out-of-turn input is made only
 * when every copy has caught up, and the order is the order of making. Inputs
 * that race, and the undo they need, are `table-fuzz.ts`'s (step 5), over the
 * server's real order.
 *
 * Used by `test/room-copies.test.ts` and `scripts/copies-fuzz.mjs`. Part of
 * the room code as far as imports go (`engine/local` and its neighbours only).
 */

import {
  COMMANDER_RULES,
  Game,
  HeuristicBotController,
  RandomController,
  answeringPlayer,
  createRng,
  standInFor,
  stateDigest,
  stateFromJson,
  stateToJson,
} from "engine/local";
import type { GameConfig, GameState, PlayerController, PlayerId } from "engine/local";
import type { PassSettings } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { SEATS } from "./decks.js";
import { Room } from "./room.js";
import type { Connection, RoomInput, RoomTimers } from "./room.js";

/** A clock nobody waits on: `fireNext` runs the timer due soonest, at once. */
export class FakeClock {
  private now = 0;
  private nextId = 1;
  private readonly pending = new Map<number, { readonly at: number; readonly fn: () => void }>();
  readonly timers: RoomTimers = {
    setTimeout: (fn, ms) => {
      const id = this.nextId++;
      this.pending.set(id, { at: this.now + ms, fn });
      return id;
    },
    clearTimeout: (handle) => {
      this.pending.delete(handle as number);
    },
  };

  /** Whether any timer is set. */
  get waiting(): boolean {
    return this.pending.size > 0;
  }

  /** Runs the earliest timer still set; `false` if there is none. */
  fireNext(): boolean {
    let dueId: number | null = null;
    let dueAt = Infinity;
    for (const [id, timer] of this.pending) {
      if (timer.at < dueAt) {
        dueId = id;
        dueAt = timer.at;
      }
    }
    if (dueId === null) return false;
    const due = this.pending.get(dueId);
    this.pending.delete(dueId);
    this.now = dueAt;
    due?.fn();
    return true;
  }
}

/** One person's device: their seat and their copy of the room. */
export interface Copy {
  readonly index: number;
  readonly player: PlayerId;
  readonly room: Room;
  readonly connection: Connection;
  /** Frames this copy has published to its page. */
  frames: number;
  /** The last frame its page said it had shown (`"realtime"` pacing). */
  acked: number;
  /** Inputs it made out of turn that haven't come back in their place yet:
   * while there are any, it plays nothing (`RoomCopy.sent`). */
  flying: number;
}

export interface CopiesOptions {
  readonly seed: number;
  /** Who sits in each seat, in seating order (2-4). */
  readonly seats: readonly ("person" | "bot")[];
  /** What plays a bot's seat: v1 unless given (quick, and it never reads a clock). */
  readonly botController?: (player: PlayerId) => PlayerController;
  /** Each seat's deck, in seating order: the server's own four Commander
   * decks unless given (the fuzz script deals decks from the whole pool). */
  readonly decks?: readonly { readonly cards: readonly string[]; readonly commanders?: readonly string[] }[];
  /** Commander's rules (the default) or the engine's plain ones. */
  readonly rules?: "commander" | "plain";
  /**
   * `"immediate"` (the default): each copy runs to the next thing a person
   * must answer inside one settle. `"realtime"`: each copy paces as a live
   * room does — a bot's move parked behind a frame until the page has shown
   * it and the think time has passed — on a clock that never waits: every
   * page acks every frame, and a timer runs the moment nothing else is left
   * to do. The same game either way is not expected (the pacing decides when
   * an auto-pass is made), only the same game on every copy.
   */
  readonly pacing?: "immediate" | "realtime";
}

/** Where two plain values first differ: `path: ours | theirs`, a line each. */
export function differences(ours: unknown, theirs: unknown, path = "state", out: string[] = [], limit = 8): string[] {
  if (out.length >= limit || ours === theirs) return out;
  const leaf = (v: unknown): string => (v === undefined ? "(absent)" : (JSON.stringify(v) ?? String(v)).slice(0, 80));
  if (typeof ours !== "object" || typeof theirs !== "object" || ours === null || theirs === null) {
    out.push(`${path}: ${leaf(ours)} | ${leaf(theirs)}`);
    return out;
  }
  const a = ours as Record<string, unknown>;
  const b = theirs as Record<string, unknown>;
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (out.length >= limit) break;
    if (a[key] === undefined || b[key] === undefined) {
      if (a[key] !== b[key]) out.push(`${path}.${key}: ${leaf(a[key])} | ${leaf(b[key])}`);
    } else differences(a[key], b[key], `${path}.${key}`, out, limit);
  }
  return out;
}

export class CopiesTable {
  readonly copies: Copy[] = [];
  /** Every input, in the one order all copies have it in, with who made it. */
  readonly log: { readonly from: number; readonly input: RoomInput }[] = [];
  /** The seats bots play. */
  readonly botSeats: ReadonlySet<PlayerId>;
  /** What was done out of turn, in order, by whoever drives the table: for
   * reading a failure by. */
  readonly did: string[] = [];
  /** The copy that runs the bots. */
  private hostIndex = 0;
  private readonly queue: { readonly from: number; readonly input: RoomInput; readonly applied: boolean }[] = [];
  /** The one clock every copy's timers run on, in `"realtime"` pacing. */
  private readonly clock: FakeClock | null;

  constructor(options: CopiesOptions) {
    const players = options.seats.map((_, i) => SEATS[i].id);
    this.botSeats = new Set(players.filter((_, i) => options.seats[i] === "bot"));
    this.clock = options.pacing === "realtime" ? new FakeClock() : null;
    const clock = this.clock;
    const config: GameConfig = {
      seed: options.seed,
      idSalt: `copies-${options.seed}`,
      mulligans: true,
      ...(options.rules === "plain" ? {} : { rules: COMMANDER_RULES }),
      registry: cardRegistry(),
      decks: players.map((player, i) => {
        const deck = options.decks?.[i] ?? SEATS[i];
        return { player, cards: deck.cards, ...(deck.commanders !== undefined ? { commanders: deck.commanders } : {}) };
      }),
    };
    const botController =
      options.botController ?? ((player: PlayerId): PlayerController => new HeuristicBotController(player, cardRegistry()));
    players.forEach((player, seatIndex) => {
      if (options.seats[seatIndex] !== "person") return;
      const index = this.copies.length;
      const connection: Connection = { send: () => {} };
      const room = new Room(`COPY${index}`, Game.create(config), {
        ...(clock === null
          ? { pacing: "immediate" as const }
          : { pacing: "realtime" as const, timers: clock.timers, settleSliceMs: Infinity }),
        botController,
        copy: {
          answersFor: (who) =>
            copy.flying === 0 && (who === player || (this.hostIndex === index && this.botSeats.has(who))),
          sent: (input, how) => {
            if (!how.applied) copy.flying += 1;
            this.queue.push({ from: index, input, applied: how.applied });
          },
        },
        onUpdate: () => {
          copy.frames += 1;
        },
      });
      const copy: Copy = { index, player, room, connection, frames: 0, acked: 0, flying: 0 };
      this.copies.push(copy);
    });
    if (this.copies.length === 0) throw new Error("a table of copies needs a person");
    for (const copy of this.copies) {
      copy.room.claimSeat(copy.player, `token-${copy.index}`, copy.connection);
      for (const bot of this.botSeats) copy.room.addBot(bot);
    }
    for (const copy of this.copies) copy.room.start();
    this.pump();
  }

  get host(): Copy {
    return this.copies[this.hostIndex];
  }

  /** Another copy runs the bots from now on. */
  setHost(index: number): void {
    if (index === this.hostIndex) return;
    const before = this.host;
    this.hostIndex = index;
    before.room.answersChanged();
    this.host.room.answersChanged();
    this.pump();
  }

  /**
   * Hands every input made so far to every other copy, in order, and
   * whatever those make in turn, until the table has come to rest: nobody
   * has anything left to send, and (paced) every page has shown its last
   * frame and no timer is set — everyone is waiting on a person.
   */
  pump(): void {
    for (let guard = 0; guard < 1_000_000; guard += 1) {
      const next = this.queue.shift();
      if (next !== undefined) {
        this.log.push({ from: next.from, input: next.input });
        for (const copy of this.copies) {
          // An input its maker applied when it made it goes to the others;
          // one made out of turn comes back to its maker too, in its place.
          if (copy.index !== next.from) copy.room.receive(next.input);
          else if (!next.applied) {
            copy.flying -= 1;
            copy.room.receive(next.input);
          }
        }
        continue;
      }
      if (this.clock === null) return;
      // Every page keeps up: it has shown whatever it was last sent.
      let acked = false;
      for (const copy of this.copies) {
        if (copy.acked < copy.room.frameSeq) {
          copy.acked = copy.room.frameSeq;
          copy.room.ack(copy.connection, copy.acked);
          acked = true;
        }
      }
      if (acked || this.queue.length > 0) continue;
      if (!this.clock.fireNext()) return;
    }
    throw new Error("copies: the table never came to rest");
  }

  /** The state every copy should be holding (the first one's). */
  get state(): GameState {
    return this.copies[0].room.game.state;
  }

  /** Throws unless every copy holds the same game and none has stopped. */
  agree(when: string): void {
    for (const copy of this.copies) {
      if (copy.room.stopped !== null) {
        throw new Error(`copies: ${copy.player}'s copy stopped ${when}: ${copy.room.stopped}`);
      }
    }
    const digests = this.copies.map((copy) => stateDigest(copy.room.game.state, { events: true }));
    const odd = digests.findIndex((d) => d !== digests[0]);
    if (odd < 0) return;
    const plain = (copy: Copy): unknown => JSON.parse(stateToJson(copy.room.game.snapshot()));
    const lines = differences(plain(this.copies[0]), plain(this.copies[odd])).map((line) => `  ${line}`);
    const { turn } = this.state;
    throw new Error(
      `copies: ${this.copies[odd].player}'s copy differs from ${this.copies[0].player}'s ${when}, ` +
        `after ${this.log.length} inputs, turn ${turn.number} (${turn.step}) (${this.copies[0].player} | ${this.copies[odd].player}):\n` +
        `${lines.join("\n")}\n  the last inputs: ${this.log
          .slice(-3)
          .map((entry) => `${this.copies[entry.from].player}: ${JSON.stringify(entry.input).slice(0, 140)}`)
          .join(" ; ")}`,
    );
  }

  /**
   * The person the game is waiting on, their copy and the player they answer
   * as (their own, or one they control: rule 723) — or `null` once the game
   * is over. Throws if it waits on a seat whose copy should have moved by
   * itself (a bot's, or a person's that a bot is playing), which is a copy
   * that didn't answer for a seat it holds.
   */
  waitingOn(): { readonly copy: Copy; readonly asked: PlayerId } | null {
    const state = this.state;
    if (state.result.over) return null;
    const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
    if (asked === null) throw new Error("copies: the game is waiting on nobody");
    const answering = answeringPlayer(state, asked);
    const copy = this.copies.find((c) => c.player === answering);
    const { turn } = state;
    if (copy === undefined || copy.room.isBotSeat(answering)) {
      throw new Error(
        `copies: nobody moved for ${answering} (asked as ${asked}), turn ${turn.number} (${turn.step}), ` +
          `after ${this.log.length} inputs: a bot's seat, and the host is ${this.host.player}`,
      );
    }
    return { copy, asked };
  }
}

export interface CopiesFuzzOptions extends CopiesOptions {
  /** Stop once this turn has passed (a game that isn't over by then). */
  readonly maxTurn?: number;
  /** How likely each person's step is to come with something done out of
   * turn (0 for none). */
  readonly sideEvents?: number;
  /** Check that the copies agree every this many steps (and at the end). */
  readonly checkEvery?: number;
  /** Handed the table once it is dealt: for whoever reports a failure to
   * read the log and the copies from. */
  readonly watch?: (table: CopiesTable) => void;
}

export interface CopiesFuzzResult {
  readonly copies: number;
  readonly steps: number;
  readonly inputs: number;
  readonly turns: number;
  readonly over: boolean;
  readonly checks: number;
  /** How often each out-of-turn thing was done. */
  readonly did: Readonly<Record<string, number>>;
  readonly digest: string;
}

/**
 * Plays one game on a table of copies with random people (the engine's
 * `RandomController`, through each copy's own `Room.dispatch`), checking as
 * it goes that every copy holds the same game. Throws where they differ.
 */
export function playCopies(options: CopiesFuzzOptions): CopiesFuzzResult {
  const table = new CopiesTable(options);
  options.watch?.(table);
  const rng = createRng(options.seed * 7919 + 13);
  const maxTurn = options.maxTurn ?? 12;
  const sideEvents = options.sideEvents ?? 0.06;
  const checkEvery = options.checkEvery ?? 20;
  const people = new Map<PlayerId, RandomController>(
    table.copies.map((copy) => [copy.player, new RandomController(copy.player, () => rng.next())]),
  );
  const did: Record<string, number> = {};
  const note = (what: string): void => {
    did[what] = (did[what] ?? 0) + 1;
  };
  const chance = (p: number): boolean => rng.next() < p;
  const pick = <T>(items: readonly T[]): T => items[rng.int(items.length)];
  let conceded = 0;
  let checks = 0;

  /** Something a person does out of turn, on their own copy. What the room
   * refuses (a concession during the opening hands) is simply not done. */
  const sideEvent = (): void => {
    const copy = pick(table.copies);
    const { room, connection } = copy;
    const kinds = ["auto-pass", "pass-turn", "resolve-all", "settings", "takeover", "host", "take-state", "concede"] as const;
    const kind = pick(kinds);
    try {
      switch (kind) {
        case "auto-pass":
          room.requestAutoPass(connection);
          break;
        case "pass-turn":
          room.requestPassTurn(connection);
          break;
        case "resolve-all":
          room.requestResolveAll(connection);
          break;
        case "settings": {
          const settings: PassSettings = {
            passToMain: chance(0.3),
            passThroughCombat: chance(0.3),
            orderTriggers: chance(0.5),
            skipManaOnly: chance(0.7),
            skipAbilityOnly: chance(0.7),
            stops: { mine: chance(0.3) ? ["upkeep", "end"] : [], theirs: chance(0.3) ? ["declare-attackers"] : [] },
          };
          room.setPassSettings(connection, settings);
          break;
        }
        case "takeover":
          room.setBotTakeover(connection, !room.isBotSeat(copy.player));
          break;
        case "host":
          table.setHost(pick(table.copies).index);
          break;
        case "take-state": {
          // As it would arrive from another device: through the wire's text.
          const from = pick(table.copies);
          room.replaceGame(stateFromJson(stateToJson(from.room.game.snapshot())));
          break;
        }
        case "concede":
          // Leave two in the game, so it goes on.
          if (table.state.turnOrder.filter((p) => table.state.players[p]?.hasLost !== true).length <= 2) return;
          if (conceded >= table.copies.length - 1) return;
          room.concede(connection);
          conceded += 1;
          break;
      }
      note(kind);
      table.did.push(`${copy.player} ${kind} (after ${table.log.length} inputs)`);
    } catch {
      note(`${kind} refused`);
    }
    table.pump();
  };

  let steps = 0;
  table.agree("at the start");
  for (;;) {
    const waiting = table.waitingOn();
    if (waiting === null || table.state.turn.number > maxTurn) break;
    if (sideEvents > 0 && chance(sideEvents)) {
      sideEvent();
      table.agree("after something done out of turn");
      continue;
    }
    const { copy, asked } = waiting;
    const person = people.get(copy.player);
    if (person === undefined) throw new Error(`copies: no player for ${copy.player}`);
    const view = copy.room.game.controllerView(asked);
    const action = asked === copy.player ? person.act(view) : standInFor(person, asked).act(view);
    copy.room.dispatch(copy.connection, action);
    table.pump();
    steps += 1;
    if (steps % checkEvery === 0) {
      table.agree(`after ${steps} steps`);
      checks += 1;
    }
  }
  table.agree("at the end");
  return {
    copies: table.copies.length,
    steps,
    inputs: table.log.length,
    turns: table.state.turn.number,
    over: table.state.result.over,
    checks: checks + 2,
    did,
    digest: stateDigest(table.state, { events: true }),
  };
}
