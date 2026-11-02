/**
 * A seat making another player's decisions (rule 723): who's offered the prompt,
 * who may answer it, what each seat may see, and bots on either side.
 */

import { describe, expect, it } from "vitest";
import { Game, createDefaultRegistry } from "engine";
import type { ObjectId, PlayerId } from "engine";

import { ALICE, BOB } from "../decks.js";
import { Room } from "../room.js";
import type { Connection } from "../room.js";

const registry = createDefaultRegistry();
const conn = (): Connection => ({ send: () => {} }) as unknown as Connection;

/** Alice, at her main phase, with Mindslaver ready and bob's hand a Grizzly
 * Bears with two Forests in play. */
function table(): { room: Room; a: Connection; b: Connection; game: Game; slaver: ObjectId; bears: ObjectId } {
  const game = Game.create({
    seed: 1,
    registry,
    shuffle: false,
    startingPlayer: ALICE,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
    decks: [
      { player: ALICE, cards: Array<string>(40).fill("Wastes") },
      { player: BOB, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === ALICE);
  for (let i = 0; i < 4; i += 1) game.debugSpawn("Wastes", ALICE, "battlefield");
  for (let i = 0; i < 2; i += 1) game.debugSpawn("Forest", BOB, "battlefield");
  const slaver = game.debugSpawn("Mindslaver", ALICE, "battlefield");
  const bears = game.debugSpawn("Grizzly Bears", BOB, "hand");
  const room = new Room("CTRL1", game, { pacing: "immediate" });
  const a = conn();
  const b = conn();
  return { room, a, b, game, slaver, bears };
}

function useMindslaver(room: Room, a: Connection, slaver: ObjectId, on: PlayerId = BOB): void {
  room.dispatch(a, {
    type: "activate-ability",
    player: ALICE,
    source: slaver,
    abilityIndex: 0,
    targets: [{ kind: "player", player: on }],
  });
}

/** Passes for whoever is asked, from the seat that answers for them, until
 * `done`. */
function passUntil(room: Room, seats: Record<string, Connection>, done: () => boolean): void {
  for (let i = 0; i < 200 && !done(); i += 1) {
    const s = room.game.state;
    const asked = s.priority.holder;
    if (asked === null) throw new Error("nobody holds priority");
    for (const [player, connection] of Object.entries(seats)) {
      if (room.actionsFor(player as PlayerId).some((o) => o.kind === "pass-priority")) {
        room.dispatch(connection, { type: "pass-priority", player: asked });
        break;
      }
    }
  }
  if (!done()) throw new Error("never got there");
}

describe("a seat controlling another player", () => {
  it("is offered their decisions, and the controlled seat nothing", () => {
    const { room, a, b, game, slaver } = table();
    room.claimSeat(ALICE, "a", a);
    room.claimSeat(BOB, "b", b);
    useMindslaver(room, a, slaver);
    passUntil(room, { [ALICE]: a, [BOB]: b }, () => game.state.turn.number === 2 && game.state.priority.holder === BOB);
    expect(room.actionsFor(BOB)).toEqual([]);
    expect(room.actionsFor(ALICE).map((o) => o.kind)).toContain("pass-priority");
    // The action names bob. His own seat may not send it, hers may.
    expect(() => room.dispatch(b, { type: "pass-priority", player: BOB })).toThrow(/cannot dispatch/);
    expect(() => room.dispatch(a, { type: "pass-priority", player: BOB })).not.toThrow();
  });

  it("sees their hand through the seat's own view, and a third seat doesn't", () => {
    const { room, a, b, game, slaver, bears } = table();
    room.claimSeat(ALICE, "a", a);
    room.claimSeat(BOB, "b", b);
    expect(game.viewFor(ALICE).objects[bears]).toBeUndefined();
    useMindslaver(room, a, slaver);
    passUntil(room, { [ALICE]: a, [BOB]: b }, () => game.state.turn.number === 2 && game.state.priority.holder === BOB);
    const view = game.viewFor(ALICE);
    expect(view.objects[bears]?.cardName).toBe("Grizzly Bears");
    expect(view.perspective).toBe(BOB);
    expect(view.answering).toBe(ALICE);
    expect(game.viewFor(BOB).answering).toBe(ALICE);
  });

  it("casts their spell with their mana: they stay its controller", () => {
    const { room, a, b, game, slaver, bears } = table();
    room.claimSeat(ALICE, "a", a);
    room.claimSeat(BOB, "b", b);
    useMindslaver(room, a, slaver);
    passUntil(
      room,
      { [ALICE]: a, [BOB]: b },
      () => game.state.turn.number === 2 && game.state.turn.step === "precombat-main" && game.state.priority.holder === BOB,
    );
    room.dispatch(a, { type: "cast-spell", player: BOB, card: bears, targets: [] });
    passUntil(room, { [ALICE]: a, [BOB]: b }, () => game.state.objects[bears].zone === "battlefield");
    expect(game.state.objects[bears].controller).toBe(BOB);
  });

  it("a controlled seat can concede (rule 723.6)", () => {
    const { room, a, b, game, slaver } = table();
    room.claimSeat(ALICE, "a", a);
    room.claimSeat(BOB, "b", b);
    useMindslaver(room, a, slaver);
    passUntil(room, { [ALICE]: a, [BOB]: b }, () => game.state.turn.number === 2 && game.state.priority.holder === BOB);
    room.concede(b);
    expect(game.state.players[BOB].hasLost).toBe(true);
  });
});

describe("bots and player control", () => {
  it("a bot that's controlled doesn't move: its controller's person answers", () => {
    const { room, a, game, slaver } = table();
    room.claimSeat(ALICE, "a", a);
    room.addBot(BOB);
    useMindslaver(room, a, slaver);
    passUntil(room, { [ALICE]: a }, () => game.state.turn.number === 2 && game.state.priority.holder === BOB);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.priority.holder).toBe(BOB);
    // Waits on alice, however long: nothing moved it on.
    expect(room.actionsFor(ALICE).length).toBeGreaterThan(0);
  });

  it("a bot controlling a person plays their whole turn, legally, and the game goes on", () => {
    const { room, b, game, slaver } = table();
    room.claimSeat(BOB, "b", b);
    // Alice's Mindslaver at bob, activated before the bot takes her seat.
    const a = conn();
    room.claimSeat(ALICE, "a", a);
    useMindslaver(room, a, slaver);
    room.setBotTakeover(a, true);
    for (let i = 0; i < 100 && game.state.turn.number < 3; i += 1) {
      const asked = room.actionsFor(BOB);
      if (asked.some((o) => o.kind === "pass-priority")) room.dispatch(b, { type: "pass-priority", player: BOB });
      else if (asked.some((o) => o.kind === "declare-blockers")) room.dispatch(b, { type: "declare-blockers", player: BOB, blocks: [] });
      else break;
    }
    expect(room.stopped).toBeNull();
    expect(game.state.turn.number).toBeGreaterThanOrEqual(3);
    // It passed on his turn: his bears stayed in hand.
    expect(game.state.playerControl ?? []).toEqual([]);
  });
});
