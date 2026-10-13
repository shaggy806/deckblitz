// dev-rooms' rooms and command ops, wherever the rooms run: a room shard
// (`ShardConfig.setup`, with `dev-rooms.mjs --shards N`) or the main thread
// (`--shards 0`). `dev-rooms.mjs` keeps the sockets and the command port;
// this builds the scenario boards from scripts/dev-scenarios.mjs into the
// shard's own `RoomManager` and answers the commands for its rooms.
//
//   setup({ manager, registry, index, count }) → { control(cmd) }
//
// With `count` shards, shard `index` serves every `count`-th scenario, so
// each board lives on exactly one shard (main routes a code to it from the
// shard's `ready`). `control(cmd)` runs one command-port op and returns
// `{ result, dropConnections? }` — `reset` asks the caller to drop every
// socket, since the rebuilt room has every seat free again — or throws.

import { COMMANDER_RULES, Game } from "engine";
import { Room } from "../dist/room.js";
import { DEFAULT_CAPTURE_DIR, captureLogs } from "../dist/capture.js";
import { ScriptedBot } from "../dist/scripted-bot.js";
import SCENARIOS, { COMMANDERS } from "./dev-scenarios.mjs";

const BASICS = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
const basics = (n) => Array.from({ length: n }, (_, i) => BASICS[i % BASICS.length]);

/**
 * A scenario's `bots` entry as a script for `ScriptedBot` (`src/scripted-bot.ts`),
 * so the decision under test comes up on cue: the bot passes every priority
 * window except for its scripted casts, each once, on its own precombat main;
 * attacks only if told whom, every turn, with everything that can; and blocks
 * only the named attacker, with every creature of the named ones that can.
 * Anything else it's asked (a discard, a sacrifice) goes to v1's answer.
 */
const scriptOf = (bot = {}) => ({
  otherwise: "pass",
  moves: [
    ...(bot.casts ?? []).map(({ name, target }) => ({ do: "cast", card: name, ...(target !== undefined ? { target } : {}) })),
    ...(bot.attack ? [{ do: "attack", at: bot.attack, repeat: true }] : []),
    ...(bot.block ? [{ do: "block", card: bot.block.with, at: bot.block.attacker, repeat: true }] : []),
  ],
});

function buildGame(scenario) {
  const players = scenario.players;
  const game = Game.create({
    seed: 1,
    shuffle: false,
    rules: COMMANDER_RULES,
    decks: players.map((player) => ({
      player,
      cards: basics(60),
      commanders: [scenario.commanders?.[player] ?? COMMANDERS[player]],
    })),
  });
  const start = scenario.start ?? "precombat-main";
  game.advanceUntil((s) => s.turn.step === start && s.priority.holder === players[0]);

  const ids = {};
  for (const player of players) {
    for (const land of basics(scenario.lands?.[player] ?? 0)) {
      game.debugSpawn(land, player, "battlefield", { summoningSick: false });
    }
    ids[player] = (scenario.battlefield?.[player] ?? []).map((name) =>
      game.debugSpawn(name, player, "battlefield", { summoningSick: false }),
    );
    for (const name of scenario.hand?.[player] ?? []) game.debugSpawn(name, player, "hand");
    if (scenario.life?.[player] !== undefined) game.state.players[player].life = scenario.life[player];
  }
  scenario.setup?.(game, ids);
  return game;
}

const describe = (game, id) => {
  const o = game.state.objects[id];
  const bits = [o.cardName];
  if (o.tapped) bits.push("tapped");
  if (o.counters?.loyalty !== undefined) bits.push(`loyalty ${o.counters.loyalty}`);
  if (o.attacking) bits.push(`attacking ${o.attacking}`);
  return `${id} ${bits.join(", ")}`;
};

function stateOf(game) {
  const s = game.state;
  const players = {};
  for (const p of s.turnOrder) {
    players[p] = {
      life: s.players[p].life,
      hand: s.zones.perPlayer[p].hand.map((id) => describe(game, id)),
      battlefield: s.zones.shared.battlefield
        .filter((id) => s.objects[id].controller === p && !BASICS.includes(s.objects[id].cardName))
        .map((id) => describe(game, id)),
      lands: s.zones.shared.battlefield.filter(
        (id) => s.objects[id].controller === p && BASICS.includes(s.objects[id].cardName),
      ).length,
      command: s.zones.shared.command
        .filter((id) => s.objects[id].owner === p)
        .map((id) => describe(game, id)),
    };
  }
  return {
    turn: s.turn.number,
    active: s.turnOrder[s.turn.activePlayerIndex],
    step: s.turn.step,
    priority: s.priority.holder,
    awaiting: s.awaiting ? `${s.awaiting.kind} (${s.awaiting.player ?? "several"})` : null,
    stack: s.zones.shared.stack.map((id) => describe(game, id)),
    players,
  };
}

/** Object ids from `ids`, or every object named in `names` (optionally only
 * `player`'s), anywhere but the library. */
function resolveIds(game, { ids, names, player }) {
  if (ids) return ids;
  const s = game.state;
  return Object.keys(s.objects).filter((id) => {
    const o = s.objects[id];
    return (
      names?.includes(o.cardName) &&
      o.zone !== "library" &&
      (player === undefined || o.controller === player || o.owner === player)
    );
  });
}

/** Commands that change a room, and so push a frame afterwards. */
const MUTATES = new Set(["spawn", "move", "life", "eval"]);

export function setup({ manager, registry, index = 0, count = 1 }) {
  // A developer's server: bot decisions are always kept for saving as
  // training scenarios (`src/capture.ts`), in the scenario rooms too.
  const capture = captureLogs({ dir: DEFAULT_CAPTURE_DIR, registry });
  /** code -> { room, game } for every scenario this shard serves. */
  const live = new Map();
  const mine = Object.keys(SCENARIOS).filter((_, i) => i % count === index);

  function buildRoom(code) {
    const scenario = SCENARIOS[code];
    const game = buildGame(scenario);
    const bots = scenario.bots ?? {};
    const room = new Room(code, game, {
      pacing: "realtime",
      capture,
      botController: (player) => new ScriptedBot(player, scriptOf(bots[player]), registry),
    });
    for (const player of Object.keys(bots)) room.addBot(player);
    room.start();
    // Served under its own code, its frames going out as any room's do.
    manager.adopt(room);
    live.set(code, { room, game });
  }
  for (const code of mine) buildRoom(code);

  const ops = {
    list: () =>
      Object.fromEntries(
        [...live].map(([code, { game }]) => [
          code,
          {
            about: SCENARIOS[code].about,
            players: game.state.turnOrder,
            bots: Object.keys(SCENARIOS[code].bots ?? {}),
            step: `turn ${game.state.turn.number}, ${game.state.turn.step}`,
            url: `http://localhost:5173/?room=${code}`,
          },
        ]),
      ),
    state: (_room, game) => stateOf(game),
    reset: (_room, _game, cmd) => {
      // Disposes the old room's timers as it goes.
      manager.remove(cmd.room);
      buildRoom(cmd.room);
      return { reset: cmd.room };
    },
    spawn: (_room, game, cmd) => {
      const zone = cmd.zone ?? "battlefield";
      return cmd.cards.map((name) =>
        game.debugSpawn(name, cmd.player, zone, {
          summoningSick: cmd.sick === true ? undefined : false,
          tapped: cmd.tapped === true,
        }),
      );
    },
    move: (_room, game, cmd) => {
      const ids = resolveIds(game, cmd);
      for (const id of ids) game.moveObject(id, cmd.to);
      return ids;
    },
    life: (_room, game, cmd) => {
      game.state.players[cmd.player].life = cmd.value;
      return { [cmd.player]: cmd.value };
    },
    // Read-only, unlike `eval` (which pushes a frame): the objects named in
    // `names` (or by `ids`) as the engine holds them — a token stack's
    // `stackCount`, counters — for a test polling a board mid-animation.
    objects: (_room, game, cmd) =>
      resolveIds(game, cmd).map((id) => {
        const o = game.state.objects[id];
        return {
          id,
          cardName: o.cardName,
          controller: o.controller,
          zone: o.zone,
          stackCount: o.stackCount ?? 1,
          tapped: o.tapped,
          counters: o.counters,
        };
      }),
    eval: (room, game, cmd) => new Function("game", "room", "registry", cmd.js)(game, room, registry),
  };

  /** A room a browser created and started here (a blitz, a rematch), rather
   * than a scenario: the same commands reach its game, but there's no
   * scenario to `reset` it to. Whichever game is under the code now, after a
   * rematch. */
  function startedRoom(code, op) {
    const room = manager.get(code);
    if (!(room instanceof Room) || op === "reset") return undefined;
    return { room, game: room.game };
  }

  return {
    ops: Object.keys(ops),
    control(cmd) {
      const op = ops[cmd.op];
      if (!op) throw new Error(`unknown op "${cmd.op}" (try: ${Object.keys(ops).join(", ")})`);
      if (cmd.op === "list") return { result: op() };
      const entry = live.get(cmd.room) ?? startedRoom(cmd.room, cmd.op);
      if (!entry) throw new Error(`no room "${cmd.room}" (try: ${[...live.keys()].join(", ")})`);
      const result = op(entry.room, entry.game, cmd);
      if (MUTATES.has(cmd.op)) entry.room.publish();
      // Tabs reconnect on their own and reclaim their seat with the token
      // they already hold; the rebuilt room has every seat free, so the
      // claim lands.
      return { result, ...(cmd.op === "reset" ? { dropConnections: true } : {}) };
    },
  };
}
