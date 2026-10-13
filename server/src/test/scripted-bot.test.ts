/**
 * The scripted opponent (`scripted-bot.ts`): it makes its moves by card name
 * on the turn and step they name, once each unless they repeat; leaves the
 * rest to v1 or to passing; reads what it has already done off the event
 * log, so a bot built over a game restored from a snapshot doesn't make a
 * move twice; and plays a game the same way every time.
 */

import { describe, expect, it } from "vitest";
import { Game, asPlayerId } from "engine";
import type { GameEvent, GameState, PlayerId } from "engine";
import type { ScenarioCard, ScenarioSpec } from "protocol";
import { buildScenario } from "../builder.js";
import { Room } from "../room.js";
import type { Connection } from "../room.js";
import { ScriptedBot, scriptRegistry } from "../scripted-bot.js";
import type { OpponentScript } from "../scripted-bot.js";

const ALICE = asPlayerId("alice");
const BOB = asPlayerId("bob");

let keys = 0;
const card = (name: string, owner: PlayerId, zone: ScenarioCard["zone"] = "battlefield"): ScenarioCard => ({
  key: `k${(keys += 1)}`,
  name,
  owner,
  zone,
});

/** Alice on turn 1 with an untapped Forest (so she keeps her windows while
 * something is on the stack); bob with four Forests, an Elvish Mystic, and
 * two Grizzly Bears in hand. */
const board = (extra: ScenarioCard[] = []): ScenarioSpec => ({
  seats: [
    { player: ALICE, life: 40, bot: false },
    { player: BOB, life: 40, bot: true },
  ],
  cards: [
    card("Forest", ALICE),
    ...Array.from({ length: 4 }, () => card("Forest", BOB)),
    card("Elvish Mystic", BOB),
    card("Grizzly Bears", BOB, "hand"),
    card("Grizzly Bears", BOB, "hand"),
    ...extra,
  ],
  active: ALICE,
  step: "precombat-main",
  libraryFill: 30,
});

const connection = { send: () => {} } as unknown as Connection;

function seat(game: Game, script: OpponentScript): Room {
  const room = new Room("SCRPT", game, {
    pacing: "immediate",
    botController: (player) => new ScriptedBot(player, script, scriptRegistry()),
  });
  room.claimSeat(ALICE, "alice-token", connection);
  room.addBot(BOB);
  room.start();
  return room;
}

/** Alice passes every window and declares no attackers or blockers, until
 * `until` holds of the game. */
function aliceWaits(room: Room, until: (s: GameState) => boolean): void {
  for (let i = 0; i < 500; i += 1) {
    const s = room.game.state;
    if (until(s) || s.result.over) return;
    if (s.awaiting?.kind === "blockers" && s.awaiting.player === ALICE) {
      room.dispatch(connection, { type: "declare-blockers", player: ALICE, blocks: [] });
    } else if (s.awaiting?.kind === "attackers" && s.awaiting.player === ALICE) {
      room.dispatch(connection, { type: "declare-attackers", player: ALICE, attackers: [] });
    } else if (s.awaiting === null && s.priority.holder === ALICE) {
      room.dispatch(connection, { type: "pass-priority", player: ALICE });
    } else {
      throw new Error(`alice can't wait here: ${s.turn.step}, ${s.awaiting?.kind ?? "priority"}`);
    }
  }
  throw new Error("never got there");
}

const named = (s: GameState, id: string): string => s.objects[id as never]?.cardName ?? "";
const castsBy = (s: GameState, player: PlayerId, name: string): number =>
  s.eventLog.filter((e) => e.type === "spell-cast" && e.player === player && named(s, e.object) === name).length;
const turnOf = (s: GameState): number => s.turn.number;

describe("a scripted opponent", () => {
  it("casts and attacks by name on the turn it's told to, once, and otherwise passes", () => {
    const room = seat(buildScenario(board(), scriptRegistry()).game, {
      otherwise: "pass",
      moves: [
        { do: "cast", card: "Grizzly Bears", on: { turn: 2 } },
        { do: "attack", card: "Elvish Mystic", at: "alice", on: { turn: 2 } },
      ],
    });
    aliceWaits(room, (s) => turnOf(s) === 5);
    const s = room.game.state;
    // One Bears, on turn 2, though the other was castable every turn after.
    expect(castsBy(s, BOB, "Grizzly Bears")).toBe(1);
    const attacks = s.eventLog.filter(
      (e): e is Extract<GameEvent, { type: "attackers-declared" }> => e.type === "attackers-declared" && e.player === BOB,
    );
    expect(attacks.map((e) => e.attackers.map((id) => named(s, id)))).toEqual([["Elvish Mystic"]]);
    expect(s.players[ALICE].life).toBe(39);
  });

  it("repeats a move that says so, and blocks only with the creatures it names", () => {
    const room = seat(buildScenario(board([card("Hill Giant", ALICE)]), scriptRegistry()).game, {
      otherwise: "pass",
      moves: [
        { do: "cast", card: "Grizzly Bears", repeat: true },
        { do: "block", card: "Grizzly Bears", at: "Hill Giant", repeat: true },
      ],
    });
    // Bob casts a Bears each main phase he can: both on turn 2.
    aliceWaits(room, (s) => turnOf(s) === 3 && s.turn.step === "precombat-main");
    expect(castsBy(room.game.state, BOB, "Grizzly Bears")).toBe(2);
    // Alice attacks with the Hill Giant; both Bears block it, the Mystic doesn't.
    aliceWaits(room, (s) => s.awaiting?.kind === "attackers");
    const giant = room.game.state.zones.shared.battlefield.find((id) => named(room.game.state, id) === "Hill Giant")!;
    room.dispatch(connection, { type: "declare-attackers", player: ALICE, attackers: [{ attacker: giant, defender: BOB }] });
    aliceWaits(room, (st) => st.eventLog.some((e) => e.type === "attacker-blocked"));
    const s = room.game.state;
    const blockers = s.eventLog
      .filter((e): e is Extract<GameEvent, { type: "blocker-declared" }> => e.type === "blocker-declared")
      .map((e) => named(s, e.blocker));
    expect(blockers).toEqual(["Grizzly Bears", "Grizzly Bears"]);
  });

  it("reads what it has done off the log: rebuilt over a snapshot, it doesn't cast again", () => {
    const script: OpponentScript = { otherwise: "pass", moves: [{ do: "cast", card: "Grizzly Bears" }] };
    const room = seat(buildScenario(board(), scriptRegistry()).game, script);
    // Bob's Bears on the stack, alice holding priority over it.
    aliceWaits(room, (s) => s.zones.shared.stack.length > 0);
    expect(castsBy(room.game.state, BOB, "Grizzly Bears")).toBe(1);
    const again = seat(Game.fromSnapshot(room.game.snapshot(), { registry: scriptRegistry() }), script);
    aliceWaits(again, (s) => turnOf(s) === 5);
    expect(castsBy(again.game.state, BOB, "Grizzly Bears")).toBe(1);
  });

  it("leaves the rest to v1, and plays the same game every time", () => {
    const play = (): string[] => {
      const spec = board([card("Llanowar Elves", BOB, "library"), card("Hill Giant", BOB, "library")]);
      const room = seat(buildScenario(spec, scriptRegistry()).game, {
        moves: [{ do: "attack", card: "Elvish Mystic", at: "alice", on: { turn: 2 } }],
      });
      aliceWaits(room, (s) => turnOf(s) === 7);
      return room.game.state.eventLog.map((e) => `${e.type}:${"object" in e && e.object !== undefined ? named(room.game.state, e.object) : ""}`);
    };
    const first = play();
    // v1 cast the Bears the script never mentioned.
    expect(first.filter((e) => e === "spell-cast:Grizzly Bears").length).toBeGreaterThan(0);
    expect(play()).toEqual(first);
  });
});
