#!/usr/bin/env node
// The card-definition vocabulary on one page — every effect, trigger, target,
// amount, condition, cost and static field a card file can say, each with its
// fields, the first sentence of its doc, how many cards use it and the
// smallest one to copy. Generated from the engine sources and the pool index,
// so it can't go out of date.
//
// It's what an authoring agent would otherwise grep `effects.ts`,
// `abilities.ts` and `define.ts` for, one option at a time, while triaging
// its cards (B110: 7–9 of an agent's first 10 minutes). `card:vocab` answers
// one term in depth; this is the whole map, read or grepped once.
//
// Usage: node scripts/card-digest.mjs [--out <file>]
//   default out: engine/.cache/authoring-digest.md

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ENGINE, loadPoolVocab } from "./pool-index.mjs";

/** The sections, in reading order: [title, source file, declared name, what
 * it is]. A union lists its members; an interface its fields. */
const SECTIONS = [
  ["Card fields", "src/cards/define.ts", "CardDraft", "the top level of `defineCard({...})`"],
  ["Effects", "src/effects.ts", "EffectSpec", "`effect:` on a spell, ability or mode — `kind`"],
  ["Amounts", "src/effects.ts", "EffectAmount", "a number an effect reads: `amount`, `count`, `power`…"],
  ["Player scopes", "src/effects.ts", "PlayerScope", "`who`/`target` naming players"],
  ["Durations", "src/effects.ts", "PtDuration", "how long a P/T change or grant lasts"],
  ["Targets", "src/target.ts", "TargetSpec", "an entry of `targets: [...]`"],
  ["Filters", "src/filter.ts", "CardFilter", "`filter:` everywhere — all fields must hold"],
  ["Activated abilities", "src/abilities.ts", "ActivatedAbility", "an entry of `activated: [...]`"],
  ["Ability costs", "src/abilities.ts", "AbilityCost", "an activated ability's `cost`"],
  ["Cost reductions", "src/abilities.ts", "CostReductionAmount", "`reduceGeneric` and friends"],
  ["Triggered abilities", "src/abilities.ts", "TriggeredAbility", "an entry of `triggered: [...]`"],
  ["Triggers", "src/abilities.ts", "TriggerSpec", "a triggered ability's `trigger` — `on`"],
  ["Trigger who", "src/abilities.ts", "TriggerWho", "a trigger's `who`"],
  ["Static abilities", "src/cards/define.ts", "StaticAbility", "an entry of `static: [...]`"],
  ["Conditions", "src/cards/define.ts", "StaticCondition", "`condition:` on statics, triggers (intervening if), effects — `kind`"],
];

const DOC_MAX = 150;

// ------------------------------------------------------------------ scanning

const sources = new Map();
const source = (rel) => {
  if (!sources.has(rel)) sources.set(rel, readFileSync(path.join(ENGINE, rel), "utf8").replace(/\r\n/g, "\n"));
  return sources.get(rel);
};

/** The text of `name`'s declaration body: a type alias's right-hand side, or
 * an interface's braces' inside. */
function bodyOf(rel, name) {
  const text = source(rel);
  const m = new RegExp(`^(?:export )?(type|interface) ${name}\\b[^=\\{]*([=\\{])`, "m").exec(text);
  if (m === null) throw new Error(`${name} not found in ${rel}`);
  let i = m.index + m[0].length;
  const start = i;
  let depth = m[2] === "{" ? 1 : 0;
  for (; i < text.length; i++) {
    const c = text[i];
    const skip = skipNonCode(text, i);
    if (skip !== i) { i = skip - 1; continue; }
    if ("{[(".includes(c)) depth++;
    else if ("}])".includes(c)) {
      depth--;
      if (depth === 0 && m[2] === "{") return { kind: "interface", text: text.slice(start, i) };
    } else if (c === ";" && depth === 0 && m[2] === "=") return { kind: "type", text: text.slice(start, i) };
  }
  throw new Error(`unterminated ${name}`);
}

/** Past a string or comment starting at `i`, or `i` if neither. */
function skipNonCode(text, i) {
  const c = text[i];
  if (c === "/" && text[i + 1] === "/") return text.indexOf("\n", i) + 1 || text.length;
  if (c === "/" && text[i + 1] === "*") {
    const end = text.indexOf("*/", i + 2);
    return end < 0 ? text.length : end + 2;
  }
  if (c === '"' || c === "'" || c === "`") {
    let j = i + 1;
    while (j < text.length && text[j] !== c) j += text[j] === "\\" ? 2 : 1;
    return j + 1;
  }
  return i;
}

/** Splits `text` at depth-0 occurrences of `sep` (";" / "|"), keeping each
 * piece's leading doc comment. */
function splitTop(text, sep) {
  const parts = [];
  let depth = 0, from = 0;
  for (let i = 0; i < text.length; i++) {
    const skip = skipNonCode(text, i);
    if (skip !== i) { i = skip - 1; continue; }
    const c = text[i];
    if ("{[(".includes(c)) depth++;
    else if ("}])".includes(c)) depth--;
    else if (depth === 0 && c === sep) {
      parts.push(text.slice(from, i));
      from = i + 1;
    }
  }
  parts.push(text.slice(from));
  return parts.filter((p) => p.trim() !== "");
}

/** The first sentences of the last doc comment in `text` (before any code). */
function docOf(text) {
  const docs = [...text.matchAll(/\/\*\*([\s\S]*?)\*\//g)];
  if (docs.length === 0) return "";
  const raw = docs[docs.length - 1][1]
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  // A sentence ends at a stop before a capital — not "e.g." or "i.e.".
  const first = raw.split(/(?<=[.!?])(?<!\be\.g\.)(?<!\bi\.e\.)\s+(?=[A-Z"`'(*])/)[0] ?? raw;
  return first.length > DOC_MAX ? `${first.slice(0, DOC_MAX - 1)}…` : first;
}

/** Code with comments and strings' insides blanked, and everything nested
 * deeper than one level of braces dropped — what's left is the object's own
 * fields. */
function topLevelFields(objectText) {
  const fields = [];
  const inner = objectText.slice(objectText.indexOf("{") + 1, objectText.lastIndexOf("}"));
  for (const piece of splitTop(inner, ";")) {
    const code = piece.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const m = /^\s*(?:readonly\s+)?([a-zA-Z]\w*)(\?)?\s*:\s*([\s\S]*)$/.exec(code);
    if (m === null) continue;
    fields.push({ name: m[1], optional: m[2] === "?", type: m[3].replace(/\s+/g, " ").trim(), doc: docOf(piece) });
  }
  return fields;
}

// ------------------------------------------------------------------ members

/** A union's members: each one's label (`kind=…`, `on=…`, a literal, or its
 * first field for an untagged object), fields and doc. */
function unionMembers(rel, name) {
  const body = bodyOf(rel, name);
  if (body.kind === "interface") return null;
  const out = [];
  // A member's doc comment sits above its `|`, so splitting there leaves it
  // at the end of the member before (or, for the first, before any member).
  let carried = "";
  for (const piece of splitTop(body.text, "|")) {
    const trail = /\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*$/.exec(piece);
    const own = trail ? piece.slice(0, trail.index) : piece;
    const nextDoc = trail ? docOf(trail[0]) : "";
    const lead = /^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/.exec(own)[0];
    const code = own.slice(lead.length).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").trim();
    if (code === "") {
      carried = nextDoc || docOf(own);
      continue;
    }
    const outerDoc = docOf(lead) || carried;
    carried = nextDoc;
    if (code.startsWith("{")) {
      const fields = topLevelFields(own.slice(lead.length));
      const tag = fields.find((f) => (f.name === "kind" || f.name === "on") && /^"[^"]+"$/.test(f.type));
      const label = tag ? `${tag.name}=${tag.type.slice(1, -1)}` : `{ ${fields.filter((f) => !f.optional).map((f) => f.name).join(", ") || fields[0]?.name || "?"} }`;
      out.push({ label, tag: tag?.name, fields: fields.filter((f) => f !== tag), doc: tag?.doc || outerDoc || fields[0]?.doc || "" });
    } else {
      out.push({ label: code.replace(/\s+/g, " "), fields: [], doc: outerDoc });
    }
  }
  return out;
}

function interfaceFields(rel, name) {
  const body = bodyOf(rel, name);
  return body.kind === "interface" ? topLevelFields(`{${body.text}}`) : null;
}

// ------------------------------------------------------------------ usage

/** Cards per term and the smallest card using it (`vocabTerms`, from the pool index). */
async function usage() {
  const terms = new Map();
  for (const { name, file, size, terms: mine } of await loadPoolVocab()) {
    for (const term of mine) {
      const t = terms.get(term);
      if (t === undefined) terms.set(term, { count: 1, best: { size, name, file } });
      else {
        t.count += 1;
        if (size < t.best.size) t.best = { size, name, file };
      }
    }
  }
  return terms;
}

// ------------------------------------------------------------------ render

const fieldList = (fields) =>
  fields.map((f) => `${f.name}${f.optional ? "?" : ""}`).join(", ");

function render(used) {
  const lines = [
    "# Card-definition vocabulary — the digest",
    "",
    `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run card:digest -w engine\` from the engine sources and the pool. Every effect, amount, target, trigger, condition, cost and static field a card file can say, in one place. Each entry: the name, how many pool cards use it and the smallest one (copy it), its fields (\`?\` optional), and the first sentence of its doc. Field docs and the full shapes are in the source file named in each heading; \`npm run card:vocab -w engine -- <term>\` searches one term in depth, \`card:find\` finds an ability by its wording.`,
    "",
    "Not here: what the engine *can't* do — `engine/src/cards/AUTHORING.md` §15. Anything not in this digest or §15 needs a search before you decide it's missing — and when it is missing, the card is blocked.",
    "",
  ];
  const unused = [];
  for (const [title, rel, name, what] of SECTIONS) {
    const members = unionMembers(rel, name);
    lines.push(`## ${title} — \`${name}\` (${rel}): ${what}`, "");
    if (members !== null) {
      for (const m of members) {
        const u = used.get(m.label);
        const n = m.tag ? (u ? ` (${u.count}; e.g. ${u.best.name})` : " (no card uses it yet)") : "";
        if (m.tag && !u) unused.push(`${m.label} (${name})`);
        const fields = m.fields.length ? ` — ${fieldList(m.fields)}` : "";
        lines.push(`- \`${m.label}\`${n}${fields}${m.doc ? ` — ${m.doc}` : ""}`);
      }
    } else {
      // `CardDraft` (what `defineCard` takes) leaves its fields' docs to
      // `CardDefinition` (what it returns).
      const docs = new Map(
        name === "CardDraft" ? interfaceFields(rel, "CardDefinition").map((f) => [f.name, f.doc]) : [],
      );
      for (const f of interfaceFields(rel, name)) {
        if (!f.doc || /^See \{@link/.test(f.doc)) f.doc = docs.get(f.name) || f.doc;
        lines.push(`- \`${f.name}${f.optional ? "?" : ""}\`${f.doc ? ` — ${f.doc}` : ""}`);
      }
    }
    lines.push("");
  }
  if (unused.length) {
    lines.push("## Declared, but no pool card uses it yet", "", "Built and tested — some the engine writes itself (madness, dungeons) — just easy to miss:", "", unused.map((u) => `\`${u}\``).join(", "), "");
  }
  return lines.join("\n");
}

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = outAt >= 0 ? path.resolve(args[outAt + 1]) : path.join(ENGINE, ".cache", "authoring-digest.md");
const text = render(await usage());
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, text);
console.log(`wrote ${path.relative(process.cwd(), out)} (${Math.round(text.length / 1024)} KB, ${text.split("\n").length} lines)`);
