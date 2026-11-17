#!/usr/bin/env node
// Plays one of the scenario builder's manual checks by a list of steps and
// prints, after each, the screen as plain text (the decision banner, open
// popups and their cards by pile, tile badges, each player's life and zone
// counts, the stack, the last log lines) and a screenshot's path:
//
//   node client/e2e/run-check.mjs "<check title, or a piece of it>" [step ...]
//     [--steps steps.json] [--shots <dir>] [--reuse]
//     [--scenario board.json] [--size 1920x1080] [--hold]
//
// --scenario plays a board that isn't a manual check: a scenario's JSON, as
// the builder downloads it, loaded through the builder's Import (no check
// title then). --size is the window's, 1366x768 without it. --hold never
// passes priority for you, where the run is about how the stack resolves:
// each pass is then a step (pass, click:Resolve stack).
//
// Steps: cast:<hand card> (or hand:), card:<card in a popup, on the board,
// in hand, in the command zone or shown on top of a library>, stack:<entry on the stack>, click:<button, menu item or labelled box's text>,
// player:<name>, x:<n> (the choose-X box, before its click:Confirm), pass, wait
// (for the bots, up to 30 s: until a decision is yours, or a stack seen
// has emptied), unfollow (stay in this seat while another of yours must act).
// After every step the run passes priority while your own
// spell or ability is on top of the stack, so the decision a check is about
// comes up as it resolves. A steps file is a JSON array of the same strings.
// Names and texts match in part, case aside; a hyphen matches a minus sign; a
// leading = matches the whole text (click:=Search your hand).
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
let hold = false
let scenario
let size
const steps = []
for (let i = 0; i < args.length; i += 1) {
  const a = args[i]
  if (a === '--steps') steps.push(...JSON.parse(readFileSync(args[++i], 'utf8')))
  else if (a === '--shots') shots = resolve(args[++i])
  else if (a === '--reuse') reuse = true
  else if (a === '--hold') hold = true
  else if (a === '--scenario') scenario = readFileSync(args[++i], 'utf8')
  else if (a === '--size') {
    const m = /^(\d+)x(\d+)$/.exec(args[++i] ?? '')
    if (m === null) {
      console.error('--size takes a width and a height, as 1920x1080')
      process.exit(2)
    }
    size = { width: Number(m[1]), height: Number(m[2]) }
  } else if (a === '--help' || a === '-h') {
    console.log(
      'node client/e2e/run-check.mjs "<check title>" [step ...] [--steps file.json] [--shots dir] [--reuse] [--scenario board.json] [--size 1920x1080]',
    )
    process.exit(0)
  } else if (a.startsWith('--')) {
    console.error(`unknown flag ${a}`)
    process.exit(2)
  } else if (check === undefined && scenario === undefined) check = a
  else steps.push(a)
}
// A board given after the steps began: what looked like a title was a step.
if (scenario !== undefined && check !== undefined) {
  steps.unshift(check)
  check = undefined
}
if (check === undefined && scenario === undefined) {
  console.error('which manual check? (its title, or a piece of it — or --scenario board.json)')
  process.exit(2)
}

const env = {
  ...process.env,
  RUN_CHECK: JSON.stringify({
    check: check ?? '',
    steps,
    shots,
    ...(scenario !== undefined ? { scenario } : {}),
    ...(size ? { size } : {}),
    ...(hold ? { hold } : {}),
  }),
}
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
