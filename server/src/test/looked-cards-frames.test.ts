/**
 * A look over the wire: a hand looked at as a permanent enters (Arachne,
 * Psionic Weaver) and the top of a library (Orcish Spy) reach only the frames
 * of the seat looking. Checked on real frames, for the other seats and a
 * spectator, as `secret-choice.test.ts` does.
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
  state(match: (m: StateMessage) => boolean): Promise<StateMessage>;
  readonly frames: StateMessage[];
}

describe("cards looked at in each seat's frames", () => {
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

  /** Three seats and a spectator, Alice at her main phase with `set` done. */
  async function room(
    roomId: string,
    set: (game: Game) => void,
  ): Promise<{ alice: Client; bob: Client; carol: Client; watcher: Client; game: Game }> {
    const game = Game.create({
      seed: 1,
      registry,
      shuffle: false,
      startingPlayer: ALICE,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
      decks: [ALICE, BOB, CAROL].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === ALICE);
    set(game);
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
    return { alice, bob, carol, watcher, game };
  }

  it("a hand looked at as Arachne enters reaches the chooser and the hand's owner alone", async () => {
    let arachne = "" as ObjectId;
    let bolt = "" as ObjectId;
    const { alice, bob, carol, watcher } = await room("LOOK1", (game) => {
      for (let i = 0; i < 3; i += 1) game.debugSpawn("Plains", ALICE, "battlefield");
      arachne = game.debugSpawn("Arachne, Psionic Weaver", ALICE, "hand");
      bolt = game.debugSpawn("Lightning Bolt", CAROL, "hand");
    });
    const roomId = "LOOK1";
    alice.send({ type: "dispatch", roomId, action: { type: "cast-spell", player: ALICE, card: arachne, targets: [] } });
    // Nobody can respond with nothing to respond with, so it comes straight
    // to which opponent.
    await alice.state((m) => m.view.awaiting?.kind === "choose-creature-type");
    alice.send({ type: "dispatch", roomId, action: { type: "choose-creature-type", player: ALICE, creatureType: CAROL } });

    const looked = (m: StateMessage): boolean => m.view.awaiting?.kind === "choose-creature-type" && m.view.awaiting.options.includes("sorcery");
    const mine = await alice.state(looked);
    expect(mine.view.objects[bolt]?.cardName).toBe("Lightning Bolt");
    const awaiting = mine.view.awaiting;
    expect(awaiting?.kind === "choose-creature-type" && awaiting.looked).toContain(bolt);
    // Carol sees her own hand, and not that it's being looked at by way of ids.
    await carol.state(looked);
    for (const other of [bob, watcher]) {
      const frame = await other.state(looked);
      expect(frame.view.awaiting).not.toHaveProperty("looked");
      for (const seen of other.frames) {
        expect(JSON.stringify(seen.view.objects)).not.toContain("Lightning Bolt");
      }
    }
  });

  it("the top of a library reaches the seat looking, not its owner", async () => {
    let spy = "" as ObjectId;
    let top: readonly ObjectId[] = [];
    const { alice, bob, carol, watcher } = await room("LOOK2", (game) => {
      spy = game.debugSpawn("Orcish Spy", ALICE, "battlefield", { summoningSick: false });
      top = game.state.zones.perPlayer[CAROL].library.slice(0, 3);
    });
    const roomId = "LOOK2";
    alice.send({
      type: "dispatch",
      roomId,
      action: { type: "activate-ability", player: ALICE, source: spy, abilityIndex: 0, targets: [{ kind: "player", player: CAROL }] },
    });
    const looking = (m: StateMessage): boolean => m.view.awaiting?.kind === "choose-from-zone";
    const mine = await alice.state(looking);
    for (const id of top) expect(mine.view.objects[id]?.cardName).toBe("Wastes");
    for (const other of [bob, carol, watcher]) {
      const frame = await other.state(looking);
      for (const id of top) expect(frame.view.objects[id]?.cardName ?? null).toBeNull();
    }
  });
});
