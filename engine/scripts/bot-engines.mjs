// Which permanents come before a board that explodes, and whether the bots
// answer them: every seat v2 (count budgets), and for every turn a player
// takes, what it had on the battlefield as the turn began — what the table
// had a whole round to answer — beside what the turn then brought: the damage
// it dealt its opponents and the power it ended with, against the power it
// began with. And every removal a bot aimed at an opponent's permanent, with
// what else it could have aimed at.
//
// The report ranks cards by **lift**: how much more a turn brings with the
// card in play than the same deck's turns without it, at the same stage of
// the game. Beside each: EDHREC's salt score and rank, and the bots' own
// `engineScore`, with how well each of the three orders the cards the way
// the lift does. It is the measurement behind "which permanents should a bot
// answer" (`docs/plans/bot-next-steps.md`, step 7): a board that kills out of
// a safe reading is an engine already in play, not a hand (step 6).
//
//   npm run bot:engines -w engine -- --pool blitz --games 96        # play and log
//   npm run bot:engines -w engine -- --report .scratch/engines-blitz.ndjson
//
// Flags: --pool blitz|strong-only|strong (the upgraded precons a blitz deals;
// the strong decks; both), --games N (96), --first SEED (1), --parallel N (6,
// a process a game), --game-minutes N (12: a game past it is stopped and left
// out), --out FILE (resumable NDJSON, default .scratch/engines-<pool>.ndjson),
// --report FILE, --min N (a card's turns in play before it is ranked, 20).
// It plays `dist/`: build first.

import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMMANDER_RULES,
  EvalBotController,
  Game,
  STRONG_DECKS,
  UPGRADED_DECKS,
  asPlayerId,
  botPool,
  combatCreatures,
  createDefaultRegistry,
  engineScore,
} from "../dist/index.js";
import { report } from "./bot-engines-report.mjs";
import { progress } from "./progress.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const poolName = flag("pool", "blitz");
const POOLS = {
  blitz: () => [...botPool(UPGRADED_DECKS)],
  "strong-only": () => [...STRONG_DECKS],
  strong: () => [...botPool(UPGRADED_DECKS), ...STRONG_DECKS],
};
const GAME_MARK = "@@game ";

const reportFile = flag("report", null);
const min = Number(flag("min", "20"));
if (reportFile !== null) {
  report(reportFile, { min });
  process.exit(0);
}
if (POOLS[poolName] === undefined) throw new Error(`--pool: "${poolName}" is not one of ${Object.keys(POOLS).join(", ")}`);
const pool = POOLS[poolName]();

/** Four decks for a seed: a shuffle of the pool by the seed, its first four. */
function pod(seed) {
  let a = (seed * 0x9e3779b1) >>> 0;
  const rng = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = [...pool];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, 4);
}

// --- Many games: one process each, a line a game. -----------------------------

if (!args.includes("--one")) {
  const games = Number(flag("games", "96"));
  const first = Number(flag("first", "1"));
  const parallel = Math.max(1, Number(flag("parallel", "6")));
  const gameMinutes = Math.max(1, Number(flag("game-minutes", "12")));
  const out = flag("out", join(ROOT, ".scratch", `engines-${poolName}.ndjson`));
  mkdirSync(dirname(out), { recursive: true });
  const done = new Set(existsSync(out) ? readFileSync(out, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).seed) : []);
  const queue = [];
  for (let seed = first; seed < first + games; seed += 1) if (!done.has(seed)) queue.push(seed);
  console.log(`bot:engines — ${games} games on the ${poolName} pool, ${parallel} at a time; ${done.size} already in ${out}`);
  const bar = progress("bot:engines", queue.length);
  const started = Date.now();
  let stopped = 0;
  let failed = 0;
  const play = () =>
    new Promise((resolve) => {
      const seed = queue.shift();
      if (seed === undefined) return resolve();
      const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "--one", "--seed", String(seed), "--pool", poolName], {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
      let text = "";
      child.stdout.on("data", (chunk) => (text += chunk));
      child.stderr.on("data", (chunk) => (text += chunk));
      let overTime = false;
      const timer = setTimeout(() => {
        overTime = true;
        child.kill();
      }, gameMinutes * 60_000);
      child.on("close", (code) => {
        clearTimeout(timer);
        const line = text.split("\n").find((l) => l.startsWith(GAME_MARK));
        if (overTime) stopped += 1;
        else if (code !== 0 || line === undefined) {
          failed += 1;
          console.log(`  seed ${seed} failed (exit ${code}): ${text.trim().split("\n").slice(-2).join(" | ").slice(0, 300)}`);
        } else appendFileSync(out, `${line.slice(GAME_MARK.length)}\n`);
        bar.tick({ failed: !overTime && (code !== 0 || line === undefined) });
        play().then(resolve);
      });
    });
  await Promise.all(Array.from({ length: Math.min(parallel, queue.length) }, play));
  bar.finish();
  console.log(`played in ${Math.round((Date.now() - started) / 1000)} s${stopped > 0 ? `, ${stopped} stopped at ${gameMinutes} minutes` : ""}${failed > 0 ? `, ${failed} failed` : ""}`);
  report(out, { min });
  process.exit(0);
}

// --- One game. ----------------------------------------------------------------

{
  const seed = Number(flag("seed", "1"));
  const decks = pod(seed);
  const seats = ["alice", "bob", "carol", "dave"].map(asPlayerId);
  const registry = createDefaultRegistry();
  const deckOf = Object.fromEntries(seats.map((s, i) => [s, decks[i].name]));

  const defOf = (name) => (registry.has(name) ? registry.get(name) : undefined);
  /** The cards a player has on the battlefield: nonland, not tokens. */
  const cardsOf = (s, player) => {
    const out = [];
    for (const id of s.zones.shared.battlefield) {
      const o = s.objects[id];
      if (o === undefined || o.controller !== player || o.isToken === true) continue;
      const def = defOf(o.cardName);
      if (def === undefined || def.types.includes("land")) continue;
      out.push({ name: o.cardName, id, types: def.types, score: Number(engineScore(s, registry, id).toFixed(2)), commander: o.isCommander === true });
    }
    return out;
  };
  const powerOf = (s, player) =>
    combatCreatures(s, registry, player, false)
      .filter((c) => c.canAttack)
      .reduce((sum, c) => sum + Math.max(0, c.damage) * (c.keywords.has("double-strike") ? 2 : 1), 0);

  // What a source does to a permanent it targets, read off its definition.
  const REMOVES = new Set(["destroy", "exile", "return-to-hand", "gain-control", "damage", "sacrifice", "put-on-library", "shuffle-into-library"]);
  const walk = (node, found) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, found));
    if (typeof node.kind === "string" && REMOVES.has(node.kind) && typeof node.target === "number") found.add(node.kind);
    for (const v of Object.values(node)) walk(v, found);
  };
  const removalKinds = new Map();
  const removesWith = (name) => {
    let kinds = removalKinds.get(name);
    if (kinds === undefined) {
      const found = new Set();
      const def = defOf(name);
      if (def !== undefined) walk([def.effect, def.castModal, def.triggered, def.activated], found);
      kinds = [...found];
      removalKinds.set(name, kinds);
    }
    return kinds;
  };

  const turns = [];
  const removals = [];
  const controllers = {};
  let game;
  for (const seat of seats) {
    const bot = new EvalBotController(seat, registry);
    const act = bot.act.bind(bot);
    bot.act = (view) => {
      const action = act(view);
      const s = view.state;
      // A removal aimed at an opponent's permanent: a cast or an activation
      // with its targets, or the targets chosen for a trigger.
      let source = null;
      if (action.type === "cast-spell") source = s.objects[action.card]?.cardName ?? null;
      else if (action.type === "activate-ability") source = s.objects[action.source]?.cardName ?? null;
      else if (action.type === "choose-targets" && s.awaiting?.source !== undefined) source = s.objects[s.awaiting.source]?.cardName ?? null;
      const targets = action.targets === undefined ? [] : [action.targets].flat(4).filter((t) => t !== null && t !== undefined && t.kind === "object");
      if (source !== null && targets.length > 0) {
        const kinds = removesWith(source);
        for (const t of targets) {
          const o = s.objects[t.object];
          if (kinds.length === 0 || o === undefined || o.zone !== "battlefield" || o.controller === seat) continue;
          const def = defOf(o.cardName);
          if (def === undefined || def.types.includes("land")) continue;
          const others = seats
            .filter((p) => p !== seat && !s.players[p].hasLost)
            .flatMap((p) => cardsOf(s, p).map((c) => ({ name: c.name, types: c.types, score: c.score, of: deckOf[p] })));
          removals.push({
            turn: s.turn.number,
            by: deckOf[seat],
            source,
            kinds,
            target: o.cardName,
            token: o.isToken === true,
            targetTypes: def.types,
            targetScore: Number(engineScore(s, registry, t.object).toFixed(2)),
            of: deckOf[o.controller],
            others,
          });
        }
      }
      return action;
    };
    controllers[seat] = bot;
  }
  game = Game.create({
    seed,
    registry,
    controllers,
    mulligans: true,
    rules: COMMANDER_RULES,
    decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
  });
  let seen = 0;
  const maxTurns = Number(flag("max-turns", "100"));
  while (!game.state.result.over && game.state.turn.number <= maxTurns) {
    const turn = game.state.turn.number;
    const active = game.state.turnOrder[game.state.turn.activePlayerIndex];
    const before = game.state.players[active].hasLost ? null : { cards: cardsOf(game.state, active), power: powerOf(game.state, active), life: game.state.players[active].life };
    const alive = seats.filter((p) => !game.state.players[p].hasLost).length;
    game.advanceUntil((s) => s.result.over || s.turn.number !== turn);
    const s = game.state;
    let combat = 0;
    let other = 0;
    const cast = [];
    const killed = [];
    const events = game.events;
    for (; seen < events.length; seen += 1) {
      const e = events[seen];
      if (e.type === "damage-dealt" && e.target?.kind === "player" && e.by === active && e.target.player !== active) {
        if (e.combat) combat += e.amount;
        else other += e.amount;
      } else if (e.type === "life-changed" && e.delta < 0 && e.byEffectOf === active && e.player !== active) other += -e.delta;
      else if (e.type === "spell-cast" && e.player === active) cast.push(s.objects[e.object]?.cardName ?? "?");
      else if (e.type === "player-lost" && e.player !== active) killed.push(e.player);
    }
    if (before === null || turn === 0) continue;
    turns.push({
      turn,
      round: Math.ceil(turn / seats.length),
      deck: deckOf[active],
      alive,
      life: before.life,
      before: before.cards.map(({ name, score, commander, types }) => ({ name, score, commander, creature: types.includes("creature") })),
      powerBefore: before.power,
      powerAfter: s.players[active].hasLost ? 0 : powerOf(s, active),
      combat,
      other,
      cast,
      kills: killed.length,
    });
  }
  const result = game.state.result;
  console.log(
    `${GAME_MARK}${JSON.stringify({
      seed,
      pool: poolName,
      decks: decks.map((d) => d.name),
      winner: result.winner != null ? deckOf[result.winner] : null,
      endedTurn: game.state.turn.number,
      turns,
      removals,
    })}`,
  );
  process.exit(0);
}
