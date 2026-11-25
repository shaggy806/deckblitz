#!/usr/bin/env node
// One slice of agents playing the manual checks, totalled: each brief's
// verdict counts beside its agent's minutes and tokens, read from the
// subagent transcripts Claude Code keeps (a transcript belongs to the brief
// its first message names). Usage is counted once per message id: a
// transcript repeats it on every row of one reply.
//
//   node scripts/manual-check-usage.mjs --slice slice-20 [--land] [--list failed|cannot-judge|passed]
//     [--transcripts <dir of agent-*.jsonl>]
//
// --land   copies each brief's results to docs/manual-check-runs/<slice>-<L>.jsonl
// --list   prints the tests of one verdict with what the agent wrote
// Without --transcripts it looks under ~/.claude/projects/*/*/subagents.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
let slice
let land = false
let list
let transcripts
for (let i = 0; i < args.length; i += 1) {
  const a = args[i]
  if (a === '--slice') slice = args[++i]
  else if (a === '--land') land = true
  else if (a === '--list') list = args[++i]
  else if (a === '--transcripts') transcripts = resolve(args[++i])
  else {
    console.error(`unknown argument ${a}`)
    process.exit(2)
  }
}
if (slice === undefined) {
  console.error('which slice? --slice slice-20 (a folder of .scratch/manual-checks/)')
  process.exit(2)
}
const dir = join(root, '.scratch', 'manual-checks', slice)
const letters = readdirSync(dir)
  .filter((name) => /^[A-Z]$/.test(name) && existsSync(join(dir, name, 'results.jsonl')))
  .sort()

/** Every subagent transcript on this machine, newest folders included. */
function transcriptFiles() {
  if (transcripts !== undefined) return readdirSync(transcripts).filter((n) => /^agent-.*\.jsonl$/.test(n)).map((n) => join(transcripts, n))
  const projects = join(homedir(), '.claude', 'projects')
  const found = []
  if (!existsSync(projects)) return found
  for (const project of readdirSync(projects)) {
    const sessions = join(projects, project)
    let names
    try {
      names = readdirSync(sessions)
    } catch {
      continue
    }
    for (const session of names) {
      const sub = join(sessions, session, 'subagents')
      if (!existsSync(sub)) continue
      for (const name of readdirSync(sub)) if (/^agent-.*\.jsonl$/.test(name)) found.push(join(sub, name))
    }
  }
  return found
}

const usageOf = new Map()
for (const file of transcriptFiles()) {
  const text = readFileSync(file, 'utf8')
  const named = new RegExp(`manual-checks[\\\\/]+${slice}[\\\\/]+brief-([A-Z])\\.md`).exec(text.slice(0, 20_000))
  if (named === null) continue
  const seen = new Map()
  let first = null
  let last = null
  let tools = 0
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === '') continue
    let row
    try {
      row = JSON.parse(line)
    } catch {
      continue
    }
    const at = row.timestamp ? Date.parse(row.timestamp) : NaN
    if (!Number.isNaN(at)) {
      first ??= at
      last = at
    }
    const message = row.message
    if (message?.role !== 'assistant' || message.usage === undefined) continue
    seen.set(message.id, message.usage)
    for (const part of message.content ?? []) if (part.type === 'tool_use') tools += 1
  }
  const u = { write: 0, read: 0, input: 0, output: 0, tools, minutes: first !== null && last !== null ? (last - first) / 60_000 : 0 }
  for (const usage of seen.values()) {
    u.input += usage.input_tokens ?? 0
    u.write += usage.cache_creation_input_tokens ?? 0
    u.read += usage.cache_read_input_tokens ?? 0
    u.output += usage.output_tokens ?? 0
  }
  usageOf.set(named[1], u)
}

const k = (n) => `${Math.round(n / 1000)}K`
const total = { tests: 0, passed: 0, failed: 0, cannot: 0, write: 0, read: 0, input: 0, output: 0, minutes: 0, runs: 0 }
const rowsOf = []
for (const letter of letters) {
  const rows = readFileSync(join(dir, letter, 'results.jsonl'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
    .map((l) => JSON.parse(l))
  const count = (v) => rows.filter((r) => r.verdict === v).length
  const u = usageOf.get(letter)
  if (list === undefined) {
    console.log(
      `${letter}: ${rows.length} tests, passed ${count('passed')}, failed ${count('failed')}, cannot ${count('cannot-judge')}` +
        (u === undefined ? ' | no transcript found' : ` | ${u.minutes.toFixed(1)} min, ${u.tools} tool calls | write ${k(u.write)}, read ${k(u.read)}, output ${k(u.output)}`),
    )
  }
  total.tests += rows.length
  total.passed += count('passed')
  total.failed += count('failed')
  total.cannot += count('cannot-judge')
  for (const r of rows) {
    total.runs += r.runs ?? 0
    rowsOf.push({ letter, ...r })
  }
  if (u !== undefined) {
    total.write += u.write
    total.read += u.read
    total.input += u.input
    total.output += u.output
    total.minutes += u.minutes
  }
  if (land) {
    const to = join(root, 'docs', 'manual-check-runs')
    mkdirSync(to, { recursive: true })
    copyFileSync(join(dir, letter, 'results.jsonl'), join(to, `${slice}-${letter}.jsonl`))
  }
}
if (list !== undefined) {
  const flat = (text, max) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
  for (const r of rowsOf.filter((r) => r.verdict === list)) {
    console.log(`${r.letter}${r.n} ${flat(r.title, 64)} | ${flat((r.evidence ?? []).join(' ;; '), list === 'cannot-judge' ? 0 : 320)}${r.note ? ` // ${flat(r.note, 220)}` : ''}`)
  }
} else if (total.tests > 0) {
  const n = total.tests
  console.log(`ALL: ${n} tests, passed ${total.passed}, failed ${total.failed}, cannot ${total.cannot} | ${total.minutes.toFixed(0)} agent-minutes`)
  console.log(`tokens: cache-write ${k(total.write)}, cache-read ${k(total.read)}, output ${k(total.output)}, uncached input ${k(total.input)}`)
  console.log(`a test: cache-write ${(total.write / n / 1000).toFixed(1)}K, cache-read ${(total.read / n / 1000).toFixed(0)}K, output ${(total.output / n / 1000).toFixed(1)}K, ${((total.minutes * 60) / n).toFixed(0)} s, ${(total.runs / n).toFixed(1)} runs`)
  if (land) console.log(`landed in docs/manual-check-runs/ as ${slice}-<letter>.jsonl`)
}
