// What a bot change does to one kind of decision, on named decks, and whether
// it is better: every seat v2 on the current build (count budgets, so a seed
// replays), and at each decision of the kind the same bot at an older commit
// is asked the same question. Where the two disagree, each answer is played
// on by fresh v2 seats and the decider's score read at the end.
//
//   npm run bot:judge -w engine -- --kind payments --decks "The Ur-Dragon,Lathril,Atraxa,Giada"
//   npm run bot:judge -w engine -- --kind attacks --decks "Token Triumph,Grave Danger" --seeds 1-8
//   npm run bot:judge -w engine -- --kind blocks --decks "Token Triumph,Grave Danger;World Shaper,Mardu Surge" --seeds 1-4
//   npm run bot:judge -w engine -- --kind discards --decks "Edgar Markov,Y'shtola,Krenko,Pantlaza" --all
//   npm run bot:judge -w engine -- --kind removal --decks "Edgar Markov,Giada,Ureni,Pantlaza" --seeds 1-6 --to-end
//   npm run bot:judge -w engine -- --kind answers --decks "Grave Danger,Mardu Surge,Sultai Arisen,World Shaper" --seeds 1-8
//
// `bot:diff` says what changed over the sample decks, which hardly raise some
// decisions at all (an optional payment: 1 in 12,000 there, ten a game on the
// strong decks), and not whether a change was for the better. This asks one
// kind of decision on the decks that raise it, and judges each disagreement:
//
// - `--kind payments`: an optional cost on the decider's own turn, a shock
//   land's life, a reveal land. Judged at the end of the turn.
// - `--kind discards`: which cards to discard. Judged as the decider's next
//   turn begins (what it kept is for then).
// - `--kind attacks`: an attack declaration. Judged as the attacker's next
//   turn begins, so the blocks, the crackback and whether it lived are in it.
// - `--kind blocks`: a block declaration. Judged as the blocker's next turn
//   begins: the damage it took, what it lost, and what the creatures it kept
//   then did.
// - `--kind removal`: what a removal is aimed at, and whether it is fired: a
//   window where either build casts or activates something that destroys,
//   exiles, bounces, burns or steals, at an opponent's permanent, or picks
//   such a target for a trigger. The old build is a second controller for
//   each seat, shown every decision the seat makes, so it has a turn's plan
//   in hand as the playing one does (a build shadowing itself agrees at
//   every decision). Twice the thinking, so a game takes about twice as
//   long as the other kinds'. Judged as the decider's turn two
//   rounds on begins (`--rounds N`): what an engine does shows later than
//   what a block does. The evaluation that judges is the one that aims the
//   removal today, so read the plain counts beside it, or use `--to-end`.
//
// **How much, not how often.** Each disagreement's gap is the decider's
// evaluation after the new answer less after the old one, and the totals add
// the gaps up: a block that saves 23 life and one that costs 1 come to +22,
// not "one each". The summary gives the net in the evaluation's points, what
// was gained and lost and the largest gap each way, and beside it the plain
// counts, each the new answer's less the old one's: the decider's life, and
// its opponents' life added together (negative is the new answer leaving
// them lower). A line where one answer
// left the decider out of the game and the other didn't is counted apart
// (its gap is the evaluation's price of losing, which would drown the rest),
// and one where both did is even.
//
// **Several games at once.** `--seeds 1-8` (or `1,3,5`) and several deck sets
// (`--decks "A,B;C,D,E,F"`) are a game each, played `--parallel` at a time
// (default 6: a game holds two card pools) in a process of its own, each
// printed whole as it ends and all of them totalled at the bottom.
//
// Flags: --base REF (default origin/main; built once into
// `.scratch/baseline/<sha>/`), --decks "A,B[,C,D][;…]" (strong decks first,
// then the upgraded and starter ones, by substring), --seed N (default 1) or
// --seeds, --parallel N, --max-turns N (default 60), --all (print the
// decisions the builds agree on too), --no-judge (list the disagreements,
// play nothing out), --weights JSON (evaluation weights for the new side alone,
// merged onto the defaults: a weight judged without a build of its own),
// --rounds N (how many of the decider's turns on a line
// is judged at, where the kind judges by rounds: 1, or 2 for removal),
// --to-end (play each line to the end of the game as well and count who
// won: slow, a game's remainder twice a disagreement).
//
// The judge is v2's own play and evaluation, and noisy for it: one mana less
// has given a turn 36 points better. Trust a verdict where the two lines did
// the same things, or one a superset of the other, and read the big gaps on
// their boards. It plays `dist/` as it stands: build first, and don't rebuild
// while it runs.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  COMMANDER_RULES,
  DEFAULT_WEIGHTS,
  EvalBotController,
  Game,
  STARTER_DECKS,
  STRONG_DECKS,
  asPlayerId,
  createDefaultRegistry,
  describeMove,
  evaluateState,
} from "../dist/index.js";
import { baselineDist, importBuild } from "./baseline-build.mjs";
import { progress } from "./progress.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const KINDS = ["payments", "discards", "attacks", "blocks", "removal", "answers"];
/** Decisions `--kind answers` leaves to the other kinds, or that no search
 * weighs: the rest are the answers a spell or ability asks for as it
 * resolves or enters (a sacrifice, a target for a trigger, a mode, a word
 * as a permanent enters). */
const NOT_ANSWERS = new Set(["attackers", "blockers", "mulligan", "discard", "pay-life-for-untapped", "reveal-for-untapped", "order-triggers"]);
const kind = flag("kind", "");
if (!KINDS.includes(kind)) {
  console.error(`bot:judge needs --kind ${KINDS.join(" | ")}`);
  process.exit(1);
}
const maxTurns = Number(flag("max-turns", "60"));
const showAll = args.includes("--all");
const judging = !args.includes("--no-judge");
const toEnd = args.includes("--to-end");
/** The decider's turns on at which a by-rounds kind is judged. */
const rounds = Math.max(1, Number(flag("rounds", kind === "removal" ? "2" : "1")));
const base = flag("base", "origin/main");
// `--weights JSON`: evaluation weights merged onto the defaults for the new
// side alone (the seats that play the game and the answer judged as "new"),
// so a weight is judged against the base without a build of its own. The
// lines are still played on and scored by the default weights: one judge for
// both answers.
const weightsFlag = flag("weights", null);
const newWeights = weightsFlag === null ? null : { ...DEFAULT_WEIGHTS, ...JSON.parse(weightsFlag) };
for (const key of Object.keys(newWeights ?? {})) {
  if (!(key in DEFAULT_WEIGHTS)) throw new Error(`--weights: unknown weight "${key}"`);
}

/** "1-8", "1,3,5" or both mixed: the seeds to play. */
const seedsOf = (text) =>
  text.split(",").flatMap((part) => {
    const [from, to] = part.split("-").map((n) => Number(n.trim()));
    if (!Number.isInteger(from) || (to !== undefined && !Number.isInteger(to))) throw new Error(`--seeds: "${part}" is not a seed or a range`);
    return to === undefined ? [from] : Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  });
const seeds = flag("seeds", null) !== null ? seedsOf(flag("seeds", "")) : [Number(flag("seed", "1"))];
const deckSets = flag("decks", "The Ur-Dragon,Lathril,Atraxa,Giada")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s !== "");

const TALLY_MARK = "@@tally ";
const newTally = () => ({
  asked: 0,
  differ: 0,
  newBetter: 0,
  oldBetter: 0,
  even: 0,
  /** The gaps added up, over the lines both answers lived through. */
  points: 0,
  gained: 0,
  lost: 0,
  best: 0,
  worst: 0,
  ownLife: 0,
  opponentsLife: 0,
  /** One answer left the decider out and the other didn't. */
  newLivedOnly: 0,
  oldLivedOnly: 0,
  bothOut: 0,
  /** With `--to-end`: the lines the decider went on to win. */
  wonNew: 0,
  wonOld: 0,
});
const signed = (n, digits = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}`;
/** A tally in words: the counts, then how much. */
function summary(t) {
  if (t.differ === 0) return `${t.asked} ${kind} decisions, 0 where the builds differ`;
  if (!judging) return `${t.asked} ${kind} decisions, ${t.differ} where the builds differ`;
  const lived =
    t.newLivedOnly + t.oldLivedOnly + t.bothOut > 0
      ? `; the decider out of the game: only under the old answer ${t.newLivedOnly}, only under the new ${t.oldLivedOnly}, either way ${t.bothOut}`
      : "";
  const won = toEnd ? `\n  played to the end: the decider won ${t.wonNew} of ${t.differ} under the new answer, ${t.wonOld} under the old` : "";
  return (
    `${t.asked} ${kind} decisions, ${t.differ} where the builds differ: new better ${t.newBetter}, old better ${t.oldBetter}, even ${t.even}\n` +
    `  net ${signed(t.points)} points for the new build (gained ${t.gained.toFixed(1)}, lost ${t.lost.toFixed(1)}; best ${signed(t.best)}, worst ${signed(t.worst)}); ` +
    `its own life ${signed(t.ownLife, 0)}, its opponents' life ${signed(t.opponentsLife, 0)}${lived}${won}`
  );
}

// --- Several games: one process each, totalled. -----------------------------

const jobs = deckSets.flatMap((decks) => seeds.map((seed) => ({ decks, seed })));
if (jobs.length > 1) {
  // Built here once, so the games don't each start the same build.
  const baseline = baselineDist(base);
  const parallel = Math.max(1, Number(flag("parallel", "6")));
  const passed = ["--kind", kind, "--base", base, "--max-turns", String(maxTurns), ...(showAll ? ["--all"] : []), ...(judging ? [] : ["--no-judge"]), ...(toEnd ? ["--to-end"] : []), "--rounds", String(rounds), ...(weightsFlag === null ? [] : ["--weights", weightsFlag])];
  console.log(`bot:judge — ${kind}, working build vs ${base} (${baseline.sha}): ${jobs.length} games, ${parallel} at a time`);
  const total = newTally();
  const started = Date.now();
  // The job-progress mod's bar (progress.mjs): a game a unit.
  const bar = progress("bot:judge", jobs.length);
  let next = 0;
  let failed = 0;
  const play = () =>
    new Promise((done) => {
      const job = jobs[next];
      next += 1;
      if (job === undefined) return done();
      const child = spawn(
        process.execPath,
        [fileURLToPath(import.meta.url), ...passed, "--decks", job.decks, "--seed", String(job.seed), "--tally"],
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
          for (const key of Object.keys(total)) {
            if (key === "best") total.best = Math.max(total.best, t.best);
            else if (key === "worst") total.worst = Math.min(total.worst, t.worst);
            else total[key] += t[key];
          }
        }
        console.log("");
        bar.tick({ failed: code !== 0 || tallyLine === undefined });
        play().then(done);
      });
    });
  await Promise.all(Array.from({ length: Math.min(parallel, jobs.length) }, play));
  bar.finish();
  console.log(
    `== ${jobs.length - failed} games in ${Math.round((Date.now() - started) / 1000)} s${failed > 0 ? ` (${failed} failed)` : ""}: ${summary(total)}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

// --- One game. --------------------------------------------------------------

const seed = seeds[0];
const wanted = deckSets[0].split(",").map((s) => s.trim());
const pool = [...STRONG_DECKS, ...STARTER_DECKS];
const decks = wanted.map((name) => {
  const deck = pool.find((d) => d.name.toLowerCase().includes(name.toLowerCase()));
  if (deck === undefined) throw new Error(`no deck matching "${name}"`);
  return deck;
});
const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
const label = Object.fromEntries(seats.map((seat, i) => [seat, decks[i].name.split(" by ")[0].replace(" (Upgraded)", "")]));

const baseline = baselineDist(base);
const old = await importBuild(baseline.dist);
const registry = createDefaultRegistry();
const oldRegistry = old.createDefaultRegistry();

const tally = newTally();
/** A gap under this is the two lines coming out the same. */
const EVEN = 1;
let game;

const livesOf = (s) => seats.map((p) => (s.players[p].hasLost ? "out" : s.players[p].life)).join("/");

/**
 * The game played on from here by fresh v2 seats, `first` dispatched for the
 * decider: to the end of the turn, or to the decider's next turn (`round`).
 * The decider's score there, its life and its opponents', whether it is out,
 * and what it cast on the way.
 */
function playedOn(seat, first, round, wholeGame = false) {
  const snapshot = { ...game.snapshot(), eventLog: [] };
  const turn = snapshot.turn.number;
  // `round`: false is the end of the turn, true the decider's next turn, a
  // number that many of its turns on.
  const wait = round === true ? 1 : round === false ? 0 : round;
  let ownTurns = 0;
  let counted = turn;
  const did = [];
  const controllers = {};
  for (const s of seats) {
    const bot = new EvalBotController(s, registry);
    if (s === seat) {
      const act = bot.act.bind(bot);
      bot.act = (view) => {
        const action = act(view);
        if (action.type === "cast-spell") did.push(describeMove(view.state, action, registry).replace(/^Cast /, "").slice(0, 40));
        return action;
      };
    }
    controllers[s] = bot;
  }
  const sim = Game.fromSnapshot(snapshot, { registry, controllers });
  try {
    sim.dispatch(first);
    sim.advanceUntil((st) => {
      if (st.result.over || st.players[seat].hasLost) return true;
      if (wholeGame) return st.turn.number > maxTurns;
      if (st.turn.number === turn) return false;
      if (wait === 0) return true;
      if (st.turnOrder[st.turn.activePlayerIndex] === seat && st.turn.number !== counted) {
        counted = st.turn.number;
        ownTurns += 1;
      }
      return ownTurns >= wait || st.turn.number > turn + wait * seats.length + 1;
    });
  } catch (error) {
    return { score: NaN, died: false, won: false, life: 0, opponents: 0, note: `refused: ${String(error?.message ?? error).slice(0, 80)}` };
  }
  const e = sim.state;
  return {
    score: evaluateState(e, registry, seat, DEFAULT_WEIGHTS),
    died: e.players[seat].hasLost,
    won: e.result.over && e.result.winner === seat,
    life: e.players[seat].hasLost ? 0 : e.players[seat].life,
    opponents: seats.filter((p) => p !== seat).reduce((sum, p) => sum + (e.players[p].hasLost ? 0 : e.players[p].life), 0),
    note: `lives ${livesOf(e)}${did.length > 0 ? `; cast ${did.join(", ")}` : ""}`,
  };
}

/** Print one decision: both answers, and the verdict where they differ. */
function report(seat, state, what, mine, theirs, say, first, round, context) {
  tally.asked += 1;
  const same = say(mine) === say(theirs);
  if (same && !showAll) return;
  let verdict = "";
  if (!same) {
    tally.differ += 1;
    if (judging) {
      const [a, b] = [playedOn(seat, first(mine), round), playedOn(seat, first(theirs), round)];
      const gap = a.score - b.score;
      let which;
      if (Number.isNaN(gap)) {
        tally.even += 1;
        which = "even (a line was refused)";
      } else if (a.died && b.died) {
        tally.even += 1;
        tally.bothOut += 1;
        which = "even (out either way)";
      } else if (a.died !== b.died) {
        if (a.died) {
          tally.oldBetter += 1;
          tally.oldLivedOnly += 1;
          which = "OLD BETTER: the new answer is out of the game";
        } else {
          tally.newBetter += 1;
          tally.newLivedOnly += 1;
          which = "new better: the old answer is out of the game";
        }
      } else {
        tally.points += gap;
        if (gap > 0) tally.gained += gap;
        else tally.lost -= gap;
        tally.best = Math.max(tally.best, gap);
        tally.worst = Math.min(tally.worst, gap);
        tally.ownLife += a.life - b.life;
        tally.opponentsLife += a.opponents - b.opponents;
        const lives = `own life ${signed(a.life - b.life, 0)}, opponents' ${signed(a.opponents - b.opponents, 0)}`;
        if (Math.abs(gap) < EVEN) {
          tally.even += 1;
          which = `even (${signed(gap)}; ${lives})`;
        } else if (gap > 0) {
          tally.newBetter += 1;
          which = `new better by ${gap.toFixed(1)} (${lives})`;
        } else {
          tally.oldBetter += 1;
          which = `OLD BETTER by ${(-gap).toFixed(1)} (${lives})`;
        }
      }
      const line = (o) => `${Number.isNaN(o.score) ? "—" : o.score.toFixed(1)}${o.died ? " OUT" : ""} (${o.note})`;
      verdict = `\n      played on: new ${line(a)}\n                 old ${line(b)}\n      => ${which}`;
      if (toEnd) {
        const [endA, endB] = [playedOn(seat, first(mine), round, true), playedOn(seat, first(theirs), round, true)];
        if (endA.won) tally.wonNew += 1;
        if (endB.won) tally.wonOld += 1;
        const ended = (o) => (o.won ? "won" : o.died ? "out" : "undecided at the turn cap");
        verdict += `\n      to the end: new ${ended(endA)} (${endA.note.split(";")[0]}), old ${ended(endB)} (${endB.note.split(";")[0]})`;
      }
    }
  }
  console.log(
    `${same ? "  same  " : "  DIFFER"} t${state.turn.number} ${label[seat]} ${state.turn.step} (lives ${livesOf(state)}) — ${what}\n` +
      `      new: ${say(mine)}\n` +
      (same ? "" : `      old: ${say(theirs)}\n`) +
      `      ${context}${verdict}`,
  );
}

const handOf = (s, seat) => s.zones.perPlayer[seat].hand.map((id) => s.objects[id]?.cardName).join(", ") || "nothing";
const landsOf = (s, seat) =>
  s.zones.shared.battlefield.filter((id) => {
    const o = s.objects[id];
    return o?.controller === seat && registry.has(o.cardName) && registry.get(o.cardName).types.includes("land");
  }).length;
// Whether a card removes a permanent it targets, read off its definition
// (its spell, a mode, a trigger or an ability): destroy, exile, bounce,
// damage, steal, or put it into a library.
const REMOVES = new Set(["destroy", "exile", "return-to-hand", "gain-control", "damage", "put-on-library", "shuffle-into-library"]);
const removing = new Map();
const removes = (name) => {
  if (name === undefined || !registry.has(name)) return false;
  let found = removing.get(name);
  if (found === undefined) {
    const def = registry.get(name);
    const walk = (node) =>
      node !== null &&
      typeof node === "object" &&
      (Array.isArray(node)
        ? node.some(walk)
        : (typeof node.kind === "string" && REMOVES.has(node.kind) && typeof node.target === "number") || Object.values(node).some(walk));
    found = walk([def.effect, def.castModal, def.triggered, def.activated]);
    removing.set(name, found);
  }
  return found;
};
/** A declaration's entries as names with counts, in a fixed order. */
const counted = (names) => {
  const count = new Map();
  for (const [name, n] of names) count.set(name, (count.get(name) ?? 0) + n);
  return [...count].map(([n, c]) => (c > 1 ? `${n} x${c}` : n)).sort().join(", ") || "nothing";
};

const controllers = {};
for (const seat of seats) {
  const newBot = () => new EvalBotController(seat, registry, newWeights === null ? {} : { weights: newWeights });
  const bot = newBot();
  // The old build reads the working game's state through its own module's
  // caches, which that game's mutations never reach: cleared before it is
  // asked anything, as `bot-diff-worker.mjs` does (a 7/7 read as 5/5 there).
  const oldBot = () => {
    old.invalidateComputedCache?.();
    return new old.EvalBotController(seat, oldRegistry);
  };
  if (kind === "removal") {
    // The old build as a second controller for this seat, shown every
    // decision the seat makes, so it carries a turn's plan as the playing
    // one does (`bot-diff-worker.mjs`'s way: asked afresh at each window, a
    // removal cast as a step of a planned turn was never the fresh answer,
    // and half the removals went unjudged). The same build shadowing itself
    // answers the same at every decision.
    const shadow = new old.EvalBotController(seat, oldRegistry);
    const act = bot.act.bind(bot);
    bot.act = (view) => {
      const s = view.state;
      const a = s.awaiting;
      const mine = act(view);
      let theirs;
      try {
        old.invalidateComputedCache?.();
        theirs = shadow.act(view);
      } catch {
        return mine;
      }
      // Which card's removal a move aims at an opponent's permanent.
      const sourceOf = (x) =>
        x.type === "cast-spell"
          ? s.objects[x.card]?.cardName
          : x.type === "activate-ability"
            ? s.objects[x.source]?.cardName
            : x.type === "choose-targets" && a?.source !== undefined
              ? s.objects[a.source]?.cardName
              : undefined;
      const aims = (x) => {
        const source = sourceOf(x);
        if (source === undefined || !removes(source) || x.targets === undefined) return false;
        return [x.targets].flat(4).some((t) => {
          if (t === null || t === undefined || t.kind !== "object") return false;
          const o = s.objects[t.object];
          return o !== undefined && o.zone === "battlefield" && o.controller !== seat;
        });
      };
      if (aims(mine) || aims(theirs)) {
        const source = a?.source !== undefined ? ` (${s.objects[a.source]?.cardName})` : "";
        report(seat, s, `removal${source}`, mine, theirs, (x) => describeMove(s, x, registry), (x) => x, rounds, `hand: ${handOf(s, seat)}`);
      }
      return mine;
    };
  } else if (kind === "attacks") {
    const declare = bot.declareAttackers.bind(bot);
    bot.declareAttackers = (view) => {
      const s = view.state;
      const mine = declare(view);
      const theirs = oldBot().declareAttackers(view);
      const say = (decl) =>
        counted(
          decl.map((d) => [
            `${s.objects[d.attacker]?.cardName} > ${label[d.defender] ?? "a planeswalker"}`,
            d.count ?? s.objects[d.attacker]?.stackCount ?? 1,
          ]),
        );
      // Both nothing is no decision at all.
      if (mine.length > 0 || theirs.length > 0) {
        const first = (decl) => ({ type: "declare-attackers", player: seat, attackers: decl });
        report(seat, s, "attack", mine, theirs, say, first, rounds, `hand: ${handOf(s, seat)}`);
      }
      return mine;
    };
  } else if (kind === "blocks") {
    const declare = bot.declareBlockers.bind(bot);
    bot.declareBlockers = (view) => {
      const s = view.state;
      const mine = declare(view);
      const theirs = oldBot().declareBlockers(view);
      const say = (decl) =>
        counted(
          decl.map((b) => [
            `${s.objects[b.blocker]?.cardName} blocks ${s.objects[b.attacker]?.cardName}`,
            b.count ?? s.objects[b.blocker]?.stackCount ?? 1,
          ]),
        );
      if (mine.length > 0 || theirs.length > 0) {
        const attackers = counted(
          s.zones.shared.battlefield
            .filter((id) => {
              const target = s.objects[id]?.attacking ?? null;
              return target !== null && (target === seat || s.objects[target]?.controller === seat);
            })
            .map((id) => [s.objects[id].cardName, s.objects[id].stackCount ?? 1]),
        );
        const first = (decl) => ({ type: "declare-blockers", player: seat, blocks: decl });
        report(seat, s, "block", mine, theirs, say, first, rounds, `attacked by: ${attackers}`);
      }
      return mine;
    };
  } else {
    const act = bot.act.bind(bot);
    bot.act = (view) => {
      const s = view.state;
      const a = s.awaiting;
      const own = s.turnOrder[s.turn.activePlayerIndex] === seat;
      const asked =
        a !== null &&
        a.player === seat &&
        (kind === "discards"
          ? a.kind === "discard"
          : kind === "answers"
            ? s.turn.number >= 1 && !NOT_ANSWERS.has(a.kind) && !(a.kind === "choose-modes" && a.cost !== undefined)
            : own &&
            (a.kind === "pay-life-for-untapped" || a.kind === "reveal-for-untapped" || (a.kind === "choose-modes" && a.cost !== undefined)));
      if (!asked) return act(view);
      const theirs = oldBot().act(view);
      const mine = act(view);
      const source = a.source !== undefined ? s.objects[a.source]?.cardName : undefined;
      const say =
        kind === "discards"
          ? (x) => (x.type === "discard" ? x.cards.map((id) => s.objects[id]?.cardName).sort().join(" + ") || "nothing" : x.type)
          : (x) => `${describeMove(s, x, registry)}${x.type === "pay-life-for-untapped" ? (x.pay ? " (pay)" : " (don't)") : x.type === "reveal-for-untapped" ? (x.reveal == null ? " (don't)" : " (reveal)") : ""}`;
      const what = `${a.kind}${source !== undefined ? ` (${source})` : ""}${a.cost !== undefined ? ` ${a.cost}` : ""}`;
      report(seat, s, what, mine, theirs, say, (x) => x, kind === "payments" ? false : rounds, `${landsOf(s, seat)} lands; hand: ${handOf(s, seat)}`);
      return mine;
    };
  }
  controllers[seat] = bot;
}

console.log(`bot:judge — ${kind}, working build${weightsFlag === null ? "" : ` with ${weightsFlag}`} vs ${base} (${baseline.sha}), seed ${seed}: ${seats.map((s) => label[s]).join(", ")}`);
game = Game.create({
  seed,
  registry,
  controllers,
  mulligans: true,
  rules: COMMANDER_RULES,
  decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
});
const started = Date.now();
game.advanceUntil((s) => s.result.over || s.turn.number > maxTurns);
const result = game.state.result;
const how = !result.over ? "stopped at the turn cap" : result.winner != null ? `${label[result.winner] ?? result.winner} won` : (result.reason ?? "a draw");
console.log(`ended turn ${game.state.turn.number}, ${how} (lives ${livesOf(game.state)}), in ${Math.round((Date.now() - started) / 1000)} s; ${summary(tally)}`);
if (args.includes("--tally")) console.log(`${TALLY_MARK}${JSON.stringify(tally)}`);
