// What a bot change does to one kind of decision, on named decks, and whether
// it is better: every seat v2 on the current build (count budgets, so a seed
// replays), and at each decision of the kind the same bot at an older commit
// is asked the same question. Where the two disagree, each answer is played
// on by fresh v2 seats and the decider's score read at the end.
//
//   npm run bot:judge -w engine -- --kind payments --decks "The Ur-Dragon,Lathril,Atraxa,Giada"
//   npm run bot:judge -w engine -- --kind attacks --decks "Token Triumph,Grave Danger" --seed 3
//   npm run bot:judge -w engine -- --kind discards --decks "Edgar Markov,Y'shtola,Krenko,Pantlaza" --all
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
//
// Flags: --base REF (default origin/main; built once into
// `.scratch/baseline/<sha>/`), --decks "A,B[,C,D]" (strong decks first, then
// the upgraded and starter ones, by substring), --seed N (default 1),
// --max-turns N (default 60), --all (print the decisions the builds agree on
// too), --no-judge (list the disagreements, play nothing out).
//
// The judge is v2's own play and evaluation, and noisy for it: one mana less
// has given a turn 36 points better. Trust a verdict where the two lines did
// the same things, or one a superset of the other, and read the big gaps on
// their boards. It plays `dist/` as it stands: build first, and don't rebuild
// while it runs.

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

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const KINDS = ["payments", "discards", "attacks"];
const kind = flag("kind", "");
if (!KINDS.includes(kind)) {
  console.error(`bot:judge needs --kind ${KINDS.join(" | ")}`);
  process.exit(1);
}
const seed = Number(flag("seed", "1"));
const maxTurns = Number(flag("max-turns", "60"));
const showAll = args.includes("--all");
const judging = !args.includes("--no-judge");
const wanted = flag("decks", "The Ur-Dragon,Lathril,Atraxa,Giada").split(",").map((s) => s.trim());
const pool = [...STRONG_DECKS, ...STARTER_DECKS];
const decks = wanted.map((name) => {
  const deck = pool.find((d) => d.name.toLowerCase().includes(name.toLowerCase()));
  if (deck === undefined) throw new Error(`no deck matching "${name}"`);
  return deck;
});
const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
const label = Object.fromEntries(seats.map((seat, i) => [seat, decks[i].name.split(" by ")[0].replace(" (Upgraded)", "")]));

const baseline = baselineDist(flag("base", "origin/main"));
const old = await importBuild(baseline.dist);
const registry = createDefaultRegistry();
const oldRegistry = old.createDefaultRegistry();

const tally = { asked: 0, differ: 0, newBetter: 0, oldBetter: 0, even: 0, newDied: 0, oldDied: 0 };
/** A gap under this is the two lines coming out the same. */
const EVEN = 1;
let game;

const livesOf = (s) => seats.map((p) => (s.players[p].hasLost ? "out" : s.players[p].life)).join("/");

/**
 * The game played on from here by fresh v2 seats, `first` dispatched for the
 * decider: to the end of the turn, or to the decider's next turn (`round`).
 * The decider's score there, whether it is out, and what it cast on the way.
 */
function playedOn(seat, first, round) {
  const snapshot = { ...game.snapshot(), eventLog: [] };
  const turn = snapshot.turn.number;
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
      if (st.turn.number === turn) return false;
      if (!round) return true;
      return st.turnOrder[st.turn.activePlayerIndex] === seat || st.turn.number > turn + seats.length + 1;
    });
  } catch (error) {
    return { score: NaN, died: false, note: `refused: ${String(error?.message ?? error).slice(0, 80)}` };
  }
  const e = sim.state;
  return {
    score: evaluateState(e, registry, seat, DEFAULT_WEIGHTS),
    died: e.players[seat].hasLost,
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
      if (a.died) tally.newDied += 1;
      if (b.died) tally.oldDied += 1;
      const gap = a.score - b.score;
      const which = Number.isNaN(gap) || Math.abs(gap) < EVEN ? "even" : gap > 0 ? "new better" : "OLD BETTER";
      if (which === "even") tally.even += 1;
      else if (which === "new better") tally.newBetter += 1;
      else tally.oldBetter += 1;
      const line = (o) => `${Number.isNaN(o.score) ? "—" : o.score.toFixed(1)}${o.died ? " OUT" : ""} (${o.note})`;
      verdict =
        `\n      played on: new ${line(a)}\n                 old ${line(b)}` +
        `\n      => ${which}${which === "even" ? "" : ` by ${Math.abs(gap).toFixed(1)}`}`;
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

const controllers = {};
for (const seat of seats) {
  const bot = new EvalBotController(seat, registry);
  const oldBot = () => new old.EvalBotController(seat, oldRegistry);
  if (kind === "attacks") {
    const declare = bot.declareAttackers.bind(bot);
    bot.declareAttackers = (view) => {
      const s = view.state;
      const mine = declare(view);
      const theirs = oldBot().declareAttackers(view);
      const say = (decl) => {
        const count = new Map();
        for (const d of decl) {
          const name = `${s.objects[d.attacker]?.cardName} > ${label[d.defender] ?? "a planeswalker"}`;
          count.set(name, (count.get(name) ?? 0) + (d.count ?? s.objects[d.attacker]?.stackCount ?? 1));
        }
        return [...count].map(([n, c]) => (c > 1 ? `${n} x${c}` : n)).sort().join(", ") || "nothing";
      };
      // Both nothing is no decision at all.
      if (mine.length > 0 || theirs.length > 0) {
        const first = (decl) => ({ type: "declare-attackers", player: seat, attackers: decl });
        report(seat, s, "attack", mine, theirs, say, first, true, `hand: ${handOf(s, seat)}`);
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
      report(seat, s, what, mine, theirs, say, (x) => x, kind === "discards", `${landsOf(s, seat)} lands; hand: ${handOf(s, seat)}`);
      return mine;
    };
  }
  controllers[seat] = bot;
}

console.log(`bot:judge — ${kind}, working build vs ${flag("base", "origin/main")} (${baseline.sha}), seed ${seed}: ${seats.map((s) => label[s]).join(", ")}`);
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
console.log(
  `ended turn ${game.state.turn.number} in ${Math.round((Date.now() - started) / 1000)} s; ${tally.asked} ${kind} decisions, ${tally.differ} where the builds differ` +
    (judging && tally.differ > 0
      ? `: new better ${tally.newBetter}, old better ${tally.oldBetter}, even ${tally.even}; out before the judging ended: new ${tally.newDied}, old ${tally.oldDied}`
      : ""),
);
