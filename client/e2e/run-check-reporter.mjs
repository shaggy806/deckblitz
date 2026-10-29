// run-check.mjs's reporter: the spec's own lines, and an error's first line
// when it failed for some other reason (a timeout) — no traces, no summary.

// Playwright colours its messages.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

export default class RunCheckReporter {
  onStdOut(chunk) {
    process.stdout.write(chunk)
  }

  onStdErr(chunk) {
    process.stderr.write(chunk)
  }

  onTestEnd(test, result) {
    if (result.status === 'passed' || result.status === 'skipped') return
    const message = result.errors[0]?.message ?? result.status
    // The spec's own failures have said what they found already.
    if (/found no target|no such manual check/.test(message)) return
    process.stdout.write(`FAILED: ${message.split('\n')[0].replace(ANSI, '')}\n`)
  }

  onError(error) {
    process.stdout.write(`FAILED: ${(error.message ?? String(error)).split('\n')[0]}\n`)
  }

  printsToStdio() {
    return true
  }
}
