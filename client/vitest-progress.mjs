// The client's unit tests on the job-progress mod's bar: the engine's vitest
// reporter (engine/scripts/vitest-progress.mjs, a test file a unit) under the
// client's own label. Named by path in `vite.config.ts`, which is type-checked
// and so can't import an untyped .mjs itself; vitest builds a reporter given
// by path from the module's default export.

import { ProgressReporter } from "../engine/scripts/vitest-progress.mjs";

export default class ClientProgressReporter extends ProgressReporter {
  constructor() {
    super("client tests");
  }
}
