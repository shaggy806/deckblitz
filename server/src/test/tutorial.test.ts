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
import { BOARD_TOUR } from "../tutorials/board-tour.js";
import { LEARN_COMMANDER } from "../tutorials/learn-commander.js";
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
    const [first, ...rest] = LEARN_COMMANDER.chapters;
    const lesson = (chapters: Lesson["chapters"]): Lesson => ({ ...LEARN_COMMANDER, chapters });
    const goalCard = rest[0].steps[0];
    expect(() => validateLesson(lesson([{ ...first, board: undefined }, ...rest]))).toThrow(/first chapter needs a board/);
    // A fresh board after a goal card: only Next can reach it.
    expect(() => validateLesson(lesson([first, { ...rest[0], steps: [goalCard] }, { ...rest[1], board: first.board, opensOn: undefined }]))).toThrow(/Next card/);
    expect(() =>
      validateLesson(lesson([first, { ...rest[0], steps: [{ ...goalCard, goals: [{ id: "x", label: "x", when: { event: "spell-cast", card: "No Such Card" } }] }] }])),
    ).toThrow(/isn't a card/);
    expect(() => validateLesson(lesson([first, { ...rest[0], id: "table" }]))).toThrow(/used twice/);
    // A scripted lesson's goal card has to say what it leaves open.
    expect(() => validateLesson(lesson([first, { ...rest[0], steps: [{ ...goalCard, allow: undefined }] }]))).toThrow(/what it allows/);
    expect(() => validateLesson(lesson([first, { ...rest[0], steps: [{ ...goalCard, opensOn: { event: "turn-began" } }] }]))).toThrow(/chapter says when/);
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

/** Alice's moves in `learn-commander`, as the board's clicks send them. */
function coachedMoves({ session }: { readonly session: ReturnType<typeof openLesson>["session"] }) {
  const state = (): GameState => session.room.game.state;
  const named = (name: string): ObjectId => {
    const s = state();
    const id = s.zones.shared.battlefield.find((b) => s.objects[b].cardName === name);
    if (id === undefined) throw new Error(`no ${name} on the battlefield`);
    return id;
  };
  return {
    state,
    named,
    land: () => session.room.dispatch(connection, { type: "play-land", player: ALICE, card: idNamed(state(), "Swamp", "hand") }),
    cast: (name: string, zone = "hand") =>
      session.room.dispatch(connection, { type: "cast-spell", player: ALICE, card: idNamed(state(), name, zone), targets: [] }),
    pass: () => session.room.dispatch(connection, { type: "pass-priority", player: ALICE }),
    attack: (...names: string[]) =>
      session.room.dispatch(connection, {
        type: "declare-attackers",
        player: ALICE,
        attackers: names.map((name) => ({ attacker: named(name), defender: BOB })),
      }),
    block: (blocker: string, attacker: string) =>
      session.room.dispatch(connection, {
        type: "declare-blockers",
        player: ALICE,
        blocks: [{ blocker: named(blocker), attacker: named(attacker) }],
      }),
    /** On through the first chapter's Next cards. */
    pastTheTable: () => {
      for (const id of ["welcome", "life", "hand", "read-a-card", "command-zone", "library"]) session.next(id);
    },
  };
}

describe("Learn Commander", () => {
  it("plays through with the right answers, chapter by chapter, to a win on turn 7", () => {
    const opened = openLesson("learn-commander");
    const { manager, session, info } = opened;
    const m = coachedMoves(opened);
    const life = (): number => m.state().players[BOB].life;
    expect(manager.tutorial(session.id)).toBe(session);
    expect(session.seat).toBe(ALICE);
    expect(session.room.seatStatuses().find((s) => s.player === BOB)).toMatchObject({ isBot: true, displayName: "Rowan" });
    expect(m.state().players[ALICE].life).toBe(40);
    expect(life()).toBe(13);

    // The table: Next cards, and nothing yet to undo.
    expect(info()).toMatchObject({ lesson: "learn-commander", chapter: "table", chapterIndex: 0, complete: false, canRetry: false });
    expect(info().step).toMatchObject({ id: "welcome", advance: "next" });
    expect(() => session.next("first-land")).toThrow(/already gone/);
    m.pastTheTable();

    // Land and mana.
    expect(info().chapter).toBe("mana");
    expect(info().step).toMatchObject({ id: "first-land", advance: "goal", anchor: "card:Swamp", showHand: true });
    expect(() => session.next("first-land")).toThrow(/goals/);
    m.land();
    expect(info().step?.id).toBe("cast-rats");
    m.cast("Muck Rats");
    // Her cast has resolved and the card after it can point at the Rats.
    expect(info().step?.id).toBe("tapped");
    expect(m.state().objects[m.named("Muck Rats")].zone).toBe("battlefield");
    expect(m.state().objects[m.named("Swamp")].tapped).toBe(true);
    session.next("tapped");
    session.next("summoning-sick");

    // Pass the turn: the card holds her window, which has nothing else in it.
    expect(info().step).toMatchObject({ id: "first-pass", anchor: "tour:game-pass-turn" });
    expect(m.state()).toMatchObject({ turn: { number: 1, step: "precombat-main" }, awaiting: null });
    session.room.requestPassTurn(connection);

    // Rowan's turn, narrated.
    expect(info()).toMatchObject({ chapter: "rowans-turn", step: { id: "phase-track" } });
    expect(m.state().turn).toMatchObject({ number: 2, step: "precombat-main" });
    session.next("phase-track");
    expect(info().step?.id).toBe("rowan-creature");
    session.next("rowan-creature");

    // Attack.
    expect(info()).toMatchObject({ chapter: "attack", step: { id: "your-turn-again" } });
    expect(m.state().turn).toMatchObject({ number: 3, step: "precombat-main" });
    expect(m.state().objects[m.named("Swamp")].tapped).toBe(false);
    session.next("your-turn-again");
    m.land();
    m.cast("Cabal Evangel");
    expect(info().step?.id).toBe("first-to-combat");
    m.pass();
    expect(info().step?.id).toBe("first-attack");
    expect(m.state().awaiting?.kind).toBe("attackers");
    m.attack("Muck Rats");
    expect(info().step?.id).toBe("first-hit");
    expect(life()).toBe(12);
    session.next("first-hit");
    expect(info().step?.id).toBe("second-pass");
    session.room.requestPassTurn(connection);

    // Block: the Rats stayed tapped, the Evangel kills the Trader and lives.
    expect(info()).toMatchObject({ chapter: "block", step: { id: "block" } });
    expect(m.state().awaiting?.kind).toBe("blockers");
    expect(m.state().objects[m.named("Muck Rats")].tapped).toBe(true);
    m.block("Cabal Evangel", "Dwarven Trader");
    expect(info().step?.id).toBe("block-result");
    expect(m.state().zones.shared.battlefield.some((id) => m.state().objects[id].cardName === "Dwarven Trader")).toBe(false);
    expect(m.state().zones.shared.battlefield.some((id) => m.state().objects[id].cardName === "Cabal Evangel")).toBe(true);
    expect(m.state().players[ALICE].life).toBe(40);
    session.next("block-result");
    session.next("graveyard");

    // The commander.
    expect(info()).toMatchObject({ chapter: "commander", step: { id: "third-land" } });
    expect(m.state().turn.number).toBe(5);
    m.land();
    m.cast("Kalakscion, Hunger Tyrant", "command");
    expect(info().step?.id).toBe("commander-rules");
    expect(m.state().objects[m.named("Kalakscion, Hunger Tyrant")].zone).toBe("battlefield");
    session.next("commander-rules");
    m.pass();
    expect(info().step?.id).toBe("second-attack");
    m.attack("Muck Rats", "Cabal Evangel");
    expect(life()).toBe(9);
    expect(info().step?.id).toBe("third-pass");
    session.room.requestPassTurn(connection);

    // The finish: Rowan's commander, and an attack it can only half stop.
    expect(info()).toMatchObject({ chapter: "finish", step: { id: "rowan-commander" } });
    expect(m.state().turn.number).toBe(6);
    session.next("rowan-commander");
    expect(info().step?.id).toBe("last-turn");
    expect(m.state().turn.number).toBe(7);
    session.next("last-turn");
    m.pass();
    expect(info().step?.id).toBe("last-attack");
    m.attack("Kalakscion, Hunger Tyrant", "Cabal Evangel", "Muck Rats");
    expect(info().step?.id).toBe("blocked");
    expect(m.state().result.over).toBe(false);
    session.next("blocked");
    expect(info().step?.id).toBe("won");
    expect(m.state().result.over).toBe(true);
    expect(life()).toBeLessThanOrEqual(0);
    session.next("won");
    expect(info()).toMatchObject({ complete: true, step: null, goals: [], canRetry: false });
  });

  it("can't be left waiting for a move that can no longer happen", () => {
    const opened = openLesson("learn-commander");
    const { session, info } = opened;
    const m = coachedMoves(opened);
    const offered = () => [...new Set(session.room.actionsFor(ALICE).map((a) => a.kind))];
    m.pastTheTable();

    // Passing early was the soft-lock: the turn went by, and the card waiting
    // for it was waiting for a turn already gone. Nothing but the land now.
    expect(info().step?.id).toBe("first-land");
    expect(info().allows).toEqual({ passTurn: false, autoPass: false, declareAtLeast: 0 });
    expect(offered()).toEqual(["play-land"]);
    expect(() => session.room.requestPassTurn(connection)).toThrow(/waiting for something else/);
    expect(() => session.room.requestAutoPass(connection)).toThrow(/waiting for something else/);
    expect(() => m.pass()).toThrow(/waiting for something else/);
    expect(() => m.cast("Muck Rats")).toThrow(/waiting for something else/);
    expect(m.state().turn.number).toBe(1);

    m.land();
    // The wrong card, and a land too many, are closed as well.
    expect(() => m.cast("Barony Vampire")).toThrow(/waiting for something else/);
    expect(() => m.land()).toThrow(/waiting for something else/);
    m.cast("Muck Rats");

    // A Next card closes everything.
    expect(info().step?.id).toBe("tapped");
    expect(offered()).toEqual([]);
    expect(() => m.pass()).toThrow(/waiting for something else/);
    session.next("tapped");
    session.next("summoning-sick");

    // Pass Turn's card opens Pass Turn, and the Pass it needs.
    expect(info().allows.passTurn).toBe(true);
    expect(offered()).toEqual(["pass-priority"]);
    // Pressing Pass instead only gets there a step at a time.
    for (let i = 0; i < 30 && m.state().turn.number === 1; i += 1) m.pass();
    expect(info()).toMatchObject({ chapter: "rowans-turn", step: { id: "phase-track" } });
  });

  it("wants an attack and a block with everyone the card names in them", () => {
    const opened = openLesson("learn-commander");
    const { session, info } = opened;
    const m = coachedMoves(opened);
    m.pastTheTable();
    m.land();
    m.cast("Muck Rats");
    session.next("tapped");
    session.next("summoning-sick");
    session.room.requestPassTurn(connection);
    session.next("phase-track");
    session.next("rowan-creature");
    session.next("your-turn-again");
    m.land();
    m.cast("Cabal Evangel");

    // To combat: Pass, and not Pass Turn, which would skip the attack.
    expect(info().step?.id).toBe("first-to-combat");
    expect(info().allows.passTurn).toBe(false);
    expect(() => session.room.requestPassTurn(connection)).toThrow(/waiting for something else/);
    m.pass();

    expect(info().step?.id).toBe("first-attack");
    expect(info().allows.declareAtLeast).toBe(1);
    const offer = session.room.actionsFor(ALICE).find((a) => a.kind === "declare-attackers");
    if (offer?.kind !== "declare-attackers") throw new Error("no attack offered");
    expect(offer.eligible).toEqual([m.named("Muck Rats")]);
    expect(() => m.attack()).toThrow(/waiting for something else/);
    m.attack("Muck Rats");
    session.next("first-hit");
    session.room.requestPassTurn(connection);

    expect(info().step?.id).toBe("block");
    expect(info().allows.declareAtLeast).toBe(1);
    expect(() => session.room.dispatch(connection, { type: "declare-blockers", player: ALICE, blocks: [] })).toThrow(/waiting for something else/);
    m.block("Cabal Evangel", "Dwarven Trader");
    session.next("block-result");
    session.next("graveyard");

    m.land();
    m.cast("Kalakscion, Hunger Tyrant", "command");
    session.next("commander-rules");
    m.pass();
    // Its commander can't attack yet; one creature of two isn't enough.
    expect(info().allows.declareAtLeast).toBe(2);
    expect(() => m.attack("Muck Rats")).toThrow(/waiting for something else/);
    expect(() => m.attack("Kalakscion, Hunger Tyrant", "Muck Rats")).toThrow(/waiting for something else/);
    m.attack("Muck Rats", "Cabal Evangel");
    expect(info().step?.id).toBe("third-pass");
  });

  it("holds the game under a card being read, so nothing happens behind it", () => {
    const opened = openLesson("learn-commander");
    const { session, info } = opened;
    const m = coachedMoves(opened);
    m.pastTheTable();
    m.land();
    m.cast("Muck Rats");
    session.next("tapped");
    session.next("summoning-sick");
    session.room.requestPassTurn(connection);

    // Rowan's main phase, with Rowan's land still in hand until Next.
    expect(info().step?.id).toBe("phase-track");
    const rowansLands = (): number => m.state().zones.shared.battlefield.filter((id) => m.state().objects[id].cardName === "Mountain").length;
    expect(rowansLands()).toBe(0);
    const seq = m.state().eventSeq;
    session.room.resume();
    expect(m.state().eventSeq).toBe(seq);
    session.next("phase-track");
    expect(rowansLands()).toBe(1);
    // And its next card stops the game again, before Rowan's turn runs on.
    expect(info().step?.id).toBe("rowan-creature");
    expect(m.state().turn.number).toBe(2);
  });

  it("offers a retry only once there's something to undo, and rewinds to the chapter's start", () => {
    const opened = openLesson("learn-commander");
    const { session, info } = opened;
    const m = coachedMoves(opened);
    m.pastTheTable();
    m.land();
    expect(info().step?.id).toBe("cast-rats");
    expect(info().canRetry).toBe(true);
    const before = session.room;
    session.retry();

    expect(session.room).not.toBe(before);
    expect(session.room.seatOf(connection)).toBe(ALICE);
    expect(session.room.frameSeq).toBeGreaterThan(before.frameSeq);
    expect(info()).toMatchObject({ chapter: "mana", step: { id: "first-land" }, canRetry: false });
    expect(info().goals.every((g) => !g.done)).toBe(true);
    expect(m.state().zones.shared.battlefield.some((id) => m.state().objects[id].cardName === "Swamp")).toBe(false);

    // And the chapter plays on from there as it would have.
    m.land();
    m.cast("Muck Rats");
    expect(info().step?.id).toBe("tapped");
  });
});

describe("a tutorial room", () => {
  it("tours the board: commander damage and tax on the board, Next cards, and a flashback cast from the graveyard", () => {
    const { session, info } = openLesson("board-tour");
    const s = session.room.game.state;
    // The board says what the cards point at: 6 from Rowan's Krenko, and
    // Marwyn cast once already.
    const krenko = s.zones.shared.battlefield.find((id) => s.objects[id].cardName === "Krenko, Mob Boss")!;
    expect(s.players[ALICE].commanderDamageTaken).toEqual({ [krenko]: 6 });
    expect(s.players[ALICE].commanderCastCounts).toEqual({ "Marwyn, the Nurturer": 1 });
    expect(s.turn).toMatchObject({ number: 5, step: "precombat-main" });
    expect(s.turnOrder[s.turn.activePlayerIndex]).toBe(ALICE);

    const steps = BOARD_TOUR.chapters[0].steps;
    const nextUntil = (id: string): void => {
      for (const step of steps.slice(steps.findIndex((s) => s.id === info().step?.id), steps.findIndex((s) => s.id === id))) {
        expect(info().step).toMatchObject({ id: step.id, advance: "next" });
        session.next(step.id);
      }
    };
    nextUntil("cast-from-hand");
    expect(info().step).toMatchObject({ id: "cast-from-hand", advance: "goal", anchor: "card:Grizzly Bears" });
    const bears = idNamed(session.room.game.state, "Grizzly Bears", "hand");
    session.room.dispatch(connection, { type: "cast-spell", player: ALICE, card: bears, targets: [] });
    expect(info().step).toMatchObject({ id: "flashback", advance: "goal", anchor: "zone:graveyard:me" });
    expect(() => session.next("flashback")).toThrow(/goals/);
    // Cast from the graveyard, as the zone viewer's Cast button does.
    const thinkTwice = idNamed(session.room.game.state, "Think Twice", "graveyard");
    session.room.dispatch(connection, { type: "cast-spell", player: ALICE, card: thinkTwice, targets: [], via: "flashback" });
    expect(info().step?.id).toBe("phase-track");
    // Paid for out of what the Bears left. Alice kept priority after each
    // cast (rule 117.3c), so both are on the stack, Think Twice on top.
    const after = session.room.game.state;
    expect(after.zones.shared.stack.map((id) => after.objects[id].cardName)).toEqual(["Grizzly Bears", "Think Twice"]);

    nextUntil("done");
    session.next("done");
    expect(info()).toMatchObject({ complete: true, step: null });
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
    send({ type: "tutorial-create", lesson: { id: "learn-commander" }, hostToken: "h" });
    const n = await next();
    expect(n.type).toBe("error");
  });

  it("opens a lesson by id on a server without --builder, and moves on with Next", async () => {
    const { next, send } = await connect();
    send({ type: "tutorial-create", lesson: "learn-commander", hostToken: "h" });
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
    // A card being read leaves nothing to do.
    expect(first.actions).toEqual([]);
    // No library card is visible, Rowan's or alice's: the lesson says
    // where it stands, never what its board holds.
    expect(Object.values(first.view.objects).filter((o) => (o as { zone?: string }).zone === "library")).toEqual([]);
    expect(JSON.stringify(first.tutorial)).not.toMatch(/library|Dwarven Trader/);

    send({ type: "tutorial-next", roomId, step: "welcome" });
    const second = await nextState(next);
    expect(second.seq).toBeGreaterThan(first.seq);
    expect(second.tutorial?.step?.id).toBe("life");

    send({ type: "tutorial-retry", roomId });
    const rewound = await nextState(next);
    expect(rewound.seq).toBeGreaterThan(second.seq);
    expect(rewound.tutorial).toMatchObject({ chapter: "table", step: { id: "welcome" } });
  });

  it("sends a client that keeps the event log the whole of it again after a retry", async () => {
    const { next, send } = await connect();
    send({ type: "event-deltas" });
    send({ type: "tutorial-create", lesson: "learn-commander", hostToken: "h" });
    const created = await next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    const roomId = created.roomId;
    send({ type: "join-room", roomId, hostToken: "h" });
    await next();
    send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "t" });
    const first = await nextState(next);
    expect(first.eventsFrom).toBe(0);
    // On through the table's cards to the land.
    let sent = first.view.events.length;
    let second = first;
    for (const step of ["welcome", "life", "hand", "read-a-card", "command-zone", "library"]) {
      send({ type: "tutorial-next", roomId, step });
      second = await nextState(next);
      expect(second.eventsFrom).toBe(sent);
      sent += second.view.events.length;
    }

    // The land goes down: only its events come.
    const land = second.actions.find((a) => a.kind === "play-land");
    if (land?.kind !== "play-land") throw new Error("no land to play");
    send({ type: "dispatch", roomId, action: { type: "play-land", player: ALICE, card: land.card } });
    const played = await nextState(next);
    expect(played.eventsFrom).toBe(sent);
    expect(played.view.events.some((e) => e.type === "land-played")).toBe(true);

    // Back to the chapter's start: a new room under the code, its log (no
    // longer than what was sent) sent whole — the client finds nothing in it
    // to animate, as before.
    send({ type: "tutorial-retry", roomId });
    const rewound = await nextState(next);
    expect(rewound.eventsFrom).toBe(0);
    expect(rewound.view.events.length).toBeLessThanOrEqual(played.eventsFrom! + played.view.events.length);
  });
});
