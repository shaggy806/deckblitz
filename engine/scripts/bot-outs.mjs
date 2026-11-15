// Whether a bot that is dead on the board has outs, and whether it plays to
// them: every seat v2 (count budgets, so a seed replays), and at the end of
// each seat's own turn the block arithmetic is asked whether one opponent's
// board kills it whatever it blocks with. Each such turn is followed to the
// seat's next turn and filed by what happened:
//
// - **died**, and to whom;
// - **not attacked**: the board that had it dead went at someone else, or
//   nowhere;
// - **board cut**: that opponent's creatures were halved or worse before the
//   seat untapped (a wipe, or removal enough to count) — the out a player
//   plays to by holding cards back;
// - **attacked, lived**: blocks, a trick, lifegain.
//
// Beside each: what the seat cast on the turn it was dead (creatures by
// name), its hand, and how many of those creatures were still there a round
// later. The totals say how often each out came, which is what decides
// whether "hold the hand for after the wipe" is worth building
// (`docs/plans/bot-next-steps.md`, step 5).
//
//   npm run bot:outs -w engine -- --seeds 1-6 --decks "Token Triumph,Grave Danger,World Shaper,Mardu Surge;The Ur-Dragon,Lathril,Atraxa,Giada"
//
// Flags: --decks "A,B,C,D[;…]" (by substring, strong decks first), --seed N or
// --seeds "1-8", --parallel N (default 6, a process a game), --max-turns N
// (default 80), --quiet (totals only). It plays `dist/`: build first.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  COMMANDER_RULES,
  EvalBotController,
  Game,
  STARTER_DECKS,
  STRONG_DECKS,
  asPlayerId,
  combatCreatures,
  createDefaultRegistry,
  damageThrough,
  isLethal,
} from "../dist/index.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const maxTurns = Number(flag("max-turns", "80"));
const quiet = args.includes("--quiet");
const seedsOf = (text) =>
  text.split(",").flatMap((part) => {
    const [from, to] = part.split("-").map((n) => Number(n.trim()));
    if (!Number.isInteger(from) || (to !== undefined && !Number.isInteger(to))) throw new Error(`--seeds: "${part}" is not a seed or a range`);
    return to === undefined ? [from] : Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  });
const seeds = flag("seeds", null) !== null ? seedsOf(flag("seeds", "")) : [Number(flag("seed", "1"))];
const deckSets = flag("decks", "Token Triumph,Grave Danger,World Shaper,Mardu Surge")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s !== "");

const TALLY_MARK = "@@tally ";
const OUTCOMES = ["died", "not attacked", "board cut", "attacked, lived"];
const newTally = () => ({
  turns: 0,
  dead: 0,
  outcome: Object.fromEntries(OUTCOMES.map((o) => [o, 0])),
  /** Dead-on-board turns on which the seat cast a creature, by outcome. */
  castCreature: Object.fromEntries(OUTCOMES.map((o) => [o, 0])),
  /** Creatures cast on a dead turn, and how many were there a round later. */
  creaturesCast: 0,
  creaturesKept: 0,
  /** The same, on the turns that ended "board cut". */
  cutCast: 0,
  cutKept: 0,
  /** Dead turns ended with a board wipe in the seat's own hand, and with one
   * in the hand of a player other than the one whose board had it dead; and
   * how many of each the seat died on. */
  ownWipe: 0,
  ownWipeDied: 0,
  othersWipe: 0,
  othersWipeDied: 0,
});
const pct = (n, of) => (of === 0 ? "—" : `${Math.round((100 * n) / of)}%`);
function summary(t) {
  const lines = [`${t.turns} turns ended; on ${t.dead} of them (${pct(t.dead, t.turns)}) the seat was dead to one opponent's board whatever it blocked with`];
  for (const o of OUTCOMES) {
    lines.push(`  ${o.padEnd(16)} ${String(t.outcome[o]).padStart(4)}  ${pct(t.outcome[o], t.dead).padStart(4)}   it had cast a creature that turn on ${t.castCreature[o]}`);
  }
  lines.push(
    `  creatures cast on a dead turn: ${t.creaturesCast}, still there a round later ${t.creaturesKept} (${pct(t.creaturesKept, t.creaturesCast)}); ` +
      `on the "board cut" turns: ${t.cutCast} cast, ${t.cutKept} kept`,
  );
  lines.push(
    `  a board wipe in its own hand as the turn ended: ${t.ownWipe} (died on ${t.ownWipeDied}); ` +
      `one in a third player's hand: ${t.othersWipe} (died on ${t.othersWipeDied})`,
  );
  return lines.join("\n");
}

// --- Several games: one process each, totalled. -----------------------------

const jobs = deckSets.flatMap((decks) => seeds.map((seed) => ({ decks, seed })));
if (jobs.length > 1) {
  const parallel = Math.max(1, Number(flag("parallel", "6")));
  console.log(`bot:outs — ${jobs.length} games, ${parallel} at a time`);
  const total = newTally();
  const add = (into, from) => {
    for (const key of Object.keys(into)) {
      if (typeof into[key] === "number") into[key] += from[key];
      else add(into[key], from[key]);
    }
  };
  const started = Date.now();
  let next = 0;
  let failed = 0;
  const play = () =>
    new Promise((done) => {
      const job = jobs[next];
      next += 1;
      if (job === undefined) return done();
      const child = spawn(
        process.execPath,
        [fileURLToPath(import.meta.url), "--decks", job.decks, "--seed", String(job.seed), "--max-turns", String(maxTurns), "--tally", ...(quiet ? ["--quiet"] : [])],
        { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
      );
      let out = "";
      child.stdout.on("data", (chunk) => (out += chunk));
      child.stderr.on("data", (chunk) => (out += chunk));
      child.on("close", (code) => {
        const lines = out.split("\n");
        const tallyLine = lines.find((l) => l.startsWith(TALLY_MARK));
        console.log(lines.filter((l) => !l.startsWith(TALLY_MARK)).join("\n").trimEnd());
        if (code !== 0 || tallyLine === undefined) {
          failed += 1;
          console.log(`  (this game failed: exit ${code})`);
        } else add(total, JSON.parse(tallyLine.slice(TALLY_MARK.length)));
        play().then(done);
      });
    });
  await Promise.all(Array.from({ length: Math.min(parallel, jobs.length) }, play));
  console.log(`\n== ${jobs.length - failed} games in ${Math.round((Date.now() - started) / 1000)} s${failed > 0 ? ` (${failed} failed)` : ""}\n${summary(total)}`);
  process.exit(failed > 0 ? 1 : 0);
}

// --- One game. --------------------------------------------------------------

const seed = seeds[0];
const pool = [...STRONG_DECKS, ...STARTER_DECKS];
const decks = deckSets[0].split(",").map((name) => {
  const deck = pool.find((d) => d.name.toLowerCase().includes(name.trim().toLowerCase()));
  if (deck === undefined) throw new Error(`no deck matching "${name}"`);
  return deck;
});
const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
const label = Object.fromEntries(seats.map((seat, i) => [seat, decks[i].name.split(" by ")[0].replace(" (Upgraded)", "")]));
const registry = createDefaultRegistry();
const tally = newTally();

const isCreature = (name) => registry.has(name) && registry.get(name).types.includes("creature");
/** A card that sweeps the board: a mass removal effect anywhere in what it
 * does as a spell (`bot/interaction.ts` reads a wipe the same way). */
const MASS = new Set(["destroy-all", "exile-all", "damage-all", "return-to-hand-all", "sacrifice-all", "sacrifice-all-but"]);
const sweeps = (effect) =>
  effect !== null && typeof effect === "object" && (Array.isArray(effect) ? effect.some(sweeps) : MASS.has(effect.kind) || Object.values(effect).some(sweeps));
const wipeMemo = new Map();
const isWipe = (name) => {
  let found = wipeMemo.get(name);
  if (found === undefined) {
    const def = registry.has(name) ? registry.get(name) : undefined;
    found = def !== undefined && (sweeps(def.effect) || (def.castModal?.modes ?? []).some((mode) => sweeps(mode.effect)));
    wipeMemo.set(name, found);
  }
  return found;
};
const wipesHeld = (s, seat) => s.zones.perPlayer[seat].hand.map((id) => s.objects[id]?.cardName).filter((name) => name !== undefined && isWipe(name));
const landsOf = (s, seat) =>
  s.zones.shared.battlefield.filter((id) => {
    const o = s.objects[id];
    return o?.controller === seat && registry.has(o.cardName) && registry.get(o.cardName).types.includes("land");
  }).length;
const creaturesOf = (s, seat) =>
  s.zones.shared.battlefield.filter((id) => s.objects[id]?.controller === seat && combatCreatures(s, registry, seat, false).some((c) => c.id === id));
const creatureCount = (s, seat) => combatCreatures(s, registry, seat, false).length;
const namesOnBoard = (s, seat) => creaturesOf(s, seat).map((id) => s.objects[id].cardName);

/** What each seat cast on its turn so far, and whom it attacked. */
const cast = Object.fromEntries(seats.map((s) => [s, []]));
const attacked = Object.fromEntries(seats.map((s) => [s, new Set()]));
const controllers = {};
for (const seat of seats) {
  const bot = new EvalBotController(seat, registry);
  const act = bot.act.bind(bot);
  bot.act = (view) => {
    const action = act(view);
    const s = view.state;
    if (action.type === "cast-spell" && s.turnOrder[s.turn.activePlayerIndex] === seat) {
      const name = s.objects[action.card]?.cardName;
      if (name !== undefined) cast[seat].push(name);
    }
    return action;
  };
  const declare = bot.declareAttackers.bind(bot);
  bot.declareAttackers = (view) => {
    const declared = declare(view);
    for (const d of declared) {
      const defender = view.state.players[d.defender] !== undefined ? d.defender : view.state.objects[d.defender]?.controller;
      if (defender !== undefined) attacked[seat].add(defender);
    }
    return declared;
  };
  controllers[seat] = bot;
}

const game = Game.create({
  seed,
  registry,
  controllers,
  mulligans: true,
  rules: COMMANDER_RULES,
  decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
});
console.log(`bot:outs — seed ${seed}: ${seats.map((s) => label[s]).join(", ")}`);

/** Dead-on-board turns still being followed. */
let open = [];
function close(record, s, outcome, note) {
  tally.outcome[outcome] += 1;
  const creatures = record.cast.filter(isCreature);
  const board = namesOnBoard(s, record.seat);
  let kept = 0;
  for (const name of creatures) {
    const at = board.indexOf(name);
    if (at >= 0) {
      board.splice(at, 1);
      kept += 1;
    }
  }
  if (creatures.length > 0) tally.castCreature[outcome] += 1;
  tally.creaturesCast += creatures.length;
  tally.creaturesKept += kept;
  if (outcome === "board cut") {
    tally.cutCast += creatures.length;
    tally.cutKept += kept;
  }
  if (record.ownWipes.length > 0) {
    tally.ownWipe += 1;
    if (outcome === "died") tally.ownWipeDied += 1;
  }
  if (record.othersWipes.length > 0) {
    tally.othersWipe += 1;
    if (outcome === "died") tally.othersWipeDied += 1;
  }
  if (!quiet) {
    console.log(
      `  t${record.turn} ${label[record.seat]} (${record.life} life, ${record.hand} in hand, ${record.creatures} creatures) dead to ` +
        `${record.threats.map((t) => `${label[t.seat]}'s ${t.creatures} creatures (${t.through} through)`).join(" and ")}` +
        ` — cast ${record.cast.length === 0 ? "nothing" : record.cast.join(", ")}` +
        (record.ownWipes.length > 0 ? `\n      held itself (${record.lands} lands): ${record.ownWipes.join(", ")}` : "") +
        (record.othersWipes.length > 0 ? `\n      held by others: ${record.othersWipes.join("; ")}` : "") +
        `\n      => ${outcome}${note}` +
        (creatures.length > 0 ? `; of the ${creatures.length} creature${creatures.length === 1 ? "" : "s"} it cast, ${kept} still there` : ""),
    );
  }
}

const started = Date.now();
while (!game.state.result.over && game.state.turn.number <= maxTurns) {
  const turn = game.state.turn.number;
  const active = game.state.turnOrder[game.state.turn.activePlayerIndex];
  // A followed seat's next turn begins: it lived.
  for (const record of open.filter((r) => r.seat === active)) {
    const s = game.state;
    const cut = record.threats.filter((t) => t.creatures >= 3 && creatureCount(s, t.seat) * 2 <= t.creatures);
    const hit = record.threats.some((t) => t.attackedIt);
    if (cut.length > 0) close(record, s, "board cut", ` (${cut.map((t) => `${label[t.seat]} ${t.creatures} → ${creatureCount(s, t.seat)}`).join(", ")})`);
    else if (!hit) close(record, s, "not attacked", "");
    else close(record, s, "attacked, lived", ` (${record.life} → ${s.players[record.seat].life} life)`);
  }
  open = open.filter((r) => r.seat !== active);
  cast[active] = [];
  attacked[active] = new Set();
  game.advanceUntil((s) => s.result.over || s.turn.number !== turn);
  const s = game.state;
  // Whom the turn's player went at, for the seats it had dead.
  for (const record of open) {
    for (const threat of record.threats) if (threat.seat === active && attacked[active].has(record.seat)) threat.attackedIt = true;
  }
  for (const record of open.filter((r) => s.players[r.seat].hasLost)) close(record, s, "died", ` (in ${label[active]}'s turn)`);
  open = open.filter((r) => !s.players[r.seat].hasLost);
  if (s.players[active].hasLost) continue;
  tally.turns += 1;
  // The turn's player, as it left the board: dead to one opponent's creatures
  // even with everything it has blocking?
  const everything = combatCreatures(s, registry, active, false).filter((c) => c.canBlock);
  const threats = [];
  for (const opponent of seats) {
    if (opponent === active || s.players[opponent].hasLost) continue;
    const attackers = combatCreatures(s, registry, opponent, false).filter((c) => c.canAttack);
    const through = damageThrough(attackers, everything);
    if (isLethal(s, active, through)) {
      threats.push({ seat: opponent, creatures: attackers.length, through: Math.round(through.damage - (through.gained ?? 0)), attackedIt: false });
    }
  }
  if (threats.length === 0) continue;
  tally.dead += 1;
  open.push({
    seat: active,
    turn,
    life: s.players[active].life,
    hand: s.zones.perPlayer[active].hand.length,
    creatures: creatureCount(s, active),
    cast: [...cast[active]],
    threats,
    lands: landsOf(s, active),
    ownWipes: wipesHeld(s, active),
    // The players whose board isn't the one killing it: their wipe is its out.
    othersWipes: seats
      .filter((p) => p !== active && !s.players[p].hasLost && !threats.some((t) => t.seat === p))
      .map((p) => ({ p, held: wipesHeld(s, p) }))
      .filter((x) => x.held.length > 0)
      .map((x) => `${label[x.p]} (${landsOf(s, x.p)} lands): ${x.held.join(", ")}`),
  });
}
// The game ended with turns still open: the seats that lost died, the rest
// were never asked.
for (const record of open) {
  if (game.state.players[record.seat].hasLost) close(record, game.state, "died", "");
  else tally.dead -= 1;
}
const result = game.state.result;
console.log(
  `ended turn ${game.state.turn.number}, ${!result.over ? "stopped at the turn cap" : result.winner != null ? `${label[result.winner] ?? result.winner} won` : "a draw"}, in ${Math.round((Date.now() - started) / 1000)} s\n${summary(tally)}`,
);
if (args.includes("--tally")) console.log(`${TALLY_MARK}${JSON.stringify(tally)}`);
