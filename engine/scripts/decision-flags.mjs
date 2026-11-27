#!/usr/bin/env node
// Flags bot decisions that left the bot worse off by its own measure: a spell
// or ability a bot cast or activated that fizzled in the game (every target
// gone, rule 608.2b — a discovered Deflecting Swat aimed at the discover
// itself), or one that, played out until the stack settles, leaves the bot's
// position scored lower than not doing it would have: passing priority, or
// declining a "you may cast" (`simulateAction` to the "stack" horizon, the
// caster's own answers on the way v1's and nothing new cast, the other seats
// passive, each end
// scored by `evaluateState`, the bots' own
// evaluation). A lead to read, not a verdict: the evaluation is the bots' own,
// it sees no further than the stack, and a spell can be right for what it sets
// up later (a creature that attacks next turn scores at once; a tutor, or
// mana for a bigger turn, may not).
//
// Two sources:
//
//   npm run bot:flags -w engine -- games/2026-11-26/*.json.gz   (or node scripts/decision-flags.mjs …)
//     kept games from the live site (`npm run games:pull`), replayed on this
//     build: the bots' own inputs are checked, a person's never. A record
//     plays exactly only on its own build; past where it goes its own way,
//     what this build's bots then do is checked as far as it goes. Needs
//     `server/dist` built too.
//
//   node scripts/decision-flags.mjs --decks "A,B,C,D" --seeds 1-4 [--parallel 4] [--budget live] [--max-turns 60]
//     fresh games, every seat v2 (`tool-decks.mjs` names: strong decks,
//     starters, tooling precons, or a deck file), count budgets unless
//     `--budget` is given, so a seed replays (`bot:watch --count`).
//
// Other flags: --worse [N] also flags a cast or activation that scores N or
// more below not doing it (default 8: a card in hand is worth about 1). Off by
// default: below about 15 these were mostly what the stack-deep score can't
// value (a fetch land shuffling away a known top card, a tutor, Brainstorm).
// --quiet (totals only), --self-test (the Deflecting Swat board, cast at the
// discover by a scripted seat: it must be flagged). It plays `dist/`: build
// first.

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

import {
  COMMANDER_RULES,
  DEFAULT_WEIGHTS,
  EvalBotController,
  Game,
  HeuristicBotController,
  ScriptedController,
  asPlayerId,
  createDefaultRegistry,
  evaluateState,
  simulateAction,
} from "../dist/index.js";
import { computeCharacteristics } from "../dist/characteristics.js";
import { findDeck } from "./tool-decks.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? null : (args[i + 1] ?? "");
};
const has = (name) => args.includes(`--${name}`);
const DROP = flag("worse") === null ? null : Number(flag("worse") || 8);
const quiet = has("quiet");
const registry = createDefaultRegistry();

/**
 * Watches one game. `beforeDecision` is told of each bot decision with the
 * state it was made on, before it applies; `afterSettle` reads the events
 * since and settles what it can. Flags go to `flags`.
 */
function createWatcher(where, flags) {
  /** Casts and activations still being followed. */
  const open = [];
  let seen = 0;
  const name = (s, id) => s.objects[id]?.cardName ?? String(id);

  function beforeDecision(game, player, action) {
    const s = game.state;
    let card = null;
    if (action.type === "cast-spell") card = action.card;
    else if (action.type === "cast-now" && action.cast?.type === "cast-spell") card = action.cast.card;
    const activation = action.type === "activate-ability";
    if (card === null && !activation) return;
    // Against not doing it, each played out until the stack settles.
    const instead =
      action.type === "cast-now" ? { type: "cast-now", player, cast: null } : { type: "pass-priority", player };
    const settled = (a) => {
      try {
        const end = simulateAction(s, registry, a, "stack", "passive", answersOnly(player));
        return end === null ? null : { value: evaluateState(end, registry, player, DEFAULT_WEIGHTS), sig: signature(end, player, card) };
      } catch {
        return null;
      }
    };
    const chosen = settled(action);
    const without = settled(instead);
    open.push({
      player,
      turn: s.turn.number,
      chosen: chosen?.value ?? null,
      without: without?.value ?? null,
      nothing: chosen !== null && without !== null && chosen.sig === without.sig,
      object: card,
      activation: activation ? { source: action.source } : null,
      what: card !== null ? name(s, card) : `${name(s, action.source)}'s ability`,
      depth: s.zones.shared.stack.length,
      contested: null,
      resolved: false,
      fizzled: null,
      targets: describeTargets(s, action.type === "cast-now" ? action.cast : action),
    });
  }

  /** What a cast or activation could change, as one string: every
   * permanent as it is now (its power, toughness, keywords and combat
   * restrictions, how many modifiers it carries, counters,
   * damage, attachments; tapped or not, but for the caster's own noncreature
   * permanents, which paying mana taps), every card in every zone but the spell itself where it
   * ends (hand, graveyard, exile), life, poison and counters, mana pools,
   * and every other rule kept at the top of the state. Two equal signatures are
   * two games that differ only in what was paid. */
  function signature(state, caster, spell) {
    const parts = [];
    for (const id of [...state.zones.shared.battlefield].sort()) {
      const o = state.objects[id];
      let ch = null;
      try {
        ch = computeCharacteristics(state, registry, id);
      } catch {
        // a permanent the layers can't read: its object alone
      }
      const stats = ch === null ? "" : `${ch.power}/${ch.toughness}/${[...ch.keywords].sort().join("+")}/${ch.types.join("+")}/${[...(ch.restrictions ?? [])].sort().join("+")}`;
      parts.push(`${id}:${o.cardName}:${o.controller}:${o.controller === caster && !(ch?.types ?? []).includes("creature") ? "" : o.tapped}:${JSON.stringify(o.counters ?? {})}:${o.damageMarked ?? 0}:${o.attachedTo ?? ""}:${o.stackCount ?? 1}:${(o.modifiers ?? []).length}:${stats}`);
    }
    const not = (id) => id !== spell;
    for (const zone of ["exile", "command"]) parts.push(zone + ":" + state.zones.shared[zone].filter(not).sort().join(","));
    for (const [player, zones] of Object.entries(state.zones.perPlayer)) {
      for (const zone of ["hand", "graveyard"]) parts.push(`${player}.${zone}:` + zones[zone].filter(not).sort().join(","));
      parts.push(`${player}.library:${zones.library.filter(not).length}`);
      const p = state.players[player];
      parts.push(`${player}:${p.life}:${JSON.stringify(p.counters ?? {})}:${p.hasLost}:${JSON.stringify(p.manaPool ?? [])}`);
    }
    // Every other rule the game keeps at the top of its state — lasting
    // effects, delayed triggers, a turn's "creatures with defender can attack"
    // (Wakestone Gargoyle) — but its bookkeeping.
    for (const key of Object.keys(state).sort()) {
      if (!BOOKKEEPING.has(key)) parts.push(`${key}=${JSON.stringify(state[key])}`);
    }
    return parts.join("|");
  }

  /** The state's fields a cast changes however little it does: read above
   * (objects, zones, players) or only counting (the log, the journal, the
   * spells cast this turn, timestamps, the shuffles' random state). */
  const BOOKKEEPING = new Set([
    "objects", "zones", "players", "eventLog", "eventSeq", "journal", "spellsCastThisTurn", "timestampSeq",
    "rngState", "priority", "turn", "awaiting", "pendingTriggers", "publicStints", "nextObjectId",
  ]);

  function describeTargets(s, action) {
    const targets = action?.targets ?? [];
    return targets
      .filter((t) => t !== null && t !== undefined)
      .map((t) => (t.kind === "player" ? t.player : `${name(s, t.object)}${s.zones.shared.stack.includes(t.object) ? " (on the stack)" : ""}`))
      .join(", ");
  }

  function afterSettle(game) {
    const s = game.state;
    const events = game.events;
    // A take-back starts the game anew from a snapshot: what was followed is gone.
    if (events.length < seen) {
      open.length = 0;
      seen = events.length;
      return;
    }
    for (let i = seen; i < events.length; i += 1) {
      const e = events[i];
      for (const o of open) {
        if (o.object === null && o.activation !== null && e.type === "ability-activated" && e.source === o.activation.source && e.onStack) {
          const top = s.zones.shared.stack[s.zones.shared.stack.length - 1];
          if (top !== undefined) o.object = top;
        }
        if (o.object === null) continue;
        if ((e.type === "spell-resolved" || e.type === "ability-resolved") && e.object === o.object) o.resolved = true;
        if (e.type === "spell-fizzled" && e.object === o.object) {
          o.fizzled = e.reason ?? "its targets were gone";
          o.resolved = true;
        }
        if (e.type === "spell-countered" && e.object === o.object) o.contested ??= `countered by ${e.by}`;
        // Someone else acting before it settles: what changed isn't its alone.
        if (!o.resolved && (e.type === "spell-cast" || (e.type === "ability-activated" && e.onStack)) && e.player !== o.player) {
          o.contested ??= `${e.player} ${e.type === "spell-cast" ? `cast ${name(s, e.object)}` : `activated ${name(s, e.source)}`} in response`;
        }
      }
    }
    seen = events.length;
    if (s.awaiting !== null) return;
    for (let k = open.length - 1; k >= 0; k -= 1) {
      const o = open[k];
      const gone = o.object !== null && !s.zones.shared.stack.includes(o.object);
      if (!(o.resolved || gone)) continue;
      // Settled: its own triggers resolved too, back to the stack it was cast onto.
      if (s.zones.shared.stack.length > o.depth) continue;
      open.splice(k, 1);
      if (s.players[o.player]?.hasLost) continue;
      const at = `${where} t${o.turn} ${o.player}`;
      const aimed = o.targets ? `, aimed at ${o.targets}` : "";
      if (o.fizzled !== null) {
        flags.push({ where, turn: o.turn, player: o.player, kind: "fizzled", line: `${at}: ${o.what} fizzled (${o.fizzled})${aimed}${o.contested === null ? "" : ` (in the game, ${o.contested})`}` });
      } else if (o.nothing && o.contested === null) {
        flags.push({ where, turn: o.turn, player: o.player, kind: "nothing", line: `${at}: ${o.what} did nothing: every zone, life total and counter as without it, but the card and the mana${aimed}` });
      } else if (DROP !== null && o.chosen !== null && o.without !== null && o.without - o.chosen > DROP) {
        const how = o.contested === null ? "" : ` (in the game, ${o.contested})`;
        flags.push({ where, turn: o.turn, player: o.player, kind: "worse", line: `${at}: ${o.what} scores ${fmt(o.without - o.chosen)} below not doing it (${fmt(o.chosen)} against ${fmt(o.without)})${aimed}${how}` });
      }
    }
  }

  return { beforeDecision, afterSettle };
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();

/**
 * The caster in a simulation: v1's answers to what it's asked (a tutor's
 * pick, a mode, a target), and never anything new with priority — else, in
 * the branch that passes, v1 cast the same spell a moment later, and the two
 * ends matched.
 */
function answersOnly(player) {
  const v1 = new HeuristicBotController(player, registry);
  const act = v1.act.bind(v1);
  v1.act = (view) => (view.state.awaiting === null ? { type: "pass-priority", player } : act(view));
  return v1;
}

/** Kept games: the bots' inputs, followed as the record replays. */
async function keptGames(files) {
  const { replayRecord } = await import(pathToFileURL(join(here, "..", "..", "server", "dist", "game-record.js")).href);
  const flags = [];
  let games = 0;
  let decisions = 0;
  for (const file of files) {
    let record;
    try {
      // `npm run -w engine` runs here, in engine/: a path is the caller's.
      const raw = readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), file));
      record = JSON.parse((file.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8"));
    } catch {
      continue;
    }
    if (record.version !== 1) continue;
    games += 1;
    const watcher = createWatcher(file.replace(/^.*games[\\/]/, ""), flags);
    let last = null;
    try {
      replayRecord(record, registry, {
        start: (game) => {
          last = game;
          peek(game, 0);
        },
        stop: (game, applied) => {
          watcher.afterSettle(game);
          peek(game, applied);
          return false;
        },
      });
    } catch {
      // A record this build can't follow to the end: what it got through stands.
    }
    function peek(game, applied) {
      const next = record.inputs[applied];
      if (next === undefined || next.by !== "bot" || next.input.kind !== "action") return;
      decisions += 1;
      watcher.beforeDecision(game, next.input.action.player, next.input.action);
    }
    void last;
  }
  return { flags, games, decisions };
}

/** Fresh games, one seed: every seat v2, each decision followed. */
function freshGame(deckNames, seed, budget, maxTurns) {
  const decks = deckNames.map(findDeck);
  const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
  const label = Object.fromEntries(seats.map((s, i) => [s, decks[i].name]));
  const flags = [];
  const watcher = createWatcher(`seed ${seed}`, flags);
  let game = null;
  let decisions = 0;
  const controllers = {};
  for (const seat of seats) {
    const bot = new EvalBotController(seat, registry, budget === null ? {} : { timeBudgetMs: budget });
    const act = bot.act.bind(bot);
    bot.act = (view) => {
      if (game !== null) watcher.afterSettle(game);
      const action = act(view);
      decisions += 1;
      if (game !== null) watcher.beforeDecision(game, seat, action);
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
  game.advanceUntil((s) => s.result.over || s.turn.number > maxTurns);
  watcher.afterSettle(game);
  for (const f of flags) f.line = f.line.replace(` ${f.player}:`, ` ${f.player} (${label[f.player]}):`);
  return { flags, decisions, turns: game.state.turn.number };
}

function seedList(spec) {
  const [a, b] = spec.split("-").map(Number);
  return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

const budgetArg = flag("budget");
const budget = budgetArg === null ? null : budgetArg === "live" ? 1000 : Number(budgetArg);
const maxTurns = Number(flag("max-turns") ?? 60);

/**
 * The board the flagger was made for (a live game, 2026-11-26): Pantlaza,
 * Sun-Favored discovers into Deflecting Swat with nothing on the stack but
 * the discover, and the seat casts Swat at it. Exits non-zero unless that
 * cast is flagged as fizzled.
 */
function selfTest() {
  const [A, B] = ["alice", "bob"].map(asPlayerId);
  const game = Game.create({
    seed: 3,
    registry,
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [A, B].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  const swat = game.debugSpawn("Deflecting Swat", A, "library");
  const library = game.state.zones.perPlayer[A].library;
  game.state.zones.perPlayer[A].library = [swat, ...library.filter((id) => id !== swat)];
  game.debugSpawn("Pantlaza, Sun-Favored", A, "battlefield", { announceEntry: true, summoningSick: false });
  game.advanceUntil((s) => s.awaiting !== null && s.awaiting.player === A);
  if (game.state.awaiting?.kind === "choose-modes") {
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    game.advanceUntil((s) => s.awaiting !== null && s.awaiting.player === A);
  }
  const offer = game.legalActions(A).find((a) => a.kind === "cast-now");
  const target = offer?.casts[0]?.targetOptions[0]?.[0];
  if (target === undefined) throw new Error("self-test: the discover never offered Deflecting Swat with a target");
  const action = { type: "cast-now", player: A, cast: { type: "cast-spell", player: A, card: swat, targets: [target], via: "effect", free: true } };
  const flags = [];
  const watcher = createWatcher("self-test", flags);
  watcher.beforeDecision(game, A, action);
  game.dispatch(action);
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
  watcher.afterSettle(game);
  for (const f of flags) console.log(`  ${f.line}`);
  const caught = flags.some((f) => f.kind === "fizzled" && f.line.includes("Deflecting Swat"));
  console.log(caught ? "self-test: flagged, as it should be" : "self-test: NOT flagged");
  process.exit(caught ? 0 : 1);
}

if (has("self-test")) selfTest();

if (flag("decks") !== null) {
  const deckNames = flag("decks").split(",");
  const seeds = seedList(flag("seed") ?? flag("seeds") ?? "1");
  const parallel = Number(flag("parallel") ?? 4);
  if (seeds.length === 1 || has("child")) {
    for (const seed of seeds) {
      const { flags, decisions, turns } = freshGame(deckNames, seed, budget, maxTurns);
      const watch = `npm run bot:watch -w engine -- --decks "${flag("decks")}" --seed ${seed} ${budget === null ? "--count" : `--budget ${budget}`}`;
      console.log(`seed ${seed}: ${decisions} decisions, ${turns} turns, ${flags.length} flagged`);
      if (!quiet) for (const f of flags) console.log(`  ${f.line}\n    read: ${watch} --turns ${f.turn}-${f.turn}`);
    }
  } else {
    // A process a seed, `parallel` at once.
    const queue = [...seeds];
    const rest = args.filter((a, i) => !["--seed", "--seeds", "--parallel"].includes(a) && !["--seed", "--seeds", "--parallel"].includes(args[i - 1]));
    let running = 0;
    await new Promise((done) => {
      const next = () => {
        if (queue.length === 0 && running === 0) return done();
        while (running < parallel && queue.length > 0) {
          const seed = queue.shift();
          running += 1;
          const child = spawn(process.execPath, [fileURLToPath(import.meta.url), ...rest, "--seed", String(seed), "--child"], {
            stdio: ["ignore", "pipe", "inherit"],
          });
          let out = "";
          child.stdout.on("data", (d) => (out += d));
          child.on("close", () => {
            process.stdout.write(out);
            running -= 1;
            next();
          });
        }
      };
      next();
    });
  }
} else {
  const files = args.filter((a) => /\.json(\.gz)?$/.test(a));
  if (files.length === 0) {
    console.log('usage: node scripts/decision-flags.mjs <kept game record>... | --decks "A,B,C,D" --seeds 1-4');
    process.exit(1);
  }
  const { flags, games, decisions } = await keptGames(files);
  console.log(`${games} games, ${decisions} bot decisions, ${flags.length} flagged (${flags.filter((f) => f.kind === "fizzled").length} fizzled, ${flags.filter((f) => f.kind === "nothing").length} did nothing, ${flags.filter((f) => f.kind === "worse").length} much worse)`);
  if (!quiet) for (const f of flags) console.log(`  ${f.line}\n    read: npm run game:replay -- games/${f.where} --turn ${f.turn}`);
}
