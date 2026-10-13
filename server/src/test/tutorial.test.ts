/**
 * Tutorial rooms (`tutorial-session.ts`, `tutorials/`): the conditions a
 * lesson waits on, the lesson table's own checks, a lesson played through
 * with the right answers chapter by chapter, a retry rewinding to a
 * chapter's start, and the wire: a lesson by id on a server started without
 * `--builder`, an unknown one refused.
 */

import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { asPlayerId } from "engine";
import type { GameEvent, GameState, ObjectId } from "engine";
import type { ServerMessage, TutorialInfo } from "protocol";
import type { Connection } from "../room.js";
import { RoomManager } from "../room-manager.js";
import { LESSONS, metAt, validateLesson } from "../tutorials/index.js";
import type { Lesson } from "../tutorials/index.js";
import { BASICS_PROOF } from "../tutorials/basics-proof.js";
import { attachRoomServer } from "../ws-server.js";

const ALICE = asPlayerId("alice");
const BOB = asPlayerId("bob");

describe("a lesson's conditions", () => {
  // A log and board by hand: bob's turn 2 — a Forest played, Grizzly Bears
  // cast, the Bears attacking and alice's Llanowar Elves blocking.
  const objects = {
    f: { cardName: "Forest", controller: BOB },
    g: { cardName: "Grizzly Bears", controller: BOB },
    e: { cardName: "Llanowar Elves", controller: ALICE },
  };
  const events = [
    { type: "turn-began", turn: 1, activePlayer: ALICE },
    { type: "step-began", step: "precombat-main", phase: "precombat-main" },
    { type: "turn-began", turn: 2, activePlayer: BOB },
    { type: "land-played", player: BOB, object: "f", from: "hand" },
    { type: "spell-cast", player: BOB, object: "g", from: "hand" },
    { type: "step-began", step: "declare-attackers", phase: "combat" },
    { type: "attackers-declared", player: BOB, attackers: ["g"] },
    { type: "blocker-declared", blocker: "e", attacker: "g" },
  ].map((e, seq) => ({ ...e, seq })) as unknown as GameEvent[];
  const state = {
    eventLog: events,
    objects,
    players: { alice: { life: 38 }, bob: { life: 40 } },
  } as unknown as GameState;

  it("are met just past the first event that meets them, from where they're checked", () => {
    expect(metAt(state, 0, { event: "land-played" })).toBe(4);
    expect(metAt(state, 0, { event: "land-played", player: ALICE })).toBeNull();
    expect(metAt(state, 0, { event: "spell-cast", card: "Grizzly Bears" })).toBe(5);
    expect(metAt(state, 0, { event: "spell-cast", card: "Llanowar Elves" })).toBeNull();
    expect(metAt(state, 5, { event: "spell-cast" })).toBeNull();
    expect(metAt(state, 0, { event: "attackers-declared", player: BOB, atLeast: 1 })).toBe(7);
    expect(metAt(state, 0, { event: "attackers-declared", atLeast: 2 })).toBeNull();
    expect(metAt(state, 0, { event: "blocker-declared", player: ALICE, card: "Llanowar Elves" })).toBe(8);
    expect(metAt(state, 0, { event: "blocker-declared", player: BOB })).toBeNull();
    expect(metAt(state, 0, { event: "turn-began", turn: 2 })).toBe(3);
    expect(metAt(state, 0, { event: "turn-began", player: ALICE })).toBe(1);
    expect(metAt(state, 2, { event: "turn-began", player: ALICE })).toBeNull();
    expect(metAt(state, 0, { event: "player-lost" })).toBeNull();
  });

  it("read a step's turn off the turn that last began, even before where they're checked from", () => {
    expect(metAt(state, 0, { event: "step-began", step: "declare-attackers", player: BOB })).toBe(6);
    expect(metAt(state, 4, { event: "step-began", step: "declare-attackers", player: BOB })).toBe(6);
    expect(metAt(state, 0, { event: "step-began", step: "declare-attackers", player: ALICE })).toBeNull();
    expect(metAt(state, 0, { event: "step-began", step: "precombat-main", player: ALICE })).toBe(2);
  });

  it("can be met by the board as it stands", () => {
    expect(metAt(state, 0, { lifeAtMost: { player: ALICE, value: 38 } })).toBe(events.length);
    expect(metAt(state, 0, { lifeAtMost: { player: BOB, value: 39 } })).toBeNull();
  });
});

describe("the lesson table", () => {
  it("holds only lessons that can run", () => {
    expect(LESSONS.size).toBeGreaterThan(0);
    for (const lesson of LESSONS.values()) expect(() => validateLesson(lesson)).not.toThrow();
  });

  it("refuses a lesson that couldn't", () => {
    const [first, ...rest] = BASICS_PROOF.chapters;
    const lesson = (chapters: Lesson["chapters"]): Lesson => ({ ...BASICS_PROOF, chapters });
    expect(() => validateLesson(lesson([{ ...first, board: undefined }, ...rest]))).toThrow(/first chapter needs a board/);
    // A fresh board after a goal card: only Next can reach it.
    expect(() => validateLesson(lesson([first, rest[0], { ...rest[1], board: first.board }]))).toThrow(/Next card/);
    expect(() =>
      validateLesson(lesson([first, { ...rest[0], steps: [{ ...rest[0].steps[0], goals: [{ id: "x", label: "x", when: { event: "spell-cast", card: "No Such Card" } }] }] }])),
    ).toThrow(/isn't a card/);
    expect(() => validateLesson(lesson([first, { ...rest[0], id: "welcome" }]))).toThrow(/used twice/);
  });
});

const connection = { send: () => {} } as unknown as Connection;
const idNamed = (state: GameState, name: string, zone: string): ObjectId => {
  const id = Object.values(state.objects).find((o) => o.cardName === name && o.zone === zone && o.owner === ALICE)?.id;
  if (id === undefined) throw new Error(`no ${name} in alice's ${zone}`);
  return id;
};

/** A tutorial room through `RoomManager`, as `tutorial-create` makes one, with
 * alice's seat claimed and every frame's `tutorial` kept. */
function openLesson(id: string) {
  const manager = new RoomManager({ pacing: "immediate" });
  const frames: TutorialInfo[] = [];
  manager.onRoomUpdate = (room) => {
    if (room.tutorial !== null) frames.push(room.tutorial);
  };
  const session = manager.createTutorial(id, "host");
  session.room.claimSeat(session.seat, "alice-token", connection);
  session.room.bindHost(connection, "host");
  session.room.publish();
  const info = (): TutorialInfo => frames.at(-1)!;
  /** Alice passes until `until`, declaring no attackers on the way. */
  const passUntil = (until: (s: GameState) => boolean): void => {
    for (let i = 0; i < 300 && !until(session.room.game.state); i += 1) {
      const s = session.room.game.state;
      if (s.awaiting?.kind === "attackers" && s.awaiting.player === ALICE) {
        session.room.dispatch(connection, { type: "declare-attackers", player: ALICE, attackers: [] });
      } else if (s.awaiting === null && s.priority.holder === ALICE) {
        session.room.dispatch(connection, { type: "pass-priority", player: ALICE });
      } else {
        throw new Error(`alice can't pass: ${s.turn.step}, ${s.awaiting?.kind}`);
      }
    }
  };
  return { manager, session, frames, info, passUntil };
}

describe("a tutorial room", () => {
  it("plays basics-proof through with the right answers, chapter by chapter, to the end", () => {
    const { manager, session, info, passUntil } = openLesson("basics-proof");
    expect(manager.tutorial(session.id)).toBe(session);
    expect(session.seat).toBe(ALICE);
    expect(session.room.seatStatuses().find((s) => s.player === BOB)).toMatchObject({ isBot: true, displayName: "Rowan" });

    // An intro card, waiting on Next.
    expect(info()).toMatchObject({ lesson: "basics-proof", chapter: "welcome", chapterIndex: 0, complete: false });
    expect(info().step).toMatchObject({ id: "welcome", advance: "next" });
    expect(() => session.next("play-land")).toThrow(/already gone/);
    session.next("welcome");

    // Play a land: a goal card.
    expect(info().chapter).toBe("land");
    expect(info().step).toMatchObject({ id: "play-land", advance: "goal", anchor: "card:Forest" });
    expect(info().goals).toEqual([{ id: "land-played", label: "Play a Forest", done: false }]);
    expect(() => session.next("play-land")).toThrow(/goals/);
    const s = session.room.game.state;
    session.room.dispatch(connection, { type: "play-land", player: ALICE, card: idNamed(s, "Forest", "hand") });

    // Cast a creature.
    expect(info().chapter).toBe("creature");
    expect(info().step?.id).toBe("cast-elves");
    const elves = idNamed(session.room.game.state, "Llanowar Elves", "hand");
    session.room.dispatch(connection, { type: "cast-spell", player: ALICE, card: elves, targets: [] });

    // Pass the turn. Alice has nothing left to do, but the card asking her to
    // pass holds her window once the Elves have resolved (`holdPriority`),
    // rather than the room passing it for her straight into Rowan's turn.
    expect(info().chapter).toBe("turn");
    expect(info().step).toMatchObject({ id: "pass-turn", anchor: "tour:game-pass-turn", advance: "goal" });
    const held = session.room.game.state;
    expect(held).toMatchObject({ turn: { number: 1, step: "precombat-main" }, awaiting: null });
    expect(held.priority.holder).toBe(ALICE);
    expect(held.zones.shared.stack).toEqual([]);
    expect(held.objects[elves].zone).toBe("battlefield");
    // Pass Turn passes it; Rowan's scripted attack opens the last chapter.
    session.room.requestPassTurn(connection);
    expect(session.room.game.state.awaiting?.kind).toBe("blockers");
    expect(info()).toMatchObject({ chapter: "block", chapterIndex: 4 });
    expect(info().step).toMatchObject({ id: "block", advance: "goal" });
    const st = session.room.game.state;
    const mystic = st.zones.shared.battlefield.find((id) => st.objects[id].cardName === "Elvish Mystic")!;
    expect(st.objects[mystic].attacking).toBe(ALICE);
    session.room.dispatch(connection, {
      type: "declare-blockers",
      player: ALICE,
      blocks: [{ blocker: elves, attacker: mystic }],
    });

    expect(info().step?.id).toBe("well-done");
    session.next("well-done");
    expect(info()).toMatchObject({ complete: true, step: null, goals: [], canRetry: false });
  });

  it("rewinds a chapter gone wrong to its start", () => {
    const { session, info, passUntil } = openLesson("basics-proof");
    session.next("welcome");
    session.room.dispatch(connection, {
      type: "play-land",
      player: ALICE,
      card: idNamed(session.room.game.state, "Forest", "hand"),
    });
    expect(info().step?.id).toBe("cast-elves");
    const start = session.room.game.snapshot();

    // Wrong: pass without casting the Elves. Rowan's turn comes and goes.
    passUntil((s) => s.turn.number === 3);
    expect(info().step?.id).toBe("cast-elves");
    const before = session.room;
    session.retry();

    expect(session.room).not.toBe(before);
    expect(session.room.seatOf(connection)).toBe(ALICE);
    expect(session.room.frameSeq).toBeGreaterThan(before.frameSeq);
    const now = session.room.game.state;
    expect(now.turn).toEqual(start.turn);
    expect(now.zones).toEqual(start.zones);
    expect(now.players).toEqual(start.players);
    expect(now.eventLog.length).toBe(start.eventLog.length);
    expect(info()).toMatchObject({ chapter: "creature", step: { id: "cast-elves" } });
    expect(info().goals.every((g) => !g.done)).toBe(true);

    // And the chapter plays on from there as it would have.
    const elves = idNamed(now, "Llanowar Elves", "hand");
    session.room.dispatch(connection, { type: "cast-spell", player: ALICE, card: elves, targets: [] });
    passUntil((s) => s.awaiting?.kind === "blockers");
    expect(info().step?.id).toBe("block");
  });
});

/** Each message `ws` receives, in order. */
function messageQueue(ws: WebSocket): () => Promise<ServerMessage> {
  const buffer: ServerMessage[] = [];
  const waiters: ((m: ServerMessage) => void)[] = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString()) as ServerMessage;
    const waiter = waiters.shift();
    if (waiter) waiter(msg);
    else buffer.push(msg);
  });
  return () =>
    new Promise((resolve) => {
      const buffered = buffer.shift();
      if (buffered) resolve(buffered);
      else waiters.push(resolve);
    });
}

describe("a tutorial over the wire", () => {
  let wss: WebSocketServer | null = null;
  const sockets: WebSocket[] = [];

  afterEach(async () => {
    for (const ws of sockets.splice(0)) ws.close();
    const server = wss;
    wss = null;
    if (server !== null) await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const connect = async () => {
    // A server as the public site runs it: no --builder, no --capture.
    wss = new WebSocketServer({ port: 0 });
    attachRoomServer(wss, new RoomManager());
    await new Promise<void>((resolve) => wss!.once("listening", resolve));
    const ws = new WebSocket(`ws://127.0.0.1:${(wss.address() as AddressInfo).port}`);
    await new Promise((resolve, reject) => {
      ws.once("open", resolve);
      ws.once("error", reject);
    });
    sockets.push(ws);
    return { next: messageQueue(ws), send: (m: object) => ws.send(JSON.stringify(m)) };
  };

  const nextState = async (next: () => Promise<ServerMessage>) => {
    for (;;) {
      const m = await next();
      if (m.type === "error") throw new Error(m.message);
      if (m.type === "state") return m;
    }
  };

  it("refuses a lesson that isn't there", async () => {
    const { next, send } = await connect();
    send({ type: "tutorial-create", lesson: "no-such-lesson", hostToken: "h" });
    const m = await next();
    expect(m.type === "error" && m.message).toMatch(/no lesson "no-such-lesson"/);
    send({ type: "tutorial-create", lesson: { id: "basics-proof" }, hostToken: "h" });
    const n = await next();
    expect(n.type).toBe("error");
  });

  it("opens a lesson by id on a server without --builder, and moves on with Next", async () => {
    const { next, send } = await connect();
    send({ type: "tutorial-create", lesson: "basics-proof", hostToken: "h" });
    const created = await next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    expect(created.seat).toBe(ALICE);
    const roomId = created.roomId;
    send({ type: "join-room", roomId, hostToken: "h" });
    expect((await next()).type).toBe("room-joined");
    send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "t" });
    const first = await nextState(next);
    expect(first.builder).toBeUndefined();
    expect(first.tutorial?.step).toMatchObject({ id: "welcome", advance: "next" });
    expect(first.actions.some((a) => a.kind === "play-land")).toBe(true);
    // No library card is visible, Rowan's or alice's: the lesson says
    // where it stands, never what its board holds.
    expect(Object.values(first.view.objects).filter((o) => (o as { zone?: string }).zone === "library")).toEqual([]);
    expect(JSON.stringify(first.tutorial)).not.toMatch(/library|Elvish Mystic/);

    send({ type: "tutorial-next", roomId, step: "welcome" });
    const second = await nextState(next);
    expect(second.seq).toBeGreaterThan(first.seq);
    expect(second.tutorial?.step?.id).toBe("play-land");

    send({ type: "tutorial-retry", roomId });
    const rewound = await nextState(next);
    expect(rewound.seq).toBeGreaterThan(second.seq);
    // The chapter under way is "land", which began at the Next.
    expect(rewound.tutorial).toMatchObject({ chapter: "land", step: { id: "play-land" } });
  });
});
