// Does a game come out the same in every browser? Step 1 of
// `docs/plans/replicated-rooms.md`: the devices of a copied room each run the
// engine in their own browser, so a game fed the same actions must reach the
// same state in V8 (Chrome, Edge, Node), SpiderMonkey (Firefox) and
// JavaScriptCore (Safari).
//
// Records whole fuzzer games here in Node, played the way a room plays them
// (`replica-check.mjs`), keeping every action and the state's digest
// (`stateDigest`) every `--every` actions; bundles the engine as a page runs
// it (`engine/local`, the pool from its shards); and replays the recording in
// each browser, comparing digests. A mismatch names the first checkpoint that
// differs.
//
//   npm run play:browsers -w engine                      # Chromium, Firefox, WebKit
//   npm run play:browsers -w engine -- --seeds 1-6       # more games (default 1-3, at 4 players and at 2)
//   npm run play:browsers -w engine -- --browsers firefox
//   npm run play:browsers -w engine -- --browsers chromium,chrome,msedge   # this machine's own Chrome and Edge too
//   npm run play:browsers -w engine -- --serve 4321      # keep serving the page, for another machine's browser
//
// `chromium`, `firefox` and `webkit` are Playwright's own builds:
// `npx playwright install firefox webkit` once (only Chromium comes with the
// e2e suite). `chrome` and `msedge` are the ones installed on the machine.
// A browser that isn't installed is reported, and fails the run. With
// `--serve`, any browser that opens the address replays the games and sends
// its result back here, where it is printed: how another machine is checked.

import { createServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { networkInterfaces, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rolldown } from "rolldown";

import { Game, RandomController, asPlayerId, createRng, stateDigest } from "../dist/index.js";
import { engineLocalPlugin } from "../dist/local-plugin.js";
import { seatsFor } from "./fuzz-decks.mjs";
import { playWithReplicas } from "./replica-check.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const [firstSeed, lastSeed] = flag("--seeds", "1-3").split("-").map(Number);
const seeds = Array.from({ length: (lastSeed ?? firstSeed) - firstSeed + 1 }, (_, k) => firstSeed + k);
const every = Number(flag("--every", "100"));
const tables = flag("--players", "4,2").split(",").map(Number);
const wanted = flag("--browsers", "chromium,firefox,webkit").split(",");
const serve = args.includes("--serve") ? Number(flag("--serve", "4321")) : null;

const SEATS = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const digests = (game) => ({ whole: stateDigest(game.state, { events: true }), brief: stateDigest(game.state) });

/** One whole game, played as a room plays it: what a browser is given. */
function record(seed, players) {
  const seats = seatsFor(seed, SEATS.slice(0, players));
  const rng = createRng(seed * 7919);
  const controllers = Object.fromEntries(seats.map(({ player }) => [player, new RandomController(player, () => rng.next())]));
  const recorded = { seed, seats, every, opening: null, actions: [], digests: [], end: null };
  const { game } = playWithReplicas({
    create: () => Game.create({ seed, mulligans: true, decks: seats }),
    controllers,
    stopAt: (state) => state.turn.number > 120,
    onDecision: (g, n) => {
      if (n === 0) recorded.opening = digests(g);
    },
    onAction: (action, g, n) => {
      recorded.actions.push(action);
      if (n % every === 0) recorded.digests.push(digests(g));
    },
  });
  recorded.opening ??= digests(game);
  recorded.end = digests(game);
  return recorded;
}

const startedAt = Date.now();
const games = [];
for (const players of tables) {
  for (const seed of seeds) {
    const game = record(seed, players);
    games.push(game);
    console.log(`recorded seed ${seed} at ${players} players: ${game.actions.length} actions, ${game.digests.length + 2} checkpoints`);
  }
}
const totalActions = games.reduce((n, g) => n + g.actions.length, 0);
console.log(`${games.length} games, ${totalActions} actions recorded in ${Math.round((Date.now() - startedAt) / 1000)} s`);

// The engine as a page runs it, the shards its own chunks.
const here = path.dirname(fileURLToPath(import.meta.url));
const dir = mkdtempSync(path.join(tmpdir(), "replica-browsers-"));
const bundle = await rolldown({
  input: path.join(here, "replica-browser-entry.mjs"),
  platform: "browser",
  plugins: [engineLocalPlugin()],
});
const { output } = await bundle.write({ dir, format: "esm", entryFileNames: "entry.js" });
await bundle.close();
const entry = output.find((o) => o.type === "chunk" && o.isEntry).fileName;
writeFileSync(path.join(dir, "games.json"), JSON.stringify(games));
writeFileSync(
  path.join(dir, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Copies of a game, in this browser</title>
<body style="font: 14px/1.5 system-ui; margin: 2rem; white-space: pre-wrap">Loading the engine and replaying ${games.length} games…</body>
<script type="module">
  import { run } from "./${entry}";
  try {
    const games = await (await fetch("./games.json")).json();
    const result = await run(games);
    const lines = result.games.map((g) =>
      \`\${g.players} players, seed \${g.seed}: \${g.actions} actions, \${g.checks} checkpoints, \` +
      (g.error !== null ? "THREW " + g.error : g.mismatch !== null ? "DIFFERS " + g.mismatch.label + " (turn " + g.mismatch.turn + ")" : "identical") +
      \` (\${g.ms} ms)\`);
    document.body.textContent = (result.ok ? "IDENTICAL to the recording\\n\\n" : "NOT identical\\n\\n") + lines.join("\\n") +
      \`\\n\\npool loaded in \${result.poolMs} ms, \${result.msPerAction} ms an action, \${result.cores} cores\\n\${result.agent}\`;
    window.result = result;
    fetch("./result", { method: "POST", body: JSON.stringify(result) }).catch(() => {});
  } catch (error) {
    document.body.textContent = "FAILED: " + (error?.stack ?? error);
    window.result = { ok: false, failed: String(error?.stack ?? error), games: [] };
  }
</script>`,
);

/** Prints how one browser's replay went; whether it was identical. */
function report(label, result) {
  if (result.failed !== undefined) {
    console.log(`${label}: the page failed: ${String(result.failed).slice(0, 300)}`);
    return false;
  }
  if (result.ok) {
    const checks = result.games.reduce((n, g) => n + g.checks, 0);
    console.log(
      `${label}: identical — ${result.games.length} games, ${totalActions} actions, ${checks} checkpoints (pool in ${result.poolMs} ms, ${result.msPerAction} ms an action)`,
    );
    return true;
  }
  console.log(`${label}: NOT identical`);
  for (const g of result.games) {
    if (g.error !== null) console.log(`  ${g.players} players, seed ${g.seed}: threw ${g.error}`);
    else if (g.mismatch !== null) {
      const m = g.mismatch;
      console.log(
        `  ${g.players} players, seed ${g.seed}: differs ${m.label}, turn ${m.turn} (${m.step}): ${JSON.stringify(m.expected)} here, ${JSON.stringify(m.got)} there`,
      );
    }
  }
  return false;
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json" };
const server = createServer((request, response) => {
  const name = path.basename(new URL(request.url, "http://x").pathname) || "index.html";
  if (request.method === "POST" && name === "result") {
    // A browser that opened the page on its own (`--serve`) saying how it went.
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      response.writeHead(204).end();
      if (serve === null) return;
      try {
        const result = JSON.parse(body);
        report(`${request.socket.remoteAddress} — ${result.agent} (${result.cores} cores)`, result);
      } catch {
        console.log(`${request.socket.remoteAddress}: sent something that isn't a result`);
      }
    });
    return;
  }
  try {
    const body = readFileSync(path.join(dir, name));
    response.writeHead(200, { "content-type": TYPES[path.extname(name)] ?? "application/octet-stream", "cache-control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404).end("not found");
  }
});
await new Promise((resolve) => server.listen(serve ?? 0, serve === null ? "127.0.0.1" : "0.0.0.0", resolve));
const port = server.address().port;

let failed = false;

const { chromium, firefox, webkit } = await import("playwright");
/** Playwright's own builds, and the Chrome and Edge installed on the machine. */
const launchers = {
  chromium: () => chromium.launch(),
  firefox: () => firefox.launch(),
  webkit: () => webkit.launch(),
  chrome: () => chromium.launch({ channel: "chrome" }),
  msedge: () => chromium.launch({ channel: "msedge" }),
};
for (const name of wanted) {
  const launch = launchers[name];
  if (launch === undefined) {
    console.log(`${name}: not a browser this knows (${Object.keys(launchers).join(", ")})`);
    failed = true;
    continue;
  }
  let browser;
  try {
    browser = await launch();
  } catch (error) {
    const message = String(error?.message ?? error).split("\n")[0];
    const how = name === "chrome" || name === "msedge" ? "not installed on this machine" : `npx playwright install ${name}`;
    console.log(`${name}: couldn't start (${message.slice(0, 120)}) — ${how}`);
    failed = true;
    continue;
  }
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForFunction(() => window.result !== undefined, null, { timeout: 15 * 60_000 });
    const result = await page.evaluate(() => window.result);
    if (!report(`${name} ${browser.version()}`, result)) failed = true;
  } catch (error) {
    console.log(`${name}: ${String(error?.message ?? error).split("\n")[0]}`);
    failed = true;
  } finally {
    await browser.close();
  }
}

if (serve !== null) {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((a) => a !== undefined && a.family === "IPv4" && !a.internal)
    .map((a) => `http://${a.address}:${port}/`);
  console.log(`serving the same page for another machine's browser: ${addresses.join("  ") || `http://127.0.0.1:${port}/`}  (Ctrl+C to stop)`);
} else {
  server.close();
  rmSync(dir, { recursive: true, force: true });
  if (failed) process.exitCode = 1;
}
