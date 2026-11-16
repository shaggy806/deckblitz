// The report over a `bot:engines` log (`bot-engines.mjs` says what is logged).
// Four readings of the same games, each asking whether a way of sorting cards
// — EDHREC's salt score, its rank, the bots' own `engineScore`, or what the
// card's definition says it does — tells apart the cards worth answering:
//
// 1. card by card, the **lift**: what a turn brings past its board with the
//    card in play, against the same deck's turns without it at the same stage;
// 2. turn by turn: a board's cards counted by each sorting, against what the
//    turn then brought and whether it was a 15+ turn;
// 3. game by game: the same counts on the board a deck has in round 6,
//    against whether it wins;
// 4. the bots' removal: what it took against what was there to take.
//
// "Brought" is capped at 40 either way: a handful of turns bring hundreds (a
// doubled token stack), and a mean would read only those.

import { readFileSync } from "node:fs";

import { createDefaultRegistry } from "../dist/index.js";
import { edhrecRankOf } from "../dist/cards/edhrec-rank.js";
import { saltScoreOf } from "../dist/cards/salt-score.js";

const CAP = 40;
const BIG = 15;
const WIN_ROUND = 6;
const mean = (xs) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);
const pct = (x, w = 6) => `${(100 * x).toFixed(1)}%`.padStart(w);
const brought = (t) => Math.max(-CAP, Math.min(CAP, Math.max(t.combat + t.other, t.powerAfter) - t.powerBefore));
const big = (t) => (brought(t) >= BIG ? 1 : 0);
const stageOf = (t) => (t.round <= 4 ? 0 : t.round <= 7 ? 1 : t.round <= 10 ? 2 : 3);

/** Least squares through the origin (the columns are already centred). */
function solve(cols, target) {
  const n = cols.length;
  const A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  for (let r = 0; r < target.length; r += 1) {
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) A[i][j] += cols[i][r] * cols[j][r];
      A[i][n] += cols[i][r] * target[r];
    }
  }
  for (let i = 0; i < n; i += 1) A[i][i] += 1e-6;
  for (let i = 0; i < n; i += 1) {
    let p = i;
    for (let r = i + 1; r < n; r += 1) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const f = A[r][i] / A[i][i];
      for (let c = i; c <= n; c += 1) A[r][c] -= f * A[i][c];
    }
  }
  const b = A.map((row, i) => row[n] / row[i]);
  let left = 0;
  let total = 0;
  for (let r = 0; r < target.length; r += 1) {
    let fit = 0;
    for (let i = 0; i < n; i += 1) fit += cols[i][r] * b[i];
    left += (target[r] - fit) ** 2;
    total += target[r] ** 2;
  }
  return { b, explained: total === 0 ? 0 : 1 - left / total };
}

/** `value` of each item less the mean of its group: the group taken out. */
function centred(items, groupOf, value) {
  const groups = new Map();
  for (const item of items) {
    const key = groupOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const out = new Map();
  for (const list of groups.values()) {
    const m = mean(list.map(value));
    for (const item of list) out.set(item, value(item) - m);
  }
  return items.map((item) => out.get(item));
}

function spearman(xs, ys) {
  const rank = (v) => {
    const order = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
    const out = new Array(v.length);
    for (let i = 0; i < order.length; ) {
      let j = i;
      while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j += 1;
      for (let k = i; k <= j; k += 1) out[order[k][1]] = (i + j) / 2;
      i = j + 1;
    }
    return out;
  };
  const [rx, ry] = [rank(xs), rank(ys)];
  const [mx, my] = [mean(rx), mean(ry)];
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < rx.length; i += 1) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy);
}

export function report(file, { min = 20 } = {}) {
  const games = readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  if (games.length === 0) return console.log("no games logged");
  const registry = createDefaultRegistry();

  // What a card is, read off its definition; a card is one thing, the first
  // of these it is.
  const memo = new Map();
  const classOf = (name) => {
    let c = memo.get(name);
    if (c === undefined) {
      const def = registry.has(name) ? registry.get(name) : undefined;
      const abilities = def === undefined ? "" : JSON.stringify([def.triggered ?? [], def.activated ?? []]);
      const statics = def?.static ?? [];
      c = {
        mana: abilities.includes('"add-mana"'),
        token: abilities.includes('"create-token"'),
        grows:
          abilities.includes('"add-counter') ||
          statics.some((st) => (st.grantPt !== undefined || (st.grantKeywords ?? []).length > 0) && st.affects?.scope !== "self" && st.affects?.scope !== "attached"),
        draws: abilities.includes('"draw"'),
        salt: saltScoreOf(name),
        rank: edhrecRankOf(name) ?? 99999,
      };
      memo.set(name, c);
    }
    return c;
  };
  const kindOf = (c) => {
    const k = classOf(c.name);
    return c.commander ? "commander" : k.mana ? "mana" : k.token ? "token maker" : k.grows ? "counters or anthem" : k.draws ? "draws" : "none of these";
  };
  /** The ways of sorting a board's non-mana cards: bands, each a test of a card. */
  const SORTINGS = {
    "a card is a card": { "non-mana card": () => true },
    "by salt": {
      "salt up to 0.3": (c) => classOf(c.name).salt <= 0.3,
      "salt 0.3 to 0.6": (c) => classOf(c.name).salt > 0.3 && classOf(c.name).salt <= 0.6,
      "salt 0.6 to 1.0": (c) => classOf(c.name).salt > 0.6 && classOf(c.name).salt <= 1,
      "salt over 1.0": (c) => classOf(c.name).salt > 1,
    },
    "by EDHREC rank": {
      "rank 1-300": (c) => classOf(c.name).rank <= 300,
      "rank 301-1500": (c) => classOf(c.name).rank > 300 && classOf(c.name).rank <= 1500,
      "rank 1501-5000": (c) => classOf(c.name).rank > 1500 && classOf(c.name).rank <= 5000,
      "rank past 5000": (c) => classOf(c.name).rank > 5000,
    },
    "by the bots' engineScore": {
      "engineScore 0": (c) => c.score === 0,
      "engineScore up to 1": (c) => c.score > 0 && c.score <= 1,
      "engineScore over 1": (c) => c.score > 1,
    },
    "by what the card does": Object.fromEntries(
      ["commander", "token maker", "counters or anthem", "draws", "none of these"].map((k) => [k, (c) => kindOf(c) === k]),
    ),
  };
  const nonMana = (board) => board.filter((c) => !classOf(c.name).mana);
  /** Each sorting's counts on `boardOf(item)`, fitted to each target. */
  const sortings = (items, boardOf, groupOf, powerOf, targets) => {
    const mana = centred(items, groupOf, (x) => boardOf(x).length - nonMana(boardOf(x)).length);
    const power = centred(items, groupOf, powerOf);
    const ys = targets.map((t) => centred(items, groupOf, t.value));
    for (const [name, bands] of Object.entries(SORTINGS)) {
      const counts = Object.values(bands).map((test) => (x) => nonMana(boardOf(x)).filter(test).length);
      const cols = [...counts.map((f) => centred(items, groupOf, f)), mana, power];
      const fits = ys.map((y) => solve(cols, y));
      console.log(` ${name}: explains ${fits.map((f, i) => `${pct(f.explained, 0)} of ${targets[i].label}`).join(", ")}`);
      for (const [i, band] of Object.keys(bands).entries()) {
        console.log(
          `    one more ${band.padEnd(20)} (${mean(items.map(counts[i])).toFixed(2)} a board)  ` +
            fits.map((f, j) => `${targets[j].unit(f.b[i])} ${targets[j].short}`).join("   "),
        );
      }
    }
  };

  const turns = games.flatMap((g) => g.turns.map((t) => ({ ...t, seed: g.seed })));
  console.log(
    `\n${games.length} games, ${turns.length} turns taken; a turn brought ${mean(turns.map(brought)).toFixed(1)} past its board on average, ${BIG} or more on ${pct(mean(turns.map(big)), 0)} of turns`,
  );

  // --- 1. Card by card. -------------------------------------------------------
  const byDeck = new Map();
  for (const t of turns) {
    if (!byDeck.has(t.deck)) byDeck.set(t.deck, [[], [], [], []]);
    byDeck.get(t.deck)[stageOf(t)].push(t);
  }
  const cards = new Map();
  for (const t of turns) {
    for (const c of t.before) {
      const key = `${t.deck}|${c.name}`;
      if (!cards.has(key)) cards.set(key, { ...c, deck: t.deck, turns: new Set(), scores: [] });
      cards.get(key).turns.add(t);
      cards.get(key).scores.push(c.score);
    }
  }
  const rows = [];
  for (const c of cards.values()) {
    if (c.turns.size < min) continue;
    let lift = 0;
    let weight = 0;
    let bigWith = 0;
    let bigWithout = 0;
    let without = 0;
    for (const all of byDeck.get(c.deck)) {
      const withIt = all.filter((t) => c.turns.has(t));
      const rest = all.filter((t) => !c.turns.has(t));
      if (withIt.length < 3 || rest.length < 3) continue;
      lift += withIt.length * (mean(withIt.map(brought)) - mean(rest.map(brought)));
      weight += withIt.length;
      bigWith += withIt.filter(big).length;
      bigWithout += rest.filter(big).length;
      without += rest.length;
    }
    if (weight < min / 2) continue;
    rows.push({ ...c, n: c.turns.size, lift: lift / weight, big: bigWith / weight, bigWithout: without === 0 ? 0 : bigWithout / without, engine: mean(c.scores) });
  }
  rows.sort((a, b) => b.lift - a.lift);
  const line = (r) =>
    `  ${r.name.slice(0, 32).padEnd(32)} ${r.deck.replace(" (Upgraded)", "").split(" by ")[0].slice(0, 20).padEnd(20)} ${String(r.n).padStart(4)}  lift ${r.lift.toFixed(1).padStart(5)}  ${BIG}+ turns ${pct(r.big, 4)} vs ${pct(r.bigWithout, 4)}` +
    `  salt ${classOf(r.name).salt.toFixed(2)}  rank ${String(classOf(r.name).rank === 99999 ? "—" : classOf(r.name).rank).padStart(5)}  engine ${r.engine.toFixed(1)}  ${kindOf(r)}`;
  console.log(`\n1. Card by card: ${rows.length} cards in play for ${min}+ of their deck's turns. The highest lift:`);
  for (const r of rows.slice(0, 20)) console.log(line(r));
  if (rows.length >= 10) {
    const lifts = rows.map((r) => r.lift);
    console.log(
      `   how each number orders these cards against the lift (Spearman; 1 the same order, 0 none): salt ${spearman(rows.map((r) => classOf(r.name).salt), lifts).toFixed(2)}, ` +
        `EDHREC rank ${spearman(rows.map((r) => -classOf(r.name).rank), lifts).toFixed(2)}, engineScore ${spearman(rows.map((r) => r.engine), lifts).toFixed(2)}`,
    );
    const byKind = new Map();
    for (const r of rows) {
      const k = kindOf(r);
      if (!byKind.has(k)) byKind.set(k, []);
      byKind.get(k).push(r);
    }
    console.log(`   mean lift by what the card does: ${[...byKind].map(([k, list]) => `${k} ${mean(list.map((r) => r.lift)).toFixed(1)} (${list.length})`).join(", ")}`);
  }

  // --- 2. Turn by turn. -------------------------------------------------------
  console.log("\n2. Turn by turn: a board's non-mana cards counted by each sorting (beside its mana sources and its power; deck and stage taken out):");
  sortings(turns, (t) => t.before, (t) => `${t.deck}|${stageOf(t)}`, (t) => t.powerBefore, [
    { label: "what a turn brought", short: "brought", value: brought, unit: (b) => b.toFixed(2).padStart(6) },
    { label: `the ${BIG}+ turns`, short: `chance of a ${BIG}+ turn`, value: big, unit: (b) => pct(b) },
  ]);

  // --- 3. Game by game. -------------------------------------------------------
  const seats = [];
  for (const g of games) {
    for (const deck of g.decks) {
      const t = g.turns.find((x) => x.deck === deck && x.round === WIN_ROUND);
      if (t !== undefined) seats.push({ deck, board: t.before, power: t.powerBefore, won: g.winner === deck ? 1 : 0 });
    }
  }
  console.log(
    `\n3. Game by game: the board each of ${seats.length} decks had as its turn of round ${WIN_ROUND} began, against winning (${pct(mean(seats.map((s) => s.won)), 0)} did; the deck's own rate taken out):`,
  );
  sortings(seats, (s) => s.board, (s) => s.deck, (s) => s.power, [{ label: "who won", short: "chance of winning", value: (s) => s.won, unit: (b) => pct(b) }]);

  // --- 4. The bots' removal. --------------------------------------------------
  const commanders = new Set(turns.flatMap((t) => t.before.filter((c) => c.commander).map((c) => c.name)));
  const kindByName = (name) => kindOf({ name, commander: commanders.has(name) });
  const removals = games.flatMap((g) => g.removals.filter((r) => !r.token));
  const sameType = (r) => r.others.filter((o) => o.types.some((t) => r.targetTypes.includes(t)));
  console.log(`\n4. The bots' removal: ${removals.length} aimed at an opponent's card (${(removals.length / games.length).toFixed(1)} a game). What was taken, against the cards of its type the opponents had then:`);
  const KINDS = ["commander", "token maker", "counters or anthem", "draws", "mana", "none of these"];
  const taken = Object.fromEntries(KINDS.map((k) => [k, 0]));
  const there = Object.fromEntries(KINDS.map((k) => [k, 0]));
  for (const r of removals) {
    taken[kindByName(r.target)] += 1;
    for (const o of sameType(r)) there[kindByName(o.name)] += 1;
  }
  const allThere = Object.values(there).reduce((a, b) => a + b, 0);
  for (const k of KINDS) {
    console.log(
      `    ${k.padEnd(20)} taken ${String(taken[k]).padStart(4)} (${pct(taken[k] / Math.max(1, removals.length), 5)})   there ${String(there[k]).padStart(5)} (${pct(there[k] / Math.max(1, allThere), 5)})   taken per one there ${(there[k] === 0 ? 0 : taken[k] / there[k]).toFixed(2)}`,
    );
  }
  const of3 = (value, valueOther) =>
    `taken ${mean(removals.map(value)).toFixed(2)}, the most of its type there ${mean(removals.map((r) => Math.max(0, ...sameType(r).map(valueOther)))).toFixed(2)}, one of its type at random ${mean(removals.map((r) => mean(sameType(r).map(valueOther)))).toFixed(2)}`;
  console.log(`   salt: ${of3((r) => saltScoreOf(r.target), (o) => saltScoreOf(o.name))}`);
  console.log(`   engineScore: ${of3((r) => r.targetScore, (o) => o.score)}`);
}
