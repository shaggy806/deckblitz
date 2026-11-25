#!/usr/bin/env node
// Plays several of the scenario builder's manual checks in one go, each
// through run-check.mjs, and prints every run's screens as short text: what
// an agent working down docs/manual-checks.md reads instead of a browser
// (.claude/manual-checks/agent-guide.md).
//
//   node client/e2e/run-checks.mjs plan.json [--out <dir>] [--parallel 2] [--ports 0]
//
// plan.json: [{ "title": "<check title>", "steps": ["cast:Shock", "wait"], "hold": false }, ...]
// --out      where each run's full transcript (<n>.txt) and screenshots
//            (<n>/) go; a folder in the OS temp dir without it.
// --parallel runs at once, each on ports of its own (dev-rooms and Vite are
//            started and stopped by every run). 2 without it.
// --ports    a number added to every port, so two of these can run side by
//            side (0 and 10, say).
//
// What it prints leaves out the screenshot paths and each player's line where
// it hasn't changed since the step before; the transcripts keep everything.
// (run-check itself prints a board, hand or pile line only where it changed.)

import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
let planPath
let out = join(tmpdir(), 'run-checks', new Date().toISOString().replace(/[:.]/g, '-'))
let parallel = 2
let ports = 0
for (let i = 0; i < args.length; i += 1) {
  const a = args[i]
  if (a === '--out') out = resolve(args[++i])
  else if (a === '--parallel') parallel = Math.max(1, Number(args[++i]) || 1)
  else if (a === '--ports') ports = Number(args[++i]) || 0
  else if (a === '--help' || a === '-h') {
    console.log('node client/e2e/run-checks.mjs plan.json [--out <dir>] [--parallel 2] [--ports 0]')
    process.exit(0)
  } else if (a.startsWith('--')) {
    console.error(`unknown flag ${a}`)
    process.exit(2)
  } else planPath = a
}
if (planPath === undefined) {
  console.error('which plan? a JSON file: [{ "title": "...", "steps": ["..."] }, ...]')
  process.exit(2)
}
const plan = JSON.parse(readFileSync(planPath, 'utf8'))
if (!Array.isArray(plan) || plan.some((p) => typeof p?.title !== 'string' || !Array.isArray(p.steps))) {
  console.error('the plan is a JSON array of { "title": "...", "steps": ["..."] }')
  process.exit(2)
}
mkdirSync(out, { recursive: true })

/** One run's output with the screenshot lines gone and a player's line kept
 * only where it differs from the step before. */
function compact(text) {
  const kept = []
  let players = new Map()
  for (const line of text.split(/\r?\n/)) {
    if (/^\s+shot: /.test(line)) continue
    const player = /^\s+([a-z]+)(?: \(you\))?: life /.exec(line)
    if (player !== null) {
      if (players.get(player[1]) === line) continue
      players.set(player[1], line)
    }
    if (line.startsWith('== start')) players = new Map()
    kept.push(line.length > 900 ? `${line.slice(0, 900)} …` : line)
  }
  return kept.join('\n').trim()
}

function run(index, slot) {
  const entry = plan[index]
  const n = String(index + 1).padStart(2, '0')
  const base = ports + slot
  const env = {
    ...process.env,
    E2E_WEB_PORT: String(5183 + base),
    E2E_SERVER_PORT: String(4020 + base),
    E2E_CONTROL_PORT: String(4119 + base),
  }
  const argv = [join(here, 'run-check.mjs'), entry.title, ...entry.steps, '--shots', join(out, n)]
  if (entry.hold === true) argv.push('--hold')
  return new Promise((done) => {
    const child = spawn(process.execPath, argv, { env })
    let text = ''
    child.stdout.on('data', (d) => (text += d))
    child.stderr.on('data', (d) => (text += d))
    child.on('close', (code) => {
      writeFileSync(join(out, `${n}.txt`), text)
      done({ index, code, text })
    })
  })
}

const results = new Array(plan.length)
let next = 0
await Promise.all(
  Array.from({ length: Math.min(parallel, plan.length) }, async (_, slot) => {
    while (next < plan.length) {
      const index = next
      next += 1
      results[index] = await run(index, slot)
    }
  }),
)
for (const { index, code, text } of results) {
  const n = String(index + 1).padStart(2, '0')
  console.log(`\n######## ${n} ${plan[index].title}${code === 0 ? '' : `   [a step found nothing to act on, or the run failed: exit ${code}]`}`)
  console.log(compact(text))
}
console.log(`\ntranscripts and screenshots: ${out}`)
