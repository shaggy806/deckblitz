// A whole bot game written out to read: every seat v2 at the live clock, on
// decks named by the caller, each turn's board and every decision that isn't
// a pass, with how v2 reached it (a search, v1's cast unscored, a replay).
// For looking over the bots' play by eye: `bot:replay` shows where the time
// goes, this shows what was played.
//
//   npm run bot:watch -w engine -- --decks "The Ur-Dragon,Lathril,Atraxa,Giada" [--seed 1] [--budget 1000] [--max-turns 120]
//
// `--decks` matches each name against the strong decks first, then the
// upgraded and starter decks (a case-insensitive substring). Build first
// (it plays `dist/`); it prints to stdout, a few hundred lines a game.

import {
  COMMANDER_RULES,
  EvalBotController,
  Game,
  STARTER_DECKS,
  STRONG_DECKS,
  asPlayerId,
  computeCharacteristics,
  createDefaultRegistry,
  describeMove,
} from "../dist/index.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const seed = Number(flag("seed", "1"));
const budget = Number(flag("budget", "1000"));
const maxTurns = Number(flag("max-turns", "120"));
const wanted = flag("decks", "The Ur-Dragon,Lathril,Atraxa,Giada").split(",").map((s) => s.trim());

const pool = [...STRONG_DECKS, ...STARTER_DECKS];
const decks = wanted.map((name) => {
  const deck = pool.find((d) => d.name.toLowerCase().includes(name.toLowerCase()));
  if (deck === undefined) throw new Error(`no deck matching "${name}"`);
  return deck;
});
const seats = ["alice", "bob", "carol", "dave"].slice(0, decks.length).map(asPlayerId);
const label = Object.fromEntries(seats.map((seat, i) => [seat, decks[i].name.split(" by ")[0]]));
const registry = createDefaultRegistry();

const viaCounts = {};
const controllers = {};
let game;
for (const seat of seats) {
  const bot = new EvalBotController(seat, registry, { timeBudgetMs: budget });
  const act = bot.act.bind(bot);
  bot.act = (view) => {
    const started = Date.now();
    const action = act(view);
    const ms = Date.now() - started;
    const audit = bot.lastDecision;
    const via = audit?.via ?? "-";
    const kind = view.state.awaiting?.kind ?? "priority";
    viaCounts[`${kind}: ${via}`] = (viaCounts[`${kind}: ${via}`] ?? 0) + 1;
    if (action.type !== "pass-priority") {
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

console.log(`watch-game: seed ${seed}, ${budget} ms a decision — ${seats.map((s) => `${s} = ${decks[seats.indexOf(s)].name}`).join("; ")}`);
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
game.advanceUntil((s) => {
  if (s.turn.number !== lastTurn) {
    lastTurn = s.turn.number;
    const active = s.turnOrder[s.turn.activePlayerIndex];
    console.log(`\n== Turn ${s.turn.number} (round ${Math.ceil(s.turn.number / seats.length)}) — ${label[active]} — ${Math.round((Date.now() - started) / 1000)} s`);
    console.log(summary(s));
  }
  for (const seat of seats) {
    if (s.players[seat].hasLost && !lost.has(seat)) {
      lost.add(seat);
      console.log(`  *** ${label[seat]} is out (turn ${s.turn.number})`);
    }
  }
  return s.result.over || s.turn.number > maxTurns;
});
console.log(`\n== End: turn ${game.state.turn.number}, ${JSON.stringify(game.state.result)}`);
console.log(summary(game.state));
console.log("\nHow each decision was reached:");
for (const [key, n] of Object.entries(viaCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(6)}  ${key}`);
