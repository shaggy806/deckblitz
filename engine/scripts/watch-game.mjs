// A whole bot game written out to read: every seat v2 at the live clock, on
// decks named by the caller, each turn's board and every decision that isn't
// a pass, with how v2 reached it (a search, v1's cast unscored, a replay).
// For looking over the bots' play by eye: `bot:replay` shows where the time
// goes, this shows what was played.
//
//   npm run bot:watch -w engine -- --decks "The Ur-Dragon,Lathril,Ureni,Giada" [--seed 1] [--budget 1000] [--max-turns 120]
//
// `--decks` matches each name against the strong decks first, then the
// upgraded and starter decks, then the tooling precons (`tool-decks.mjs`: a
// deck named exactly that, else a case-insensitive substring). Build first
// (it plays `dist/`); it prints to stdout, a few hundred lines a game.
//
// `--count` plays on count budgets instead of the clock, so the seed is the
// game `bot:losses`, `bot:outs` and `bot:judge` played; `--turns 31-34`
// prints those turns alone (the game before them is played unprinted). The
// two together are what `bot:losses` prints for a loss worth reading.
// `--snapshot-at 50` saves the game as that turn begins
// (`.scratch/replays/watch-seed-N-t50.json`), the exact board to rebuild a
// suspected misplay on: `Game.fromSnapshot`, as `bot:replay --from` does.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMMANDER_RULES,
  EvalBotController,
  Game,
  asPlayerId,
  computeCharacteristics,
  createDefaultRegistry,
  describeMove,
} from "../dist/index.js";
import { progress } from "./progress.mjs";
import { findDeck } from "./tool-decks.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const seed = Number(flag("seed", "1"));
const budget = Number(flag("budget", "1000"));
const maxTurns = Number(flag("max-turns", "120"));
const wanted = flag("decks", "The Ur-Dragon,Lathril,Ureni,Giada").split(",").map((s) => s.trim());
const counted = args.includes("--count");
const [fromTurn, toTurn] = (() => {
  const text = flag("turns", null);
  if (text === null) return [0, Infinity];
  const [from, to] = text.split("-").map((n) => Number(n.trim()));
  if (!Number.isInteger(from) || (to !== undefined && !Number.isInteger(to))) throw new Error(`--turns: "${text}" is not a turn or a range`);
  return [from, to ?? from];
})();
const snapshotAt = flag("snapshot-at", null) === null ? null : Number(flag("snapshot-at", null));
let snapshotSaved = false;
/** Whether the turn being played is one to print. */
const shown = (turn) => turn >= fromTurn && turn <= toTurn;

const decks = wanted.map(findDeck);
const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
const label = Object.fromEntries(seats.map((seat, i) => [seat, decks[i].name.split(" by ")[0]]));
const registry = createDefaultRegistry();

const viaCounts = {};
const controllers = {};
let game;
for (const seat of seats) {
  const bot = counted ? new EvalBotController(seat, registry) : new EvalBotController(seat, registry, { timeBudgetMs: budget });
  const act = bot.act.bind(bot);
  bot.act = (view) => {
    const started = Date.now();
    const action = act(view);
    const ms = Date.now() - started;
    const audit = bot.lastDecision;
    const via = audit?.via ?? "-";
    const kind = view.state.awaiting?.kind ?? "priority";
    viaCounts[`${kind}: ${via}`] = (viaCounts[`${kind}: ${via}`] ?? 0) + 1;
    if (action.type !== "pass-priority" && shown(view.state.turn.number)) {
      const s = view.state;
      const how = audit === null || audit === undefined ? "" : `  [${via}${audit.simulations ? `, ${audit.simulations} sims` : ""}${ms >= 1500 ? `, ${ms} ms` : ""}]`;
      // What asked, for an answer that doesn't say ("Choose no mode").
      const asking = s.awaiting?.source !== undefined ? s.objects[s.awaiting.source]?.cardName : undefined;
      const asked = asking !== undefined ? ` (${asking})` : "";
      console.log(`  ${label[seat].padEnd(13)} ${s.turn.step.padEnd(17)} ${describeMove(s, action, registry)}${asked}${how}`);
    }
    return action;
  };
  controllers[seat] = bot;
}

const commandOf = (state, seat) =>
  (state.zones.shared.command ?? [])
    .filter((id) => state.objects[id]?.owner === seat && state.objects[id]?.kind === "card")
    .map((id) => state.objects[id].cardName);

function summary(state) {
  const lines = [];
  for (const seat of seats) {
    const p = state.players[seat];
    if (p.hasLost) {
      lines.push(`    ${label[seat].padEnd(13)} out`);
      continue;
    }
    const zones = state.zones.perPlayer[seat];
    const mine = state.zones.shared.battlefield.filter((id) => state.objects[id]?.controller === seat);
    const creatures = [];
    let landCount = 0;
    const others = [];
    for (const id of mine) {
      const object = state.objects[id];
      const c = computeCharacteristics(state, registry, id);
      const n = object.stackCount ?? 1;
      if (c.types.includes("creature")) creatures.push(`${object.cardName}${n > 1 ? ` x${n}` : ""} ${c.power}/${c.toughness}${object.tapped ? " (T)" : ""}`);
      else if (c.types.includes("land")) landCount += n;
      else others.push(`${object.cardName}${n > 1 ? ` x${n}` : ""}`);
    }
    lines.push(
      `    ${label[seat].padEnd(13)} life ${String(p.life).padStart(3)}  hand ${String(zones.hand.length).padStart(2)}  library ${String(zones.library.length).padStart(2)}  lands ${landCount}` +
        `${(p.counters?.poison ?? 0) > 0 ? `  poison ${p.counters.poison}` : ""}\n` +
        `      creatures: ${creatures.join(", ") || "none"}\n      other: ${others.join(", ") || "none"}` +
        `\n      in hand: ${zones.hand.map((id) => state.objects[id]?.cardName).join(", ") || "nothing"}` +
        `${commandOf(state, seat).length > 0 ? `\n      command zone: ${commandOf(state, seat).join(", ")}` : ""}`,
    );
  }
  return lines.join("\n");
}

console.log(`watch-game: seed ${seed}, ${counted ? "count budgets" : `${budget} ms a decision`}${toTurn === Infinity ? "" : `, turns ${fromTurn}-${toTurn}`} —${seats.map((s) => `${s} = ${decks[seats.indexOf(s)].name}`).join("; ")}`);
game = Game.create({
  seed,
  registry,
  controllers,
  mulligans: true,
  rules: COMMANDER_RULES,
  decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
});
let lastTurn = -1;
const lost = new Set();
const started = Date.now();
// The job-progress mod's bar (progress.mjs), when the run has a turn to get
// to (`--turns`, `--snapshot-at`): a turn a unit. A whole game has no known
// length, so it has no bar.
const target = toTurn !== Infinity ? toTurn : snapshotAt;
const bar = target === null ? null : progress(`bot:watch to turn ${target}`, target);
game.advanceUntil((s) => {
  if (s.turn.number !== lastTurn) {
    lastTurn = s.turn.number;
    bar?.to(s.turn.number - 1);
    // Past the turn asked for (a snapshot taken, the game played on): done.
    if (target !== null && s.turn.number > target) bar?.finish();
    const active = s.turnOrder[s.turn.activePlayerIndex];
    if (snapshotAt !== null && !snapshotSaved && s.turn.number >= snapshotAt) {
      const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".scratch", "replays");
      mkdirSync(dir, { recursive: true });
      const file = join(dir, `watch-seed-${seed}-t${s.turn.number}.json`);
      writeFileSync(file, JSON.stringify({ ...game.snapshot(), eventLog: [] }));
      console.log(`snapshot at turn ${s.turn.number} (${s.turn.step}): ${file}`);
      snapshotSaved = true;
    }
    if (shown(s.turn.number)) {
      console.log(`\n== Turn ${s.turn.number} (round ${Math.ceil(s.turn.number / seats.length)}) — ${label[active]} — ${Math.round((Date.now() - started) / 1000)} s`);
      console.log(summary(s));
    }
  }
  for (const seat of seats) {
    if (s.players[seat].hasLost && !lost.has(seat)) {
      lost.add(seat);
      console.log(`  *** ${label[seat]} is out (turn ${s.turn.number}: ${s.players[seat].lossReason})`);
    }
  }
  // Past the turns asked for there is nothing left to print: stop there.
  return s.result.over || s.turn.number > Math.min(maxTurns, toTurn);
});
bar?.to(target);
bar?.finish();
console.log(`\n== End: turn ${game.state.turn.number}, ${JSON.stringify(game.state.result)}`);
console.log(summary(game.state));
console.log("\nHow each decision was reached:");
for (const [key, n] of Object.entries(viaCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(6)}  ${key}`);
