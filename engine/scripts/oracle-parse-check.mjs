#!/usr/bin/env node
// Measures the Oracle parser (`oracle-parse.mjs`) against ground truth: every
// hand-authored card in the pool. For each pool card it parses the card's
// Oracle text from the snapshot, and wherever the parser claims an ability is
// complete it compares that ability with the authored one — cost, trigger,
// targets, restrictions and effect. A disagreement is a parser bug (or, now
// and then, an authoring choice worth a look); the report lists them.
//
// Usage: npm run card:parse-check -w engine [-- --all]   (--all lists every mismatch)

import { pathToFileURL } from "node:url";

import { parseFace } from "./oracle-parse.mjs";
import { findCard } from "./oracle-snapshot.mjs";

const showAll = process.argv.includes("--all");

/** Comparable form: no text, no resolve hatch, no undefined keys, and a
 * token name wildcarded (the parser can only guess which token file). */
function canon(v) {
  if (Array.isArray(v)) return v.map(canon);
  if (v === null || typeof v !== "object") return v;
  // Equivalent spellings of one thing, all written one way:
  // a scry, surveil or proliferate `then` is the step after it — a sequence's
  // steps wait for its decision the same way;
  if (["scry", "surveil", "proliferate"].includes(v.kind) && v.then !== undefined) {
    const { then, ...first } = v;
    v = { kind: "sequence", effects: [first, then] };
  }
  // a plain sequence inside a plain sequence is one sequence;
  if (v.kind === "sequence" && v.simultaneous !== true && v.effects.some((e) => e?.kind === "sequence" && e.simultaneous !== true)) {
    v = { ...v, effects: v.effects.flatMap((e) => (e?.kind === "sequence" && e.simultaneous !== true ? e.effects : [e])) };
  }
  // an instant-or-sorcery spell target is its literal;
  if (v.kind === "spell" && v.filter?.typesAnyOf?.length === 2 && v.filter.typesAnyOf.includes("instant") && v.filter.typesAnyOf.includes("sorcery") && Object.keys(v.filter).length === 1) {
    return "instant-or-sorcery-spell";
  }
  // "target attacking or blocking creature" written out is its literal;
  if (v.kind === "permanent" && v.whose === undefined && JSON.stringify(v.filter) === JSON.stringify({ type: "creature", anyOf: [{ attacking: true }, { blocking: true }] })) {
    return "attacking-or-blocking-creature";
  }
  // a static over "creatures you control" is that scope;
  if (v.scope === "filter" && v.filter?.type === "creature" && v.filter.controlledBy === "you") {
    const { type: _c, controlledBy: _y, ...more } = v.filter;
    const { filter: _f, ...rest } = v;
    v = { ...rest, scope: "creatures-you-control", ...more };
  }
  // a basic land type is a land already;
  if (v.type === "land" && ["Plains", "Island", "Swamp", "Mountain", "Forest"].includes(v.subtype)) {
    const { type: _land, ...rest } = v;
    v = rest;
  }
  // a permanent target filtered to a single type is that type's literal.
  // A target's `whose: "any"` is its default; a permanent's controller can be
  // `whose` or the filter's `controlledBy`.
  if ((v.kind === "permanent" || v.kind === "card-in-graveyard") && v.whose === "any") {
    const { whose: _any, ...rest } = v;
    v = rest;
  }
  if (v.kind === "permanent" && v.whose === undefined && (v.filter?.controlledBy === "you" || v.filter?.controlledBy === "opponent")) {
    const { controlledBy, ...filter } = v.filter;
    v = { ...v, whose: controlledBy, filter };
  }
  if (v.kind === "permanent" && (v.whose === undefined || v.whose === "any") && v.filter !== undefined) {
    const keys = Object.keys(v.filter);
    if (keys.length === 1 && keys[0] === "type" && ["creature", "artifact", "enchantment", "land", "permanent"].includes(v.filter.type)) {
      return v.filter.type;
    }
  }
  const out = {};
  for (const [k, val] of Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) {
    if (val === undefined || k === "text" || k === "resolve" || k.startsWith("__")) continue;
    if (k === "targets" && Array.isArray(val) && val.length === 0 && v.effect !== undefined && v.trigger === undefined && v.cost === undefined) continue;
    if (k === "token" && v.kind === "create-token") continue;
    if (k === "prompt" && v.kind === "may") continue;
    // `who: "you"` is the default for life, draws and the like.
    if (k === "who" && val === "you" && ["gain-life", "lose-life", "draw"].includes(v.kind)) continue;
    // A `{0}` mana cost is no mana cost (Equip {0}).
    if (k === "mana" && (val === "{0}" || val === null)) continue;
    // "Sacrifice a creature" either way.
    if (k === "sacrifice" && val === "creature-you-control") {
      out[k] = { filter: { type: "creature" } };
      continue;
    }
    // A sacrifice is always your own: `controlledBy: "you"` adds nothing.
    if (k === "sacrifice" && val?.controlledBy === "you") {
      const { controlledBy: _you, ...rest } = val;
      out[k] = canon(rest);
      continue;
    }
    out[k] = canon(val);
  }
  return out;
}
/** The card-level fields the parser may set. */
const CARD_FIELDS = ["convoke", "morph", "disturb", "suspend", "selfCostReduction", "cycling", "flashback", "mayhem", "additionalCost", "cantBeCountered"];

/** A trigger written two equivalent ways: `who: "you"` plus a
 * `controlledBy: "you"` filter is `who: "you-control"`. */
function canonTrigger(t) {
  if (t === null || typeof t !== "object" || t.on === undefined) return t;
  // A spell never triggers its own battlefield ability as it's cast (checked:
  // casting Gev, a Lizard, doesn't fire his "whenever you cast a Lizard
  // spell"), so a cast trigger's `otherOnly` changes nothing.
  if (t.on === "cast-spell" && t.otherOnly === true) {
    const { otherOnly: _o, ...rest } = t;
    t = rest;
  }
  if ((t.who !== "you" && t.who !== "any") || t.filter?.controlledBy !== "you") return t;
  const { controlledBy: _drop, ...filter } = t.filter;
  return { ...t, who: "you-control", filter };
}
const same = (a, b) => JSON.stringify(canon(canonTrigger(a))) === JSON.stringify(canon(canonTrigger(b)));

/** "Add {B} or {R}" parsed as one ability with a choice, authored
 * (equivalently) as one ability per colour. */
function manaSplit(parsed, authored) {
  if (
    parsed?.kind !== "add-mana" || typeof parsed.mana !== "object" || authored?.kind !== "add-mana" ||
    typeof authored.mana !== "string" || parsed.mana.oneOf?.includes(authored.mana) !== true
  ) {
    return false;
  }
  // Everything but the colour the same (a pain land's damage too).
  const { mana: _p, ...p } = parsed;
  const { mana: _a, ...a } = authored;
  return JSON.stringify(canon(p)) === JSON.stringify(canon(a));
}
const tidy = (s) =>
  s
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[^a-z0-9{}+/-]+/g, " ")
    .trim();

/**
 * Every ability the parser claims complete, compared with the authored one.
 * `poolCards` is the pool's definitions (`POOL_CARDS`); `tokenNames` any token
 * name, since which token file a "create" means is wildcarded.
 */
export function checkPool(poolCards, tokenName = "Treasure Token") {
  const tokenFor = () => tokenName;
  const stats = { cards: 0, abilities: 0, claimed: 0, agreed: 0, keywordCards: 0, keywordAgreed: 0, fieldsClaimed: 0, fieldsAgreed: 0, spellsClaimed: 0, spellsAgreed: 0, staticsClaimed: 0, staticsAgreed: 0 };
  const mismatches = [];

  for (const def of poolCards) {
    const entry = findCard(def.name);
    if (entry === undefined) continue;
    const face = (entry.faces ?? [entry]).find((f) => f.name === def.name);
    if (face === undefined) continue;
    stats.cards += 1;
    const parsed = parseFace(face, { tokenFor });

    stats.keywordCards += 1;
    if ([...parsed.keywords].sort().join() === [...def.keywords].filter((k) => k !== "unblockable").sort().join()) {
      stats.keywordAgreed += 1;
    }

    // Card-level fields a keyword line sets (convoke, morph, cycling, …):
    // wherever the parser sets one, it must be the authored one.
    for (const field of CARD_FIELDS) {
      if (parsed[field] === undefined) continue;
      stats.fieldsClaimed += 1;
      if (JSON.stringify(canon(parsed[field])) === JSON.stringify(canon(def[field] ?? null))) stats.fieldsAgreed += 1;
      else mismatches.push({ card: def.name, kind: "card", text: field, differ: [field], parsed: { [field]: canon(parsed[field]) }, authored: { [field]: canon(def[field] ?? null) } });
    }

    // A spell's own effect (an instant's or sorcery's text), and a modal
    // spell's modes, wherever the parser read the whole of it.
    if (parsed.complete && parsed.effect !== undefined && parsed.effect !== null) {
      stats.spellsClaimed += 1;
      const p = { targets: parsed.targets ?? [], effect: parsed.effect };
      const a = { targets: def.targets ?? [], effect: def.effect ?? null };
      let differ = ["targets", "effect"].filter((f) => !same(p[f], a[f]));
      if (differ.length === 1 && differ[0] === "effect" && manaSplit(p.effect, a.effect)) differ = [];
      if (differ.length === 0) stats.spellsAgreed += 1;
      else mismatches.push({ card: def.name, kind: "spell", text: "(its effect)", differ, parsed: canon(p), authored: canon(a) });
    }
    if (parsed.complete && parsed.castModal !== undefined) {
      stats.spellsClaimed += 1;
      if (same(parsed.castModal, def.castModal ?? null)) stats.spellsAgreed += 1;
      else mismatches.push({ card: def.name, kind: "spell", text: "(its modes)", differ: ["castModal"], parsed: { castModal: canon(parsed.castModal) }, authored: { castModal: canon(def.castModal ?? null) } });
    }

    // Static abilities, paired by their printed text.
    for (const st of parsed.static) {
      const match = def.static.find((a) => tidy(a.text) === tidy(st.text));
      if (match === undefined) continue;
      stats.staticsClaimed += 1;
      if (same(st, match)) stats.staticsAgreed += 1;
      else mismatches.push({ card: def.name, kind: "static", text: st.text, differ: ["static"], parsed: { static: canon(st) }, authored: { static: canon(match) } });
    }

    for (const kind of ["activated", "triggered"]) {
      const authored = def[kind];
      // Each authored ability pairs with one parsed ability at most: "enters or
      // attacks" is two abilities with the same text.
      const used = new Set();
      for (const p of parsed[kind]) {
        stats.abilities += 1;
        if (p.effect === null || p.__todo !== undefined) continue;
        stats.claimed += 1;
        // The authored ability this one is: the same printed text and the same
        // trigger event, else the one at the same position.
        const index = parsed[kind].indexOf(p);
        const match =
          authored.find(
            (a) => !used.has(a) && tidy(a.text) === tidy(p.text) && (kind === "activated" || a.trigger?.on === p.trigger?.on),
          ) ??
          authored.find((a) => !used.has(a) && tidy(a.text) === tidy(p.text)) ??
          authored.find((a) => !used.has(a) && manaSplit(p.effect, a.effect)) ??
          authored[index];
        if (match !== undefined) used.add(match);
        if (match === undefined) {
          mismatches.push({ card: def.name, kind, text: p.text, why: "no authored ability to compare" });
          continue;
        }
        if (match.resolve !== null) {
          stats.claimed -= 1;
          continue;
        }
        const fields = kind === "activated"
          ? ["cost", "targets", "effect", "sorcerySpeed", "oncePerTurn", "loyaltyCost", "zone", "otherOnly", "condition"]
          : ["trigger", "targets", "effect", "oncePerTurn"];
        let differ = fields.filter((f) => !same(p[f] ?? null, match[f] ?? null) && !(f === "sorcerySpeed" && !p[f] && !match[f]));
        if (differ.length === 1 && differ[0] === "effect" && manaSplit(p.effect, match.effect)) differ = [];
        if (differ.length === 0) stats.agreed += 1;
        else mismatches.push({ card: def.name, kind, text: p.text, differ, parsed: canon(p), authored: canon(match) });
      }
    }
  }

  return { stats, mismatches };
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { POOL_CARDS } = await import("../dist/cards/generated.js");
  const { stats, mismatches } = checkPool(POOL_CARDS);
  const pct = (a, b) => `${a}/${b} (${b ? ((100 * a) / b).toFixed(1) : 0}%)`;
  console.log(`${stats.cards} pool cards with a snapshot entry`);
  console.log(`keywords agree on ${pct(stats.keywordAgreed, stats.keywordCards)} of cards`);
  console.log(`abilities found: ${stats.abilities}; parser claims ${stats.claimed} complete; ${pct(stats.agreed, stats.claimed)} agree with the authored ability`);
  console.log(`card fields set: ${stats.fieldsClaimed}; ${pct(stats.fieldsAgreed, stats.fieldsClaimed)} agree with the authored card`);
  console.log(`spells read whole: ${stats.spellsClaimed}; ${pct(stats.spellsAgreed, stats.spellsClaimed)} agree with the authored spell`);
  console.log(`statics read: ${stats.staticsClaimed}; ${pct(stats.staticsAgreed, stats.staticsClaimed)} agree with the authored static`);
  console.log(`\n${mismatches.length} disagreement(s)${showAll ? "" : " — the first 30 (--all for every one)"}:`);
  for (const m of showAll ? mismatches : mismatches.slice(0, 30)) {
    console.log(`\n• ${m.card} — ${m.kind}: ${m.text}`);
    if (m.why) console.log(`    ${m.why}`);
    else {
      for (const f of m.differ) {
        console.log(`    ${f}: parsed   ${JSON.stringify(m.parsed[f] ?? null)}`);
        console.log(`    ${" ".repeat(f.length)}  authored ${JSON.stringify(m.authored[f] ?? null)}`);
      }
    }
  }

}