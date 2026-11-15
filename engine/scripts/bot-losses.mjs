// A screen for losses worth reading: every seat v2 (count budgets, so a seed
// replays), and for each seat eliminated, what it did on its own last turn
// and in the windows after it that the loss may turn on. A loss is flagged
// when one of these holds:
//
// - **tapped away**: creatures it had tapped for something other than an
//   attack (a cost, mana) would have made the attack that killed it one the
//   block arithmetic survives;
// - **attacked itself open**: the same, of the creatures it attacked with on
//   its own last turn;
// - **blocks**: the arithmetic had it alive against that attack as it was
//   declared, and it died to it anyway (its blocks, a trick, a trigger);
// - **answer held**: it was offered a cast of removal, a counterspell, a
//   wipe or damage prevention in the turn it died, and still held the card;
// - **wipe unplayed**: it could have cast a wipe on its own last turn, didn't,
//   and died to creatures;
// - **life spent**: it paid or cost itself more life since its last turn
//   began than it died by;
// - **own turn**: it lost on its own turn (a payment, a draw from nothing).
//
// Each is a reason to read, not a verdict: a flagged loss prints the
// `bot:watch` command that shows those turns alone
// (`docs/plans/bot-next-steps.md`, step 4).
//
//   npm run bot:losses -w engine -- --seeds 1-6 --decks "Token Triumph,Grave Danger,World Shaper,Mardu Surge;The Ur-Dragon,Lathril,Atraxa,Giada"
//
// Flags: --decks "A,B,C,D[;…]" (by substring, strong decks first), --seed N or
// --seeds "1-8", --parallel N (default 6, a process a game), --max-turns N
// (default 100), --all (unflagged losses too), --quiet (totals only). It
// plays `dist/`: build first.

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
  describeMove,
  isLethal,
} from "../dist/index.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const maxTurns = Number(flag("max-turns", "100"));
const quiet = args.includes("--quiet");
const all = args.includes("--all");
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

/** Life a seat spent on itself below which "life spent" isn't worth a read:
 * a fetch land and a shock land are 3, and every strong deck pays them. */
const LIFE_SPENT_FLOOR = 4;
const TALLY_MARK = "@@tally ";
const FLAGS = ["tapped away", "attacked itself open", "blocks", "answer held", "wipe unplayed", "life spent", "own turn"];
const newTally = () => ({ losses: 0, flagged: 0, flags: Object.fromEntries(FLAGS.map((f) => [f, 0])) });
const pct = (n, of) => (of === 0 ? "—" : `${Math.round((100 * n) / of)}%`);
const summary = (t) =>
  [
    `${t.losses} seats eliminated, ${t.flagged} (${pct(t.flagged, t.losses)}) worth a read`,
    ...FLAGS.filter((f) => t.flags[f] > 0).map((f) => `  ${f.padEnd(21)} ${String(t.flags[f]).padStart(3)}`),
  ].join("\n");

// --- Several games: one process each, totalled. -----------------------------

const jobs = deckSets.flatMap((decks) => seeds.map((seed) => ({ decks, seed })));
if (jobs.length > 1) {
  const parallel = Math.max(1, Number(flag("parallel", "6")));
  console.log(`bot:losses — ${jobs.length} games, ${parallel} at a time`);
  const total = newTally();
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
        [
          fileURLToPath(import.meta.url),
          ...["--decks", job.decks, "--seed", String(job.seed), "--max-turns", String(maxTurns), "--tally"],
          ...(quiet ? ["--quiet"] : []),
          ...(all ? ["--all"] : []),
        ],
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
        } else {
          const t = JSON.parse(tallyLine.slice(TALLY_MARK.length));
          total.losses += t.losses;
          total.flagged += t.flagged;
          for (const f of FLAGS) total.flags[f] += t.flags[f];
        }
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

// What a card held back could have answered with, read off its effect tree
// (a mode of a modal spell counts): a reason to read, so loose is fine.
const MASS = new Set(["destroy-all", "exile-all", "damage-all", "return-to-hand-all", "sacrifice-all", "sacrifice-all-but"]);
const AIMED = new Set(["destroy", "exile", "damage", "return-to-hand", "fight", "tap", "gain-control"]);
const has = (effect, test) =>
  effect !== null && typeof effect === "object" && (Array.isArray(effect) ? effect.some((e) => has(e, test)) : test(effect) || Object.values(effect).some((v) => has(v, test)));
const kindMemo = new Map();
function answerKind(name) {
  let found = kindMemo.get(name);
  if (found === undefined) {
    found = null;
    const def = registry.has(name) ? registry.get(name) : undefined;
    if (def !== undefined && !def.types.includes("land")) {
      const ways = [def.effect, ...(def.castModal?.modes ?? []).map((mode) => mode.effect)];
      const any = (test) => ways.some((effect) => has(effect, test));
      const spell = def.types.includes("instant") || def.types.includes("sorcery");
      if (any((e) => MASS.has(e.kind))) found = "wipe";
      else if (any((e) => e.kind === "counter")) found = "counterspell";
      else if (any((e) => typeof e.kind === "string" && e.kind.startsWith("prevent"))) found = "prevention";
      else if (spell && any((e) => AIMED.has(e.kind) && typeof e.target === "number")) found = "removal";
    }
    kindMemo.set(name, found);
  }
  return found;
}

const nameOf = (s, id) => {
  const o = s.objects[id];
  return o === undefined ? "?" : `${o.cardName}${(o.stackCount ?? 1) > 1 ? ` x${o.stackCount}` : ""}`;
};
const tallyNames = (names) => {
  const count = new Map();
  for (const n of names) count.set(n, (count.get(n) ?? 0) + 1);
  return [...count].map(([n, k]) => (k > 1 ? `${n} x${k}` : n)).join(", ");
};
const handOf = (s, seat) => s.zones.perPlayer[seat].hand.map((id) => s.objects[id]?.cardName).filter((n) => n !== undefined);

/** Per seat: its own last turn, and what has happened to it since. */
const fresh = (turn, life) => ({
  turn,
  lifeStart: life,
  lifeEnd: life,
  moves: [],
  attackerIds: new Set(),
  attackedWith: [],
  wipesOffered: new Set(),
  wipesCast: new Set(),
  lifeSpent: 0,
  /** After its turn: what it did in other players' turns, by turn. */
  later: [],
});
const last = Object.fromEntries(seats.map((s) => [s, null]));
/** Per seat, for the turn being played: the attacks declared at it, the
 * answers it was offered a cast of and the ones it cast, its hand as it
 * last looked. */
const now = Object.fromEntries(seats.map((s) => [s, { attacks: [], offered: new Map(), cast: [], hand: [] }]));

let game;
const controllers = {};
for (const seat of seats) {
  const bot = new EvalBotController(seat, registry);
  const act = bot.act.bind(bot);
  bot.act = (view) => {
    const s = view.state;
    const mine = s.turnOrder[s.turn.activePlayerIndex] === seat;
    const hand = handOf(s, seat);
    now[seat].hand = hand;
    // An attack it was never asked to block (nothing of its own could), read
    // again once the attack's triggers have resolved: Kangee's +2/+0 to the
    // flyers made 7 power 13, and "alive with its attackers home" untrue.
    if (!mine && s.turn.step === "declare-blockers") {
      const before = now[seat].attacks[now[seat].attacks.length - 1];
      if (before !== undefined && before.when === "declared") {
        const active = s.turnOrder[s.turn.activePlayerIndex];
        const attackers = combatCreatures(s, registry, active, false).filter((c) => s.objects[c.id]?.attacking === seat);
        if (attackers.length > 0) now[seat].attacks[now[seat].attacks.length - 1] = attackOn(s, active, seat, attackers, "unblocked");
      }
    }
    // The answers it could cast right now. Asked only with one in hand, at
    // priority: `legalActions` is a pure read.
    if (s.awaiting === undefined || s.awaiting === null) {
      const held = hand.filter((n) => answerKind(n) !== null);
      if (held.length > 0) {
        for (const offer of view.legalActions()) {
          if (offer.kind !== "cast-spell" || answerKind(offer.cardName) === null) continue;
          if (mine) {
            if (answerKind(offer.cardName) === "wipe") last[seat]?.wipesOffered.add(offer.cardName);
          } else if (!now[seat].offered.has(offer.cardName)) now[seat].offered.set(offer.cardName, s.turn.step);
        }
      }
    }
    const action = act(view);
    if (action.type !== "pass-priority" && (action.type === "cast-spell" || action.type === "activate-ability" || action.type === "play-land")) {
      const text = describeMove(s, action, registry);
      if (mine) last[seat]?.moves.push(text);
      else last[seat]?.later.push(`t${s.turn.number} ${s.turn.step}: ${text}`);
      if (action.type === "cast-spell") {
        const name = s.objects[action.card]?.cardName;
        if (name !== undefined) {
          now[seat].cast.push(name);
          if (mine) last[seat]?.wipesCast.add(name);
        }
      }
    }
    return action;
  };
  const declare = bot.declareAttackers.bind(bot);
  bot.declareAttackers = (view) => {
    const declared = declare(view);
    const s = view.state;
    const record = last[seat];
    if (record !== null && s.turnOrder[s.turn.activePlayerIndex] === seat) {
      for (const d of declared) {
        record.attackerIds.add(d.attacker);
        const at = s.players[d.defender] !== undefined ? d.defender : s.objects[d.defender]?.controller;
        record.attackedWith.push(`${nameOf(s, d.attacker)} → ${label[at] ?? "?"}`);
      }
    }
    // The attack as declared at each player.
    const mineAll = combatCreatures(s, registry, seat, false);
    for (const defender of seats) {
      if (defender === seat || s.players[defender].hasLost) continue;
      const attackers = [];
      for (const d of declared) {
        if (d.defender !== defender) continue;
        const copies = mineAll.filter((c) => c.id === d.attacker);
        attackers.push(...copies.slice(0, d.count ?? copies.length));
      }
      if (attackers.length > 0) now[defender].attacks.push(attackOn(s, seat, defender, attackers, "declared"));
    }
    return declared;
  };
  // The same attack as the defender blocks: after the attack's triggers
  // (Atarka's double strike, a pump on attack), which is the board its
  // blocks answer. It stands in for the one read at the declaration.
  const block = bot.declareBlockers.bind(bot);
  bot.declareBlockers = (view) => {
    const s = view.state;
    const active = s.turnOrder[s.turn.activePlayerIndex];
    const attackers = combatCreatures(s, registry, active, false).filter((c) => s.objects[c.id]?.attacking === seat);
    const snapshot = attackers.length > 0 ? attackOn(s, active, seat, attackers, "blocked") : null;
    const blocks = block(view);
    if (snapshot !== null) {
      snapshot.blocks = blocks.length;
      const list = now[seat].attacks;
      const before = list[list.length - 1];
      if (before !== undefined && before.by === active && before.when === "declared") list.pop();
      list.push(snapshot);
    }
    return blocks;
  };
  controllers[seat] = bot;
}

/** An attack on `defender` as the block arithmetic reads it, with what that
 * player's tapped creatures would have changed had they been home. */
function attackOn(s, by, defender, attackers, when) {
  const theirs = combatCreatures(s, registry, defender, false);
  const tapped = theirs.filter((c) => s.objects[c.id]?.tapped === true);
  const attackedLast = last[defender]?.attackerIds ?? new Set();
  const fromAttack = tapped.filter((c) => attackedLast.has(c.id));
  const other = tapped.filter((c) => !attackedLast.has(c.id));
  const home = (extra) => theirs.map((c) => (extra.includes(c) ? { ...c, canBlock: true } : c));
  const lethalWith = (blockers) => isLethal(s, defender, damageThrough(attackers, blockers));
  const through = damageThrough(attackers, theirs);
  const names = (list) => tallyNames(list.map((c) => s.objects[c.id]?.cardName ?? "?"));
  return {
    by,
    when,
    blocks: 0,
    life: s.players[defender].life,
    attackers: names(attackers),
    power: attackers.reduce((sum, c) => sum + Math.max(0, c.damage) * (c.keywords.has("double-strike") ? 2 : 1), 0),
    blockers: theirs.filter((c) => c.canBlock).length,
    through: Math.round(through.damage - (through.gained ?? 0)),
    lethal: isLethal(s, defender, through),
    other: names(other),
    fromAttack: names(fromAttack),
    lethalWithOther: other.length > 0 ? lethalWith(home(other)) : null,
    lethalWithAttack: fromAttack.length > 0 ? lethalWith(home(fromAttack)) : null,
    lethalWithBoth: other.length > 0 && fromAttack.length > 0 ? lethalWith(home(tapped)) : null,
  };
}

game = Game.create({
  seed,
  registry,
  controllers,
  mulligans: true,
  rules: COMMANDER_RULES,
  decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
});
const deckArg = deckSets[0];
console.log(`bot:losses — seed ${seed}: ${seats.map((s) => label[s]).join(", ")}`);

function report(seat, s, turn, active, reason, lifeNow) {
  tally.losses += 1;
  const record = last[seat];
  const seen = now[seat];
  const flags = [];
  const notes = [];
  const byCombat = seen.attacks.length > 0 && active !== seat;
  if (active === seat) {
    flags.push("own turn");
    notes.push(`lost on its own turn: ${reason}`);
  }
  if (byCombat) {
    // The attack that killed it: the last one declared at it this turn.
    const a = seen.attacks[seen.attacks.length - 1];
    const line =
      `${label[a.by]} attacked it at ${a.life} life with ${a.attackers} (${a.power} power) into ${a.blockers} untapped blocker${a.blockers === 1 ? "" : "s"}: ` +
      `${a.through} through on paper ${a.when === "blocked" ? `as it blocked (${a.blocks} block${a.blocks === 1 ? "" : "s"})` : a.when === "unblocked" ? "(nothing of its own could block)" : "as declared"}`;
    if (!a.lethal && a.when === "blocked") {
      flags.push("blocks");
      notes.push(`${line} — not lethal, and it died`);
    } else if (!a.lethal) {
      // Never asked to block (nothing that could): what killed it came
      // after the declaration, and there was no block to get wrong.
      notes.push(`${line} — not lethal then; the attack grew, or something else finished it`);
    } else if (a.lethalWithOther === false) {
      flags.push("tapped away");
      notes.push(`${line}; with ${a.other} untapped it lives`);
    } else if (a.lethalWithAttack === false) {
      flags.push("attacked itself open");
      notes.push(`${line}; with its own attackers home (${a.fromAttack}) it lives`);
    } else if (a.lethalWithBoth === false) {
      flags.push("tapped away", "attacked itself open");
      notes.push(`${line}; with ${a.other} untapped and its attackers home (${a.fromAttack}) it lives`);
    } else notes.push(line);
  }
  // Answers it was offered a cast of this turn and still held. A
  // counterspell answers no attack: it counts only for a loss outside combat.
  const held = [...seen.hand];
  const unplayed = [];
  for (const [name, step] of seen.offered) {
    const at = held.indexOf(name);
    if (at < 0 || (byCombat && answerKind(name) === "counterspell")) continue;
    held.splice(at, 1);
    unplayed.push(`${name} (${answerKind(name)}, castable from ${step})`);
  }
  if (unplayed.length > 0) {
    flags.push("answer held");
    notes.push(`held with the mana to cast: ${unplayed.join(", ")}`);
  }
  if (record !== null) {
    const wipes = [...record.wipesOffered].filter((n) => !record.wipesCast.has(n));
    if (wipes.length > 0 && byCombat) {
      flags.push("wipe unplayed");
      notes.push(`could cast on its own turn ${record.turn} and didn't: ${wipes.join(", ")}`);
    }
    const overkill = Math.max(0, -lifeNow);
    if (record.lifeSpent >= LIFE_SPENT_FLOOR && reason.startsWith("life total") && overkill < record.lifeSpent) {
      flags.push("life spent");
      notes.push(`spent ${record.lifeSpent} life of its own since turn ${record.turn} began (at ${record.lifeStart}), and died by ${overkill}`);
    }
  }
  if (flags.length > 0) {
    tally.flagged += 1;
    for (const f of new Set(flags)) tally.flags[f] += 1;
  }
  if (quiet || (flags.length === 0 && !all)) return;
  const from = record?.turn ?? turn;
  console.log(
    `  t${turn} ${label[seat]} out in ${label[active]}'s turn (${reason})${flags.length > 0 ? `  [${[...new Set(flags)].join("; ")}]` : ""}` +
      notes.map((n) => `\n      ${n}`).join("") +
      (record !== null
        ? `\n      its turn ${record.turn} (${record.lifeStart} → ${record.lifeEnd} life): ${record.moves.join("; ") || "no plays"}` +
          `${record.attackedWith.length > 0 ? `; attacked with ${record.attackedWith.join(", ")}` : "; no attack"}` +
          (record.later.length > 0 ? `\n      after it: ${record.later.join("; ")}` : "")
        : "") +
      `\n      hand as it died: ${seen.hand.join(", ") || "nothing"}` +
      (flags.length > 0 ? `\n      read: npm run bot:watch -w engine -- --decks "${deckArg}" --seed ${seed} --count --turns ${from}-${turn}` : ""),
  );
}

const started = Date.now();
let seenEvents = 0;
const out = new Set();
/** A seat's life just before the event that took it out. */
const lifeAt = Object.fromEntries(seats.map((s) => [s, 0]));
while (!game.state.result.over && game.state.turn.number <= maxTurns) {
  const turn = game.state.turn.number;
  const active = game.state.turnOrder[game.state.turn.activePlayerIndex];
  if (!game.state.players[active].hasLost) last[active] = fresh(turn, game.state.players[active].life);
  for (const seat of seats) now[seat] = { attacks: [], offered: new Map(), cast: [], hand: now[seat].hand };
  game.advanceUntil((s) => s.result.over || s.turn.number !== turn);
  const s = game.state;
  const events = game.events;
  const lost = [];
  for (let i = seenEvents; i < events.length; i += 1) {
    const e = events[i];
    if (e.type === "life-paid" && last[e.player] != null) last[e.player].lifeSpent += e.amount;
    else if (e.type === "life-changed") {
      lifeAt[e.player] = e.life;
      // A loss its own effect caused (Reanimate): spent, like a payment.
      if (e.delta < 0 && e.byEffectOf === e.player && last[e.player] != null) last[e.player].lifeSpent += -e.delta;
    } else if (e.type === "damage-dealt" && !e.combat && e.target?.kind === "player" && e.target.player === e.by && last[e.by] != null) {
      // Damage from its own source (a City of Brass, a Mana Confluence).
      last[e.by].lifeSpent += e.amount;
    } else if (e.type === "player-lost") lost.push(e);
  }
  seenEvents = events.length;
  if (last[active] !== null && last[active].turn === turn && !s.players[active].hasLost) last[active].lifeEnd = s.players[active].life;
  for (const e of lost) {
    if (out.has(e.player)) continue;
    out.add(e.player);
    report(e.player, s, turn, active, e.reason, lifeAt[e.player]);
  }
}
const result = game.state.result;
console.log(
  `ended turn ${game.state.turn.number}, ${!result.over ? "stopped at the turn cap" : result.winner != null ? `${label[result.winner] ?? result.winner} won` : "a draw"}, in ${Math.round((Date.now() - started) / 1000)} s` +
    (jobs.length === 1 ? `\n${summary(tally)}` : ""),
);
if (args.includes("--tally")) console.log(`${TALLY_MARK}${JSON.stringify(tally)}`);
