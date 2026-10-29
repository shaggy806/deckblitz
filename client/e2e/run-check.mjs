#!/usr/bin/env node
// Plays one of the scenario builder's manual checks by a list of steps and
// prints, after each, the screen as plain text (the decision banner, open
// popups and their cards by pile, tile badges, each player's life and zone
// counts, the stack, the last log lines) and a screenshot's path:
//
//   node client/e2e/run-check.mjs "<check title, or a piece of it>" [step ...]
//     [--steps steps.json] [--shots <dir>] [--reuse]
//
// Steps: cast:<hand card> (or hand:), card:<card in a popup, on the board,
// or in hand>, click:<button or menu item text>, player:<name>, pass, wait
// (for the bots, up to 30 s: until a decision is yours, or a stack seen
// has emptied). After every step the run passes priority while your own
// spell or ability is on top of the stack, so the decision a check is about
// comes up as it resolves. A steps file is a JSON array of the same strings.
// Names and texts match in part, case aside; a hyphen matches a minus sign.
//
// It runs e2e/run-check.spec.ts through the Playwright config, on ports of its
// own (E2E_WEB_PORT etc., or 5183/4020/4119), starting dev-rooms (which has
// the builder on) and Vite there; --reuse runs against the default ports'
// servers instead when they're up. Exits non-zero when a step finds nothing
// to act on, printing the banner. Needs engine, protocol and server built.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
let check
let shots = join(tmpdir(), 'run-check', new Date().toISOString().replace(/[:.]/g, '-'))
let reuse = false
const steps = []
for (let i = 0; i < args.length; i += 1) {
  const a = args[i]
  if (a === '--steps') steps.push(...JSON.parse(readFileSync(args[++i], 'utf8')))
  else if (a === '--shots') shots = resolve(args[++i])
  else if (a === '--reuse') reuse = true
  else if (a === '--help' || a === '-h') {
    console.log('node client/e2e/run-check.mjs "<check title>" [step ...] [--steps file.json] [--shots dir] [--reuse]')
    process.exit(0)
  } else if (a.startsWith('--')) {
    console.error(`unknown flag ${a}`)
    process.exit(2)
  } else if (check === undefined) check = a
  else steps.push(a)
}
if (check === undefined) {
  console.error('which manual check? (its title, or a piece of it)')
  process.exit(2)
}

const env = { ...process.env, RUN_CHECK: JSON.stringify({ check, steps, shots }) }
if (!reuse) {
  env.E2E_WEB_PORT ??= '5183'
  env.E2E_SERVER_PORT ??= '4020'
  env.E2E_CONTROL_PORT ??= '4119'
}
const result = spawnSync('npx', ['playwright', 'test', 'e2e/run-check.spec.ts', '--reporter=./e2e/run-check-reporter.mjs'], {
  cwd: clientDir,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
