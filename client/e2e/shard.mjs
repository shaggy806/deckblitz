// Which spec files one part of the E2E run takes, so the parts finish at
// about the same time (.github/workflows/e2e.yml).
//
//   node e2e/shard.mjs <part> <parts> [--quick]
//
// Playwright's own `--shard` deals out the files in name order by how many
// tests each holds, which put the slow ones (the tables, the tutorials,
// resolve-arrows, put-down: late in the alphabet, a minute or four each) in
// the last two parts of four: 250 s of tests in the first part and up to 590
// in the last, and the slowest part is what a deploy waits for (2026-11-18).
// Here every spec file in this directory is dealt to the part that has the
// least to do so far, heaviest file first, by how long it took on GitHub
// (`spec-seconds.json`: seconds for the whole file in one run, refreshed by
// hand from a run's log now and then; a file not in it counts as 30).
//
// Stale numbers cost balance, never coverage: every `*.spec.ts` here is in
// exactly one part whatever the table says. `--quick` leaves out the files
// the quick set skips whole (`test:e2e`'s `--grep-invert`), so no part is
// left with nothing but those.

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const [partArg, partsArg, ...flags] = process.argv.slice(2)
const part = Number(partArg)
const parts = Number(partsArg)
if (!Number.isInteger(part) || !Number.isInteger(parts) || parts < 1 || part < 1 || part > parts) {
  console.error('usage: node e2e/shard.mjs <part> <parts> [--quick]')
  process.exit(2)
}
const quick = flags.includes('--quick')
const seconds = JSON.parse(readFileSync(join(here, 'spec-seconds.json'), 'utf8'))
const DEFAULT_SECONDS = 30
/** What the quick set skips by name (client/package.json's `test:e2e`). */
const QUICK_SKIPS = /^(tutorial-|site-tour)/

const files = readdirSync(here)
  .filter((name) => name.endsWith('.spec.ts') && !(quick && QUICK_SKIPS.test(name)))
  // Heaviest first; by name where they weigh the same, so the deal is the
  // same on every machine.
  .map((name) => ({ name, weight: typeof seconds[name] === 'number' ? seconds[name] : DEFAULT_SECONDS }))
  .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name, 'en'))

const loads = Array.from({ length: parts }, () => ({ weight: 0, files: [] }))
for (const file of files) {
  // The lightest part so far, the first of them on a tie.
  let lightest = loads[0]
  for (const load of loads) if (load.weight < lightest.weight) lightest = load
  lightest.weight += file.weight
  lightest.files.push(file.name)
}

if (flags.includes('--plan')) {
  loads.forEach((load, i) => console.log(`part ${i + 1}: ${Math.round(load.weight)} s  ${load.files.join(' ')}`))
} else {
  console.log(loads[part - 1].files.map((name) => `e2e/${name}`).join(' '))
}
