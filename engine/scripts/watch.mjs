// A localhost page of the games a bot tool is playing, each in miniature:
// the turn, every seat's life and cards, its permanents, the stack and the
// last few plays, with the finished games and the running score above them.
//
// Two halves. A tool's main process calls `startWatch` and hands it what its
// workers send (`update` a running game, `finish` one that ended); a worker
// calls `watchGame` on the controllers of a game before it plays, which posts
// a snapshot about once a second as the seats are asked their decisions.
// Wrapping `act` reads the state and changes nothing, so a watched game plays
// as an unwatched one does (count budgets; under a wall-clock budget the
// snapshot is a millisecond or two a second).
//
//   npm run bot:ab -w engine -- --base origin/main      (prints the page's address)
//   --no-watch to go without, --watch-port N for another port than 4020.

import http from "node:http";

/** How many finished games the page lists (the score counts them all). */
const FINISHED_SHOWN = 200;

/**
 * Serve the page on 127.0.0.1, at `port` or the first free one of the ten
 * after it. Resolves to the page's handle, or `null` if none could be had:
 * the run goes on unwatched.
 *
 * `score(rows)` turns the finished rows into the line shown above the games
 * (the tool knows what its outcomes mean).
 */
export async function startWatch({ title, total, port = 4020, score = () => "" }) {
  const running = new Map();
  const finished = [];
  const started = Date.now();
  const state = () =>
    JSON.stringify({
      title,
      total,
      now: Date.now(),
      elapsed: Date.now() - started,
      score: score(finished),
      done: finished.length,
      games: [...running.values()].sort((a, b) => a.seed - b.seed),
      finished: finished.slice(-FINISHED_SHOWN),
    });
  const server = http.createServer((request, response) => {
    if (request.url === "/state") {
      response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(state());
      return;
    }
    if (request.url === "/" || request.url === "/index.html") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(PAGE);
      return;
    }
    response.writeHead(404);
    response.end();
  });
  const listen = (at) =>
    new Promise((resolve) => {
      server.once("error", () => resolve(false));
      server.listen(at, "127.0.0.1", () => resolve(true));
    });
  let bound = null;
  for (let at = port; at < port + 10 && bound === null; at += 1) {
    server.removeAllListeners("error");
    if (await listen(at)) bound = at;
  }
  if (bound === null) return null;
  server.on("error", () => {});
  // The page never keeps a finished run alive.
  server.unref();
  return {
    url: `http://localhost:${bound}/`,
    /** A running game's latest snapshot (`watchGame` posts them). */
    update(snapshot) {
      running.set(snapshot.seed, { ...snapshot, at: Date.now() });
    },
    /** A game ended: `row` is the tool's own result row, with its `seed`. */
    finish(row) {
      const last = running.get(row.seed);
      running.delete(row.seed);
      finished.push({ ...row, ...(last === undefined ? {} : { seats: last.seats.map(({ seat, deck, build, life, lost }) => ({ seat, deck, build, life, lost })) }) });
    },
    close() {
      server.close();
    },
  };
}

/** A card's or an ability's name as the page shows it. */
const nameOf = (object) =>
  object === undefined ? "?" : object.faceDown !== undefined ? "face-down card" : object.kind === "ability" ? `${object.cardName} (ability)` : object.cardName;

/** One play, in a few words, or `null` for a pass and the small answers. */
function playOf(state, action) {
  const name = (id) => nameOf(state.objects[id]);
  switch (action.type) {
    case "cast-spell":
      return `casts ${name(action.card)}`;
    case "play-land":
      return `plays ${name(action.card)}`;
    case "activate-ability":
      return `activates ${name(action.source)}`;
    case "declare-attackers":
      return (action.attackers?.length ?? 0) > 0 ? `attacks with ${action.attackers.length}` : null;
    case "declare-blockers":
      return (action.blocks?.length ?? 0) > 0 ? `blocks with ${action.blocks.length}` : null;
    case "mulligan":
      return action.keep === false ? "mulligans" : null;
    default:
      return null;
  }
}

/**
 * Watch one game: wrap each of `controllers`' `act` so the game's state is
 * posted (`post({ watch })`) at most every `everyMs` as its seats decide.
 *
 * `lib` is the build the game runs on (its `computeCharacteristics` reads a
 * creature's size), `seats` says who sits where: `{ seat, deck, build }`,
 * `build` being whatever the tool calls its sides ("new", "base").
 */
export function watchGame({ lib, registry, seed, controllers, seats, post, everyMs = 1000 }) {
  let last = 0;
  const plays = [];
  const snapshot = (state) => {
    const boards = Object.fromEntries(seats.map(({ seat }) => [seat, { lands: 0, landsTapped: 0, chips: new Map() }]));
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      const board = boards[object?.controller];
      if (object === undefined || board === undefined) continue;
      let types = [];
      let size = "";
      try {
        const chars = lib.computeCharacteristics(state, registry, id);
        types = chars.types;
        if (types.includes("creature")) size = `${chars.power}/${chars.toughness}`;
      } catch {
        // A read that fails costs the page a size, never the game anything.
      }
      const count = object.stackCount ?? 1;
      if (types.includes("land") && !types.includes("creature")) {
        board.lands += count;
        if (object.tapped) board.landsTapped += count;
        continue;
      }
      const kind = types.includes("creature") ? "creature" : types.includes("planeswalker") ? "planeswalker" : "other";
      const name = nameOf(object);
      const key = `${kind}|${name}|${size}|${object.tapped ? 1 : 0}`;
      const chip = board.chips.get(key) ?? { name, kind, size, tapped: object.tapped === true, n: 0 };
      chip.n += count;
      board.chips.set(key, chip);
    }
    const order = { creature: 0, planeswalker: 1, other: 2 };
    return {
      seed,
      turn: state.turn.number,
      active: state.turnOrder[state.turn.activePlayerIndex],
      step: state.turn.step,
      seats: seats.map(({ seat, deck, build }) => {
        const zones = state.zones.perPlayer[seat];
        const player = state.players[seat];
        const board = boards[seat];
        return {
          seat,
          deck,
          build,
          life: player?.life ?? 0,
          lost: player?.hasLost === true,
          hand: zones?.hand.length ?? 0,
          library: zones?.library.length ?? 0,
          graveyard: zones?.graveyard.length ?? 0,
          lands: board.lands,
          landsTapped: board.landsTapped,
          permanents: [...board.chips.values()].sort((a, b) => order[a.kind] - order[b.kind] || b.n - a.n || (a.name < b.name ? -1 : 1)),
        };
      }),
      stack: state.zones.shared.stack.map((id) => ({ name: nameOf(state.objects[id]), by: state.objects[id]?.controller ?? "" })),
      plays: plays.slice(-6),
    };
  };
  for (const { seat } of seats) {
    const controller = controllers[seat];
    const act = controller.act.bind(controller);
    controller.act = (view) => {
      const action = act(view);
      try {
        const play = playOf(view.state, action);
        if (play !== null) {
          plays.push({ turn: view.state.turn.number, seat, text: play });
          if (plays.length > 12) plays.splice(0, plays.length - 12);
        }
        const now = Date.now();
        if (now - last >= everyMs) {
          last = now;
          post({ watch: snapshot(view.state) });
        }
      } catch {
        // Watching never stops a game.
      }
      return action;
    };
  }
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Bot games</title>
<style>
  :root { color-scheme: light dark; --bg: #f4f1ea; --tile: #fffdf8; --ink: #1d1b16; --dim: #6b665b; --line: #d9d3c4; --new: #1f6f43; --base: #6b665b; --chip: #ece6d6; --tapped: #b9b3a3; --turn: #b3541e; }
  @media (prefers-color-scheme: dark) { :root { --bg: #15161a; --tile: #1e2026; --ink: #e8e6df; --dim: #9a968a; --line: #33363f; --new: #6fd39b; --base: #9a968a; --chip: #2a2d36; --tapped: #5a5d68; --turn: #f0a060; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 14px 16px 40px; background: var(--bg); color: var(--ink); font: 13px/1.35 system-ui, "Segoe UI", sans-serif; }
  header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 18px; margin-bottom: 10px; }
  h1 { font-size: 17px; margin: 0; font-weight: 650; }
  .score { font-size: 15px; font-weight: 600; }
  .dim { color: var(--dim); }
  #finished { display: flex; flex-wrap: wrap; gap: 3px; margin: 0 0 12px; }
  .result { font: 11px/1 ui-monospace, Consolas, monospace; padding: 3px 5px; border-radius: 3px; background: var(--chip); color: var(--dim); }
  .result.win { background: var(--new); color: var(--bg); }
  .result.bad { outline: 1px solid var(--turn); color: var(--turn); }
  #games { display: grid; grid-template-columns: repeat(auto-fill, minmax(470px, 1fr)); gap: 10px; }
  .game { background: var(--tile); border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px 8px; min-width: 0; }
  .game.stale { opacity: 0.55; }
  .head { display: flex; justify-content: space-between; gap: 10px; font-weight: 600; margin-bottom: 6px; }
  .head .turn { font-variant-numeric: tabular-nums; }
  .seat { border-top: 1px solid var(--line); padding: 5px 0 4px; }
  .seat.lost { opacity: 0.4; }
  .seat.active .who { color: var(--turn); }
  .row { display: flex; align-items: baseline; gap: 8px; }
  .who { font-weight: 650; min-width: 44px; }
  .deck { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dim); }
  .build { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--base); }
  .build.new { color: var(--new); }
  .life { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 30px; text-align: right; }
  .counts { color: var(--dim); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .chips { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
  .chip { background: var(--chip); border-radius: 3px; padding: 1px 5px; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  .chip.creature { font-weight: 600; }
  .chip.tapped { color: var(--tapped); font-style: italic; }
  .chip .size { font-variant-numeric: tabular-nums; margin-left: 4px; }
  .foot { border-top: 1px solid var(--line); margin-top: 2px; padding-top: 5px; color: var(--dim); min-height: 34px; }
  .foot b { color: var(--ink); font-weight: 600; }
  .empty { color: var(--dim); padding: 30px 0; }
</style>
</head>
<body>
<header><h1 id="title">Bot games</h1><span class="score" id="score"></span><span class="dim" id="progress"></span></header>
<div id="finished"></div>
<div id="games"></div>
<script>
const STEPS = { untap: "untap", upkeep: "upkeep", draw: "draw", "precombat-main": "main 1", "begin-combat": "combat", "declare-attackers": "attack", "declare-blockers": "block", "combat-damage": "damage", "end-combat": "combat ends", "postcombat-main": "main 2", end: "end step", cleanup: "cleanup" };
const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
const clock = (ms) => { const m = Math.floor(ms / 60000); return m >= 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : m + " min"; };

function seatRow(seat, active) {
  const box = el("div", "seat" + (seat.lost ? " lost" : "") + (active ? " active" : ""));
  const row = el("div", "row");
  row.append(el("span", "who", seat.seat), el("span", "build" + (seat.build === "new" ? " new" : ""), seat.build ?? ""), el("span", "deck", seat.deck ?? ""));
  row.append(el("span", "counts", "hand " + seat.hand + " · library " + seat.library + " · yard " + seat.graveyard + " · lands " + seat.lands + (seat.landsTapped > 0 ? " (" + seat.landsTapped + " tapped)" : "")));
  row.append(el("span", "life", seat.lost ? "out" : String(seat.life)));
  box.append(row);
  if (seat.permanents.length > 0) {
    const chips = el("div", "chips");
    for (const p of seat.permanents) {
      const chip = el("span", "chip " + p.kind + (p.tapped ? " tapped" : ""), (p.n > 1 ? p.n + "× " : "") + p.name);
      if (p.size) chip.append(el("span", "size", p.size));
      chips.append(chip);
    }
    box.append(chips);
  }
  return box;
}

function gameTile(game, now) {
  const tile = el("div", "game" + (now - game.at > 20000 ? " stale" : ""));
  const head = el("div", "head");
  head.append(el("span", "", "seed " + game.seed), el("span", "turn", "turn " + game.turn + " · " + game.active + " · " + (STEPS[game.step] ?? game.step)));
  tile.append(head);
  for (const seat of game.seats) tile.append(seatRow(seat, seat.seat === game.active));
  const foot = el("div", "foot");
  if (game.stack.length > 0) {
    const stack = el("div");
    stack.append(el("b", "", "Stack: "), document.createTextNode(game.stack.map((s) => s.name + " (" + s.by + ")").join(", ")));
    foot.append(stack);
  }
  if (game.plays.length > 0) foot.append(el("div", "", game.plays.map((p) => p.seat + " " + p.text).join(" · ")));
  tile.append(foot);
  return tile;
}

async function refresh() {
  let data;
  try { data = await (await fetch("/state", { cache: "no-store" })).json(); } catch { document.getElementById("progress").textContent = "the run has ended, or its page is gone"; return; }
  document.title = data.done + "/" + data.total + " · " + data.title;
  document.getElementById("title").textContent = data.title;
  document.getElementById("score").textContent = data.score;
  document.getElementById("progress").textContent = data.done + " of " + data.total + " games finished · " + data.games.length + " playing · " + clock(data.elapsed);
  const finished = document.getElementById("finished");
  finished.replaceChildren(...data.finished.map((row) => {
    const bad = row.outcome !== "win" && row.outcome !== "loss" && row.outcome !== "draw";
    const chip = el("span", "result" + (row.outcome === "win" ? " win" : "") + (bad ? " bad" : ""), row.seed + " " + row.outcome + (row.turns ? " t" + row.turns : ""));
    chip.title = (row.error ?? "") + (row.seats ? " " + row.seats.map((s) => s.seat + " " + (s.lost ? "out" : s.life)).join(", ") : "");
    return chip;
  }));
  const games = document.getElementById("games");
  games.replaceChildren(...(data.games.length > 0 ? data.games.map((game) => gameTile(game, data.now)) : [el("div", "empty", data.done >= data.total ? "Every game has finished." : "Waiting for the first games to start…")]));
}
refresh();
setInterval(refresh, 1000);
</script>
</body>
</html>
`;
