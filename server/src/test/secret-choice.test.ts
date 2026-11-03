/**
 * A secret choice over the wire: every seat is pushed its own redacted view, so
 * what a player secretly chose (`GameObject.secretChoice`) reaches only that
 * player's frames until a cost reveals it. Checked on real frames, end to end,
 * for the other seats and a spectator, log included.
 */

import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { Game, createDefaultRegistry } from "engine";
import type { ObjectId, PlayerId } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";

import { ALICE, BOB, CAROL } from "../decks.js";
import { RoomManager } from "../room-manager.js";
import { Room } from "../room.js";
import { attachRoomServer } from "../ws-server.js";

type StateMessage = Extract<ServerMessage, { type: "state" }>;

const registry = createDefaultRegistry();

interface Client {
  send(message: ClientMessage): void;
  /** Resolves with the next state frame meeting `match`; every frame it read
   * on the way stays in `frames`. */
  state(match: (m: StateMessage) => boolean): Promise<StateMessage>;
  readonly frames: StateMessage[];
}

describe("a secret choice in each seat's frames", () => {
  let wss: WebSocketServer;
  let manager: RoomManager;
  let port: number;
  let sockets: WebSocket[];

  beforeEach(async () => {
    wss = new WebSocketServer({ port: 0 });
    manager = new RoomManager({ pacing: "immediate" });
    attachRoomServer(wss, manager);
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    port = (wss.address() as AddressInfo).port;
    sockets = [];
  });

  afterEach(async () => {
    for (const ws of sockets) ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  async function connect(): Promise<Client> {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    sockets.push(ws);
    const frames: StateMessage[] = [];
    const waiters: {
      match: (m: StateMessage) => boolean;
      resolve: (m: StateMessage) => void;
      reject: (e: Error) => void;
    }[] = [];
    ws.on("message", (raw) => {
      const message = JSON.parse(raw.toString()) as ServerMessage;
      if (message.type === "error") {
        for (const w of waiters.splice(0)) w.reject(new Error(message.message));
        return;
      }
      if (message.type !== "state") return;
      frames.push(message);
      const i = waiters.findIndex((w) => w.match(message));
      if (i >= 0) waiters.splice(i, 1)[0].resolve(message);
    });
    return {
      frames,
      send: (message) => ws.send(JSON.stringify(message)),
      state: (match) =>
        new Promise((resolve, reject) => {
          const had = frames.find(match);
          if (had !== undefined) resolve(had);
          else waiters.push({ match, resolve, reject });
        }),
    };
  }

  /** Three seats and a spectator in a room, Alice at her main phase with six
   * Plains and a Guardian Archon in hand. */
  async function room(): Promise<{
    roomId: string;
    alice: Client;
    others: readonly Client[];
    archon: ObjectId;
    bears: ObjectId;
  }> {
    const game = Game.create({
      seed: 1,
      registry,
      shuffle: false,
      startingPlayer: ALICE,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
      decks: [ALICE, BOB, CAROL].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === ALICE);
    for (let i = 0; i < 6; i += 1) game.debugSpawn("Plains", ALICE, "battlefield");
    const bears = game.debugSpawn("Grizzly Bears", ALICE, "battlefield");
    const archon = game.debugSpawn("Guardian Archon", ALICE, "hand");
    const roomId = "SCRT1";
    manager.adopt(new Room(roomId, game, { pacing: "immediate" }));
    const seat = async (player: PlayerId): Promise<Client> => {
      const c = await connect();
      c.send({ type: "join-room", roomId });
      c.send({ type: "claim-seat", roomId, seat: player, clientToken: `${player}-token` });
      await c.state(() => true);
      return c;
    };
    const alice = await seat(ALICE);
    const bob = await seat(BOB);
    const carol = await seat(CAROL);
    const watcher = await connect();
    watcher.send({ type: "spectate-room", roomId });
    await watcher.state(() => true);
    return { roomId, alice, others: [bob, carol, watcher], archon, bears };
  }

  it("reaches only the chooser's frames, and everyone's once it's revealed", async () => {
    const { roomId, alice, others, archon, bears } = await room();
    alice.send({ type: "dispatch", roomId, action: { type: "cast-spell", player: ALICE, card: archon, targets: [] } });
    // Nobody can respond with nothing to respond with, so it comes straight
    // to the question.
    const settled = (m: StateMessage): boolean => m.view.objects[archon]?.secretChoice !== undefined;
    await alice.state((m) => m.view.awaiting?.kind === "choose-creature-type");
    alice.send({
      type: "dispatch",
      roomId,
      action: { type: "choose-creature-type", player: ALICE, creatureType: CAROL },
    });

    const mine = await alice.state(settled);
    expect(mine.view.objects[archon]?.chosenPlayer).toBe(CAROL);
    expect(mine.view.objects[archon]?.secretChoice).toBe("yours");
    for (const other of others) {
      const frame = await other.state(settled);
      expect(frame.view.objects[archon]?.secretChoice).toBe("hidden");
      for (const seen of other.frames) {
        expect(seen.view.objects[archon]?.chosenPlayer).toBeUndefined();
        const log = JSON.stringify(seen.view.events);
        expect(log).not.toContain("creature-type-chosen");
        // The choice was Carol's name, and what she's been asked never names it.
        expect(log).not.toContain('"choice"');
      }
      expect(frame.view.events.some((e) => e.type === "secret-choice-made")).toBe(true);
    }

    // Revealing it, as a cost: everyone sees it at once.
    alice.send({
      type: "dispatch",
      roomId,
      action: {
        type: "activate-ability",
        player: ALICE,
        source: archon,
        abilityIndex: 0,
        targets: [{ kind: "object", object: bears }],
      },
    });
    for (const other of others) {
      const frame = await other.state((m) => m.view.objects[archon]?.chosenPlayer !== undefined);
      expect(frame.view.objects[archon]?.chosenPlayer).toBe(CAROL);
      expect(frame.view.objects[archon]?.secretChoice).toBeUndefined();
      expect(frame.view.events.some((e) => e.type === "secret-choice-revealed" && e.choice === CAROL)).toBe(true);
    }
  });
});
