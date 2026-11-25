#!/usr/bin/env node
// Stages the briefs for agents working down docs/manual-checks.md
// (.claude/manual-checks/agent-guide.md): for each agent one file holding its
// tests, each as the doc words it and with its board as
// client/src/builder/manualChecks.ts builds it, so an agent opens neither
// file.
//
//   node scripts/manual-check-brief.mjs --every 52 [--offset 7] [--agents 2] [--out .scratch/manual-checks]
//   node scripts/manual-check-brief.mjs --titles titles.txt [--agents 2] [--out …]
//   node scripts/manual-check-brief.mjs --count
//
// --every N   every Nth test of the doc, from --offset (a spread sample)
// --titles    a file of test titles, one a line (their `###` headings)
// --agents    how many briefs the tests are dealt into, in turn (brief-A.md, …)
// --count     prints how many tests each section holds, and stops

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
let every
let offset = 0
let titlesPath
let agents = 2
let out = join(root, '.scratch', 'manual-checks')
let count = false
for (let i = 0; i < args.length; i += 1) {
  const a = args[i]
  if (a === '--every') every = Number(args[++i])
  else if (a === '--offset') offset = Number(args[++i])
  else if (a === '--titles') titlesPath = args[++i]
  else if (a === '--agents') agents = Math.max(1, Number(args[++i]) || 1)
  else if (a === '--out') out = resolve(args[++i])
  else if (a === '--count') count = true
  else {
    console.error(`unknown argument ${a}`)
    process.exit(2)
  }
}

// The doc: each `###` test with its lines, under its `##` section.
const tests = []
let section = ''
let current = null
for (const line of readFileSync(join(root, 'docs', 'manual-checks.md'), 'utf8').split(/\r?\n/)) {
  if (line.startsWith('## ')) {
    section = line.slice(3).trim()
    current = null
  } else if (line.startsWith('### ')) {
    current = { title: line.slice(4).trim(), section, lines: [] }
    tests.push(current)
  } else if (current !== null && line.trim() !== '') current.lines.push(line)
}

if (count) {
  const bySection = new Map()
  for (const t of tests) bySection.set(t.section, (bySection.get(t.section) ?? 0) + 1)
  for (const [name, n] of bySection) console.log(String(n).padStart(5), name)
  console.log(String(tests.length).padStart(5), 'tests')
  process.exit(0)
}

// The boards: each `preset(` call's source, found by its title.
const source = readFileSync(join(root, 'client', 'src', 'builder', 'manualChecks.ts'), 'utf8')
function boardOf(title) {
  const quoted = [`'${title.replaceAll("'", "\\'")}'`, JSON.stringify(title), `\`${title}\``]
  let at = -1
  for (const q of quoted) {
    at = source.indexOf(q)
    if (at >= 0) break
  }
  if (at < 0) return null
  const start = source.lastIndexOf('preset(', at)
  let depth = 0
  let quote = null
  for (let i = start; i < source.length; i += 1) {
    const c = source[i]
    if (quote !== null) {
      if (c === '\\') i += 1
      else if (c === quote) quote = null
    } else if (c === "'" || c === '"' || c === '`') quote = c
    else if (c === '(') depth += 1
    else if (c === ')') {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1).replace(/\r\n/g, '\n')
    }
  }
  return null
}

let picked
if (titlesPath !== undefined) {
  const wanted = readFileSync(titlesPath, 'utf8').split(/\r?\n/).map((l) => l.replace(/^###\s*/, '').trim()).filter((l) => l !== '')
  picked = wanted.map((title) => tests.find((t) => t.title === title) ?? (console.error(`no test titled: ${title}`), process.exit(2)))
} else if (every !== undefined && every > 0) {
  picked = tests.filter((_, i) => i % every === offset % every)
} else {
  console.error('which tests? --every N [--offset K], or --titles file')
  process.exit(2)
}

mkdirSync(out, { recursive: true })
const letters = 'ABCDEFGHIJ'
for (let a = 0; a < agents; a += 1) {
  const mine = picked.filter((_, i) => i % agents === a)
  const parts = [`# Manual checks, brief ${letters[a]}: ${mine.length} tests`, '']
  mine.forEach((t, i) => {
    parts.push(`## ${i + 1}. ${t.title}`, `(section: ${t.section})`, ...t.lines, '', 'Board:', '```ts', boardOf(t.title) ?? '(no board found)', '```', '')
  })
  const file = join(out, `brief-${letters[a]}.md`)
  writeFileSync(file, parts.join('\n'))
  console.log(`${file}: ${mine.length} tests`)
}
