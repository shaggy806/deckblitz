#!/usr/bin/env node
// Replays kept games (`games/`, `npm run games:pull`) on this build and checks
// the rules a game must keep at every point a player is asked anything: what
// state-based actions promise (rule 704), priority (117, 502.4), combat
// legality (302.6, 702.9b, 702.110b), land plays (305.2), sorcery timing
// (307.1), life arithmetic and nothing done to a player who has left (800.4a).
// The rules audit's seventh slice (`docs/plans/rules-audit-2026-11.md`).
//
//   node scripts/game-rules-scan.mjs games/2026-11-26/*.json.gz
//
// A record plays exactly only on its own build; on another it goes its own
// way partway, and what this build then did is checked as far as it goes.
// Everything printed is a lead, not a verdict: follow each into its game.
// Needs `engine/dist` and `server/dist` built.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("usage: node scripts/game-rules-scan.mjs <record.json.gz>...");
  process.exit(1);
}
const imp = (p) => import(pathToFileURL(join(repo, p)).href);
const { createDefaultRegistry } = await imp("engine/dist/index.js");
const { computeCharacteristics } = await imp("engine/dist/characteristics.js");
const { replayRecord } = await imp("server/dist/game-record.js");
const { attacksAsThoughHaste } = await imp("engine/dist/combat/eligibility.js");
const registry = createDefaultRegistry();

const findings = new Map(); // kind -> [{file, turn, detail}]
const note = (kind, file, turn, detail) => {
  const list = findings.get(kind) ?? [];
  if (list.length < 6) list.push({ file, turn, detail });
  else list.extraCount = (list.extraCount ?? 0) + 1;
  findings.set(kind, list);
};

let games = 0, inputs = 0, diverged = 0;
for (const file of files) {
  let record;
  try {
    const raw = readFileSync(file);
    record = JSON.parse((file.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8"));
  } catch { continue; }
  if (record.version !== 1) continue;
  games += 1;
  const short = file.replace(/^.*games[\\/]/, "");
  const seen = new Set();
  const once = (kind, turn, detail) => {
    const key = `${kind}|${detail}`;
    if (seen.has(key)) return;
    seen.add(key);
    note(kind, short, turn, detail);
  };
  let result;
  let seenEvents = 0;
  const defenders = {};
  const declaredBlockers = {};
  let landsThisTurn = {};
  let lastGame = null;
  try {
    result = replayRecord(record, registry, {
      stop: (game) => {
        inputs += 1;
        const s = game.state;
        // A take-back starts a game anew from a snapshot (`replayRecord`): read
        // its log from where it is, and count this turn's land plays again.
        if (game !== lastGame) {
          if (lastGame !== null) {
            seenEvents = game.events.length;
            landsThisTurn = {};
            const start = game.events.findLastIndex((x) => x.type === "turn-began");
            for (const x of game.events.slice(start + 1)) if (x.type === "land-played") landsThisTurn[x.player] = (landsThisTurn[x.player] ?? 0) + 1;
          }
          lastGame = game;
        }
        // Declared attackers (rule 302.6): read as the declaration is made, from the log.
        for (let i = seenEvents; i < game.events.length; i++) {
          const e = game.events[i];
          if (e.type === "attacker-declared") defenders[e.attacker] = e.defender;
          if (e.type === "step-began" && e.step === "declare-blockers") for (const k of Object.keys(declaredBlockers)) delete declaredBlockers[k];
          if (e.type === "blocker-declared") declaredBlockers[e.attacker] = (declaredBlockers[e.attacker] ?? 0) + 1;
          if (e.type === "turn-began") landsThisTurn = {};
          if (e.type === "land-played") {
            landsThisTurn[e.player] = (landsThisTurn[e.player] ?? 0) + 1;
            const allowed = game.maxLandsFor(e.player);
            if (landsThisTurn[e.player] > allowed) once("more land plays than allowed (305.2)", s.turn.number, `${e.player} ${landsThisTurn[e.player]} of ${allowed}`);
          }
          if (e.type === "spell-cast" && e.via === undefined) {
            const o = s.objects[e.object];
            if (o !== undefined && o.zone === "stack") {
              const ch = computeCharacteristics(s, registry, e.object);
              const sorcerySpeed = ch.types.includes("sorcery") || (!ch.types.includes("instant") && !ch.keywords.has("flash"));
              const stack = s.zones.shared.stack;
              const main = s.turn.step === "precombat-main" || s.turn.step === "postcombat-main";
              const active = s.turnOrder[s.turn.activePlayerIndex];
              const flashGrant = s.zones.shared.battlefield.some((id) => {
                const src = s.objects[id];
                if (src === undefined || (src.controller !== e.player && !registry.get(src.cardName).static.some((st) => st.castAsThoughFlashAnyPlayer))) return false;
                return registry.get(src.cardName).static.some((st) => st.castAsThoughFlash !== undefined);
              });
              if (sorcerySpeed && !flashGrant && (!main || active !== e.player || stack.indexOf(e.object) > 0))
                once("sorcery-speed spell cast at instant speed (307.1, 301-302)", s.turn.number, `${o.cardName} by ${e.player} in ${s.turn.step}, active ${active}, stack ${stack.length} from ${e.from}`);
            }
          }
          if (e.type !== "attackers-declared") continue;
          for (const id of e.attackers) {
            const o = s.objects[id];
            if (o === undefined || o.zone !== "battlefield") continue;
            const ch = computeCharacteristics(s, registry, id);
            if (o.summoningSick && !o.hastyUntilItLeaves && !ch.keywords.has("haste") && !attacksAsThoughHaste(s, registry, o, defenders[id] ?? o.attacking)) once("declared attacker summoning sick (302.6)", s.turn.number, `${o.cardName} ${id}`);
          }
        }
        seenEvents = game.events.length;
        if (s.result.over) return false;
        const turn = s.turn.number;
        if (turn === 0) return false;
        // Only where a player is being asked: priority or a decision.
        const asked = s.priority.holder ?? s.awaiting?.player ?? null;
        if (asked === null) return false;
        if (s.zones.shared.stack.length === 0 && s.pendingTriggers.length > 0) return false;
        if (s.players[asked]?.hasLost) once("a player who has lost is asked", turn, `${asked} ${s.awaiting?.kind ?? "priority"}`);
        if (s.priority.holder !== null && s.awaiting === null && s.turn.step === "untap") once("priority in the untap step (502.4)", turn, s.priority.holder);
        if (s.priority.holder === null || s.awaiting !== null) return false; // SBAs are promised before priority (117.5), not mid-resolution
        for (const [p, ps] of Object.entries(s.players)) {
          if (ps.hasLost) continue;
          if (ps.life <= 0) once("a player at 0 life still in (704.5a)", turn, `${p} life ${ps.life}`);
          if ((ps.poison ?? ps.poisonCounters ?? 0) >= 10) once("10 poison still in (704.5c)", turn, p);
          for (const [c, n] of Object.entries(ps.commanderDamageTaken ?? {})) {
            if (n >= 21) once("21 commander damage still in (704.6c)", turn, `${p} from ${s.objects[c]?.cardName}`);
          }
        }
        for (const id of s.zones.shared.battlefield) {
          const o = s.objects[id];
          if (o === undefined) { once("battlefield lists a missing object", turn, id); continue; }
          if (s.players[o.owner]?.hasLost || s.players[o.controller]?.hasLost) continue;
          let ch;
          try { ch = computeCharacteristics(s, registry, id); } catch (e) { once("characteristics threw", turn, `${o.cardName}: ${String(e).slice(0, 80)}`); continue; }
          if (ch.types.includes("creature")) {
            if (ch.toughness <= 0) once("creature at 0 toughness (704.5f)", turn, `${o.cardName} ${ch.power}/${ch.toughness}`);
            else if ((o.damageMarked ?? 0) >= ch.toughness && !ch.keywords.has("indestructible"))
              once("lethal damage left marked (704.5g)", turn, `${o.cardName} ${o.damageMarked} on ${ch.toughness}`);
          }
          if (ch.types.includes("planeswalker") && (o.counters?.loyalty ?? 0) <= 0)
            once("planeswalker at 0 loyalty (704.5i)", turn, o.cardName);
          if (o.attachedTo !== null && o.attachedTo !== undefined) {
            const host = s.objects[o.attachedTo];
            if (host === undefined || (host.zone !== "battlefield" && host.zone !== "phased-out" && typeof o.attachedTo === "string" && !o.attachedTo.startsWith("player")))
              if (host === undefined && !Object.keys(s.players).includes(o.attachedTo)) once("attached to nothing (704.5m-n)", turn, o.cardName);
              else if (host !== undefined) once("attached to something off the battlefield (704.5m-n)", turn, `${o.cardName} on ${host.cardName} in ${host.zone}`);
          }
          if (ch.subtypes.includes("Aura") && ch.types.includes("enchantment") && (o.attachedTo === null || o.attachedTo === undefined) && o.attachedToPlayer === undefined && !ch.types.includes("creature"))
            once("Aura attached to nothing (704.5m)", turn, o.cardName);
          if (o.counters?.["+1/+1"] > 0 && o.counters?.["-1/-1"] > 0) once("+1/+1 and -1/-1 together (704.5q)", turn, o.cardName);
        }
        // Combat (rules 302.6, 702.3b, 702.9b, 702.110b, 509.1b): leads, read on the state as it is now.
        const combatSteps = ["declare-attackers", "declare-blockers", "combat-damage", "first-strike-damage"];
        if (combatSteps.includes(s.turn.step)) {
          for (const id of s.zones.shared.battlefield) {
            const o = s.objects[id];
            if (o === undefined || o.attacking === null || o.attacking === undefined) continue;
            if (s.players[o.controller]?.hasLost) continue;
            const ch = computeCharacteristics(s, registry, id);
            const blockers = (o.blockedBy ?? []).filter((b) => s.objects[b]?.zone === "battlefield");
            if (ch.keywords.has("menace") && (declaredBlockers[id] ?? 0) === 1) once("menace blocked by one (702.110b)", turn, o.cardName);
            if (ch.keywords.has("unblockable") && blockers.length > 0) once("unblockable blocked", turn, o.cardName);
            if (ch.keywords.has("flying")) for (const b of blockers) {
              const bc = computeCharacteristics(s, registry, b);
              if (!bc.keywords.has("flying") && !bc.keywords.has("reach")) once("flyer blocked by a non-flyer (702.9b)", turn, `${o.cardName} by ${s.objects[b].cardName}`);
            }
          }
        }
        for (const [p] of Object.entries(s.players)) {
          for (const zone of ["hand", "graveyard", "library"]) {
            for (const id of s.zones.perPlayer[p][zone]) if (s.objects[id]?.isToken) once("token off the battlefield (704.5d)", turn, `${s.objects[id].cardName} in ${zone}`);
          }
        }
        return false;
      },
    });
  } catch (e) {
    once("replay threw", null, String(e).slice(0, 160));
    continue;
  }
  if (result.refused !== null || result.matches === false) diverged += 1;
  // The log, read whole: life arithmetic, and nothing done to a player who has left (800.4a).
  const life = {}; const lost = new Set();
  for (const e of result.game.events) {
    if (e.type === "life-changed") {
      if (life[e.player] !== undefined && life[e.player] + e.delta !== e.life) once("life doesn't add up", null, `${e.player} ${life[e.player]}${e.delta >= 0 ? "+" : ""}${e.delta} -> ${e.life} at ${e.seq}`);
      life[e.player] = e.life;
      if (lost.has(e.player)) once("life changed after losing (800.4a)", null, `${e.player} at ${e.seq}`);
    }
    if (e.type === "player-lost") lost.add(e.player);
    if (e.type === "damage-dealt" && e.target?.kind === "player" && lost.has(e.target.player)) once("damage to a player who left (800.4e)", null, `${e.target.player} at ${e.seq}`);
    if ((e.type === "card-drawn" || e.type === "spell-cast" || e.type === "priority-received") && lost.has(e.player)) once(`${e.type} by a player who left`, null, `${e.player} at ${e.seq}`);
  }
}
console.log(`${games} games, ${inputs} inputs, ${diverged} not the same game on this build (scanned as far as they went)`);
for (const [kind, list] of findings) {
  console.log(`\n## ${kind}${list.extraCount ? ` (+${list.extraCount} more)` : ""}`);
  for (const f of list) console.log(`  ${f.file} t${f.turn}: ${f.detail}`);
}
