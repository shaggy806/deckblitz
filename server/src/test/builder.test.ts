/**
 * The scenario builder (`builder.ts`): a board built from a scenario triggers
 * nothing, lies as the scenario says, and plays from where it stands; a game
 * comes back as a scenario; and a builder room keeps its developer seated,
 * and its frames numbered upward, across every rebuild.
 */

import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { asPlayerId } from "engine";
import type { ObjectId } from "engine";
import type { ScenarioCard, ScenarioSpec, ServerMessage } from "protocol";
import { buildScenario, defaultScenario, snapshotScenario, validateScenario } from "../builder.js";
import { RoomManager } from "../room-manager.js";
import { attachRoomServer } from "../ws-server.js";

const ALICE = asPlayerId("alice");
const BOB = asPlayerId("bob");

const card = (key: string, name: string, extra: Partial<ScenarioCard> = {}): ScenarioCard => ({
  key,
  name,
  owner: ALICE,
  zone: "battlefield",
  ...extra,
});

const spec = (cards: ScenarioCard[], extra: Partial<ScenarioSpec> = {}): ScenarioSpec => ({
  ...defaultScenario(),
  cards,
  ...extra,
});

const idOf = (objects: Record<ObjectId, string>, key: string): ObjectId => {
  const id = Object.entries(objects).find(([, k]) => k === key)?.[0];
  if (id === undefined) throw new Error(`no object for ${key}`);
  return id as ObjectId;
};

describe("buildScenario", () => {
  it("places every card where the scenario says, on the step it says, triggering nothing", () => {
    const { game, objects } = buildScenario(
      spec(
        [
          card("warden", "Soul Warden"),
          card("bears", "Grizzly Bears", { tapped: true }),
          card("wurm", "Craw Wurm", { sick: true, counters: { "+1/+1": 2 } }),
          card("aura", "Pacifism", { attachedTo: "wurm" }),
          card("soldier", "Soldier Token", { owner: BOB }),
          card("bolt", "Lightning Bolt", { zone: "hand" }),
          card("top", "Hill Giant", { zone: "library" }),
          card("second", "Craw Wurm", { zone: "library" }),
          card("dead", "Blood Artist", { owner: BOB, zone: "graveyard" }),
          card("gone", "Lotus Cobra", { zone: "exile" }),
          card("cmdr", "Chandra, Acolyte of Flame", { owner: BOB, commander: true }),
        ],
        { active: BOB, step: "begin-combat" },
      ),
    );
    const s = game.state;
    expect(s.turnOrder[s.turn.activePlayerIndex]).toBe(BOB);
    expect(s.turn.step).toBe("begin-combat");
    expect(s.priority.holder).toBe(BOB);
    // Soul Warden saw four creatures enter, and gained nothing.
    expect(s.players[ALICE].life).toBe(40);
    expect(s.pendingTriggers).toEqual([]);
    expect(s.zones.shared.stack).toEqual([]);

    expect(s.objects[idOf(objects, "bears")].tapped).toBe(true);
    expect(s.objects[idOf(objects, "warden")].summoningSick).toBe(false);
    const wurm = s.objects[idOf(objects, "wurm")];
    expect(wurm.summoningSick).toBe(true);
    expect(wurm.counters["+1/+1"]).toBe(2);
    expect(s.objects[idOf(objects, "aura")].attachedTo).toBe(wurm.id);
    const soldier = s.objects[idOf(objects, "soldier")];
    expect(soldier.isToken).toBe(true);
    expect(soldier.controller).toBe(BOB);
    // A hand is only what the scenario puts in it; a library is listed top first.
    expect(s.zones.perPlayer[ALICE].hand).toEqual([idOf(objects, "bolt")]);
    expect(s.zones.perPlayer[BOB].hand).toEqual([]);
    expect(s.zones.perPlayer[ALICE].library.slice(0, 2)).toEqual([idOf(objects, "top"), idOf(objects, "second")]);
    expect(s.zones.perPlayer[BOB].graveyard).toEqual([idOf(objects, "dead")]);
    expect(s.zones.shared.exile).toEqual([idOf(objects, "gone")]);
    const chandra = s.objects[idOf(objects, "cmdr")];
    expect(chandra.isCommander).toBe(true);
    expect(chandra.zone).toBe("battlefield");
    expect(chandra.counters.loyalty).toBe(4);
  });

  it("sets life and poison, and a commander left in the command zone stays there", () => {
    const { game, objects } = buildScenario(
      spec([card("cmdr", "Chandra, Acolyte of Flame", { zone: "command", commander: true })], {
        seats: [
          { player: ALICE, life: 7, poison: 3, bot: false },
          { player: BOB, life: 40, bot: true },
        ],
      }),
    );
    expect(game.state.players[ALICE].life).toBe(7);
    expect(game.state.players[ALICE].counters.poison).toBe(3);
    expect(game.state.zones.shared.command).toContain(idOf(objects, "cmdr"));
  });

  it("refuses a board it can't build", () => {
    expect(() => validateScenario(spec([card("x", "Not A Real Card")]))).toThrow(/no card named/);
    expect(() => validateScenario(spec([card("t", "Soldier Token", { zone: "hand" })]))).toThrow(/token/);
    expect(() => validateScenario(spec([card("a", "Hill Giant"), card("a", "Hill Giant")]))).toThrow(/unique/);
    expect(() => validateScenario(spec([card("p", "Pacifism", { attachedTo: "nobody" })]))).toThrow(/attached/);
    expect(() => validateScenario(spec([card("h", "Hill Giant", { zone: "command" })]))).toThrow(/command zone/);
    // A sideboard is never beside a commander (rule 903.5e).
    expect(() =>
      validateScenario(
        spec([card("c", "Legion Angel", { zone: "command", commander: true }), card("s", "Forest", { zone: "sideboard" })]),
      ),
    ).toThrow(/no sideboards/);
    expect(() => validateScenario(spec([], { step: "declare-attackers" as never }))).toThrow(/step/);
  });

  it("comes back from a game as the same scenario, give or take keys", () => {
    const original = spec([
      card("bears", "Grizzly Bears", { tapped: true, counters: { "+1/+1": 1 } }),
      card("aura", "Pacifism", { attachedTo: "bears" }),
      card("bolt", "Lightning Bolt", { zone: "hand" }),
      card("top", "Hill Giant", { zone: "library" }),
      // Each seat's zones in turn: alice's sideboard before bob's graveyard.
      card("wish", "Demonic Tutor", { zone: "sideboard" }),
      card("dead", "Blood Artist", { owner: BOB, zone: "graveyard" }),
    ]);
    const { game } = buildScenario(original);
    const back = snapshotScenario(game, original);
    const shape = (s: ScenarioSpec) =>
      s.cards.map(({ key: _key, attachedTo, ...rest }) => ({ ...rest, attached: attachedTo !== undefined }));
    expect(shape(back)).toEqual(shape(original));
    expect(back.libraryFill).toBe(original.libraryFill);
    expect(back.active).toBe(original.active);
    expect(back.step).toBe(original.step);
    // And it builds again.
    expect(() => buildScenario(back)).not.toThrow();
    // A scenario without a turn number, damage or cast counts comes back
    // without them: an old saved scenario stays as it was.
    expect(back.turn).toBeUndefined();
    expect(back.cards.some((c) => c.damage !== undefined || c.casts !== undefined)).toBe(false);
  });
});

describe("the turn number, a commander's tax and damage", () => {
  const handAtMain = (built: ReturnType<typeof buildScenario>, player = ALICE) => {
    const s = built.game.state;
    const turn = s.turn.number;
    built.game.advanceUntil((st) => st.turn.number === turn && st.turn.step === "precombat-main");
    return s.zones.perPlayer[player].hand.map((id) => s.objects[id].cardName);
  };

  it("starts on the turn it says, the active player's, and nobody skips a draw past turn 1", () => {
    const top = card("top", "Hill Giant", { zone: "library" });
    const five = buildScenario(spec([top], { turn: 5, step: "upkeep" }));
    const s = five.game.state;
    expect(s.turn.number).toBe(5);
    expect(s.turnOrder[s.turn.activePlayerIndex]).toBe(ALICE);
    expect(s.turn.step).toBe("upkeep");
    expect(s.priority.holder).toBe(ALICE);
    // Turns 1, 3 and 5 are alice's: she started, and this is round 3.
    expect(s.startingPlayer).toBe(ALICE);
    expect(s.turn.round).toBe(3);
    expect(s.players[ALICE].lastTurnTaken).toBe(5);
    // Rule 103.8a skips only the starting player's first draw.
    expect(handAtMain(five)).toEqual(["Hill Giant"]);

    // On turn 1 the starting player skips it, as before.
    expect(handAtMain(buildScenario(spec([top], { step: "upkeep" })))).toEqual([]);
    expect(handAtMain(buildScenario(spec([top], { turn: 1, step: "upkeep" })))).toEqual([]);

    // Turn 4 is bob's when alice started: turns 2 and 4 are his.
    const four = buildScenario(spec([card("top", "Hill Giant", { owner: BOB, zone: "library" })], { turn: 4, active: BOB, step: "upkeep" }));
    expect(four.game.state.turn.number).toBe(4);
    expect(four.game.state.startingPlayer).toBe(ALICE);
    expect(four.game.state.turn.round).toBe(2);
    expect(handAtMain(four, BOB)).toEqual(["Hill Giant"]);

    // At three seats, turn 6 is bob's when carol started (carol 1, alice 2,
    // bob 3, carol 4, alice 5, bob 6), in round 2.
    const three = buildScenario(
      spec([], {
        seats: [ALICE, BOB, asPlayerId("carol")].map((player) => ({ player, life: 40, bot: false })),
        active: BOB,
        turn: 6,
      }),
    );
    expect(three.game.state.startingPlayer).toBe(asPlayerId("carol"));
    expect(three.game.state.turn.round).toBe(2);
  });

  it("past turn 1, a permanent that isn't summoning sick entered on an earlier turn", () => {
    const { game, objects } = buildScenario(
      spec([card("bears", "Grizzly Bears"), card("wurm", "Craw Wurm", { sick: true })], { turn: 3 }),
    );
    expect(game.state.objects[idOf(objects, "bears")].enteredBattlefieldOnTurn).toBe(2);
    expect(game.state.objects[idOf(objects, "wurm")].enteredBattlefieldOnTurn).toBe(3);
    // Turn 1, as it always was: everything placed entered this turn.
    const one = buildScenario(spec([card("bears", "Grizzly Bears")]));
    expect(one.game.state.objects[idOf(one.objects, "bears")].enteredBattlefieldOnTurn).toBe(1);
  });

  it("adds {2} to a commander's cost for each cast from the command zone it's had", () => {
    const board = (lands: number, casts?: number) =>
      spec([
        card("cmdr", "Chandra, Acolyte of Flame", { zone: "command", commander: true, ...(casts !== undefined ? { casts } : {}) }),
        ...Array.from({ length: lands }, (_, i) => card(`m${i}`, "Mountain")),
      ]);
    const castable = (s: ScenarioSpec) =>
      buildScenario(s)
        .game.legalActions(ALICE)
        .some((a) => a.kind === "cast-spell" && a.cardName === "Chandra, Acolyte of Flame");
    // {1}{R}{R}, and {3}{R}{R} after one cast.
    expect(castable(board(3))).toBe(true);
    expect(castable(board(3, 0))).toBe(true);
    expect(castable(board(4, 1))).toBe(false);
    expect(castable(board(5, 1))).toBe(true);
    const { game } = buildScenario(board(0, 2));
    expect(game.state.players[ALICE].commanderCastCounts).toEqual({ "Chandra, Acolyte of Flame": 2 });
    // The client draws the tax from the count each seat sees.
    expect(game.viewFor(BOB).players[ALICE].commanderCastCounts).toEqual({ "Chandra, Acolyte of Flame": 2 });
  });

  it("starts a player with the commander damage a commander has dealt them, and keeps it through a snapshot", () => {
    const original = spec([
      card("cmdr", "Chandra, Acolyte of Flame", { owner: BOB, commander: true, commanderDamage: { [ALICE]: 6 } }),
    ]);
    const { game, objects } = buildScenario(original);
    const id = idOf(objects, "cmdr");
    expect(game.state.players[ALICE].commanderDamageTaken).toEqual({ [id]: 6 });
    expect(game.state.players[BOB].commanderDamageTaken).toEqual({});
    // Every seat sees it: the chip on Alice's panel is drawn from it.
    expect(game.viewFor(BOB).players[ALICE].commanderDamageTaken).toMatchObject([{ commander: id, amount: 6 }]);
    const back = snapshotScenario(game, original);
    expect(back.cards.find((c) => c.commander === true)?.commanderDamage).toEqual({ [ALICE]: 6 });

    expect(() => validateScenario(spec([card("b", "Grizzly Bears", { commanderDamage: { [ALICE]: 1 } })]))).toThrow(/commander/);
    const dealt = (commanderDamage: Record<string, number>) =>
      validateScenario(spec([card("c", "Chandra, Acolyte of Flame", { commander: true, commanderDamage })]));
    expect(() => dealt({ [ALICE]: 21 })).toThrow(/0-20/);
    expect(() => dealt({ [ALICE]: -1 })).toThrow(/0-20/);
    expect(() => dealt({ nobody: 1 })).toThrow(/at the table/);
  });

  it("marks damage on a creature, which cleanup removes, and refuses damage it couldn't survive", () => {
    const built = buildScenario(spec([card("bears", "Grizzly Bears", { damage: 1 })]));
    const bears = built.game.state.objects[idOf(built.objects, "bears")];
    expect(bears.damageMarked).toBe(1);
    expect(built.game.viewFor(BOB).objects[bears.id]?.damageMarked).toBe(1);
    built.game.advanceUntil((s) => s.turn.number === 2);
    expect(built.game.state.objects[bears.id].damageMarked).toBe(0);
    expect(built.game.state.objects[bears.id].zone).toBe("battlefield");

    // Lethal (rule 704.5g) is refused, counted against the built board's toughness.
    expect(() => buildScenario(spec([card("bears", "Grizzly Bears", { damage: 2 })]))).toThrow(/would die/);
    expect(() => buildScenario(spec([card("bears", "Grizzly Bears", { damage: 2, counters: { "+1/+1": 1 } })]))).not.toThrow();
    expect(() =>
      buildScenario(spec([card("bears", "Grizzly Bears", { damage: 2 }), card("anthem", "Glorious Anthem")])),
    ).not.toThrow();
    // Indestructible survives any amount.
    const myr = buildScenario(spec([card("myr", "Darksteel Myr", { damage: 5 })]));
    expect(myr.game.state.objects[idOf(myr.objects, "myr")].damageMarked).toBe(5);
    // Only a creature has damage marked (rule 120.3e).
    expect(() => buildScenario(spec([card("anthem", "Glorious Anthem", { damage: 1 })]))).toThrow(/isn't a creature/);
  });

  it("refuses a bad turn number, cast count or damage", () => {
    for (const turn of [0, -1, 1.5, 1000]) expect(() => validateScenario(spec([], { turn }))).toThrow(/turn number/);
    expect(() => validateScenario(spec([card("b", "Grizzly Bears", { damage: -1 })]))).toThrow(/damage/);
    expect(() => validateScenario(spec([card("b", "Grizzly Bears", { damage: 0.5 })]))).toThrow(/damage/);
    expect(() => validateScenario(spec([card("b", "Grizzly Bears", { zone: "hand", damage: 1 })]))).toThrow(/permanent/);
    expect(() => validateScenario(spec([card("b", "Grizzly Bears", { casts: 1 })]))).toThrow(/commander/);
    expect(() =>
      validateScenario(spec([card("c", "Chandra, Acolyte of Flame", { zone: "command", commander: true, casts: -1 })])),
    ).toThrow(/cast count/);
    expect(() =>
      validateScenario(spec([card("c", "Chandra, Acolyte of Flame", { zone: "command", commander: true, casts: 100 })])),
    ).toThrow(/cast count/);
  });

  it("comes back from a game with the turn, the damage and the cast counts", () => {
    const original = spec(
      [
        card("bears", "Grizzly Bears", { damage: 1 }),
        card("cmdr", "Chandra, Acolyte of Flame", { zone: "command", commander: true, casts: 3 }),
        card("theirs", "Chandra, Acolyte of Flame", { owner: BOB, commander: true, casts: 1, counters: { loyalty: 4 } }),
      ],
      { turn: 7 },
    );
    const { game } = buildScenario(original);
    const back = snapshotScenario(game, original);
    expect(back.turn).toBe(7);
    const shape = (s: ScenarioSpec) =>
      s.cards.map(({ key: _key, ...rest }) => rest).sort((a, b) => (a.owner + a.zone).localeCompare(b.owner + b.zone));
    expect(shape(back)).toEqual(shape(original));
    const again = buildScenario(back);
    expect(again.game.state.turn.number).toBe(7);
    expect(again.game.state.players[BOB].commanderCastCounts).toEqual({ "Chandra, Acolyte of Flame": 1 });
  });

  it("leaves behind damage only an effect it can't say kept from being lethal", () => {
    // A 4/4 Bears with 3 damage — and then the counters that made it a 4/4
    // are gone, as a turn-long pump would be from a scenario.
    const original = spec([card("bears", "Grizzly Bears", { damage: 3, counters: { "+1/+1": 2 } })]);
    const { game, objects } = buildScenario(original);
    game.state.objects[idOf(objects, "bears")].counters = {};
    const back = snapshotScenario(game, original);
    expect(back.cards).toEqual([{ key: "c1", name: "Grizzly Bears", owner: ALICE, zone: "battlefield" }]);
    expect(() => buildScenario(back)).not.toThrow();
  });
});

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

describe("a scenario builder room", () => {
  let wss: WebSocketServer;
  let port: number;
  let sockets: WebSocket[];

  const open = async (builder: boolean) => {
    wss = new WebSocketServer({ port: 0 });
    attachRoomServer(wss, new RoomManager(), { builder });
    await new Promise<void>((resolve) => wss.once("listening", resolve));
    port = (wss.address() as AddressInfo).port;
  };

  beforeEach(() => {
    sockets = [];
  });

  afterEach(async () => {
    for (const ws of sockets) ws.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  const connect = async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise((resolve, reject) => {
      ws.once("open", resolve);
      ws.once("error", reject);
    });
    sockets.push(ws);
    return { ws, next: messageQueue(ws), send: (m: object) => ws.send(JSON.stringify(m)) };
  };

  /** The next `state` push, skipping anything else. */
  const nextState = async (next: () => Promise<ServerMessage>) => {
    for (;;) {
      const m = await next();
      if (m.type === "error") throw new Error(m.message);
      if (m.type === "state") return m;
    }
  };

  it("isn't there on a server started without --builder", async () => {
    await open(false);
    const { next, send } = await connect();
    send({ type: "builder-create", hostToken: "h" });
    const m = await next();
    expect(m.type === "error" && m.message).toMatch(/--builder/);
  });

  it("builds frozen, keeps its developer seated and frames numbered upward, then plays", async () => {
    await open(true);
    const { next, send } = await connect();
    send({ type: "builder-create", hostToken: "h" });
    const created = await next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    const roomId = created.roomId;
    send({ type: "join-room", roomId, hostToken: "h" });
    expect((await next()).type).toBe("room-joined");
    send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "t" });
    const first = await nextState(next);
    expect(first.builder?.mode).toBe("build");
    expect(first.actions).toEqual([]);

    const board = spec([card("bears", "Grizzly Bears"), card("bolt", "Lightning Bolt", { zone: "hand" }), card("land", "Mountain")], {
      seats: [
        { player: ALICE, life: 40, bot: false },
        { player: BOB, life: 40, bot: true },
      ],
    });
    send({ type: "builder-update", roomId, spec: board });
    const built = await nextState(next);
    expect(built.seat).toBe(ALICE);
    expect(built.seq).toBeGreaterThan(first.seq);
    expect(built.actions).toEqual([]);
    expect(Object.values(built.builder?.objects ?? {}).sort()).toEqual(["bears", "bolt", "land"]);
    const bears = Object.keys(built.builder!.objects).find((id) => built.builder!.objects[id] === "bears")!;
    expect(built.view.objects[bears as ObjectId]?.cardName).toBe("Grizzly Bears");

    // Frozen: nothing can be done on the board being built.
    send({ type: "dispatch", roomId, action: { type: "pass-priority", player: ALICE } });
    const refused = await next();
    expect(refused.type === "error" && refused.message).toMatch(/being built/);

    send({ type: "builder-start", roomId });
    const playing = await nextState(next);
    expect(playing.builder?.mode).toBe("play");
    expect(playing.seq).toBeGreaterThan(built.seq);
    expect(playing.seats.find((s) => s.player === BOB)?.isBot).toBe(true);
    expect(playing.actions.some((a) => a.kind === "cast-spell")).toBe(true);

    // Back to building from where play stands.
    send({ type: "builder-snapshot", roomId });
    let again = await nextState(next);
    while (again.builder?.mode !== "build") again = await nextState(next);
    expect(again.builder?.mode).toBe("build");
    expect(again.builder?.spec.cards.map((c) => c.name).sort()).toEqual(["Grizzly Bears", "Lightning Bolt", "Mountain"]);
  });

  it("sends a client that keeps the event log the whole of it again after every rebuild", async () => {
    await open(true);
    const { next, send } = await connect();
    send({ type: "event-deltas" });
    send({ type: "builder-create", hostToken: "h" });
    const created = await next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    const roomId = created.roomId;
    send({ type: "join-room", roomId, hostToken: "h" });
    await next();
    send({ type: "claim-seat", roomId, seat: ALICE, clientToken: "t" });
    expect((await nextState(next)).eventsFrom).toBe(0);

    // Each edit is a new room under the code, with a log of its own.
    const board = spec([card("bears", "Grizzly Bears"), card("land", "Mountain")], {
      seats: [
        { player: ALICE, life: 40, bot: false },
        { player: BOB, life: 40, bot: true },
      ],
    });
    send({ type: "builder-update", roomId, spec: board });
    const built = await nextState(next);
    expect(built.eventsFrom).toBe(0);
    send({ type: "builder-start", roomId });
    const playing = await nextState(next);
    expect(playing.eventsFrom).toBe(0);

    // Within one room, only what's new.
    send({ type: "dispatch", roomId, action: { type: "pass-priority", player: ALICE } });
    const passed = await nextState(next);
    expect(passed.eventsFrom).toBe(playing.view.events.length);

    send({ type: "builder-stop", roomId });
    let again = await nextState(next);
    while (again.builder?.mode !== "build") again = await nextState(next);
    expect(again.eventsFrom).toBe(0);
  });

  it("only lets its host change the board", async () => {
    await open(true);
    const host = await connect();
    host.send({ type: "builder-create", hostToken: "h" });
    const created = await host.next();
    if (created.type !== "room-created") throw new Error(`got ${created.type}`);
    host.send({ type: "join-room", roomId: created.roomId, hostToken: "h" });
    await host.next();
    host.send({ type: "claim-seat", roomId: created.roomId, seat: ALICE, clientToken: "t" });
    await nextState(host.next);
    const other = await connect();
    other.send({ type: "join-room", roomId: created.roomId });
    await other.next();
    other.send({ type: "builder-update", roomId: created.roomId, spec: defaultScenario() });
    const m = await other.next();
    expect(m.type === "error" && m.message).toMatch(/only the host/);
  });
});
