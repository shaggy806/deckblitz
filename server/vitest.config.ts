import { defineConfig } from "vitest/config";

import { ProgressReporter } from "../engine/scripts/vitest-progress.mjs";

// vitest's defaults, plus a progress file the job-progress Claude Code mod
// draws as a bar (engine/scripts/progress.mjs), and the built engine imported
// by Node itself.
//
// `engine` is a workspace symlink: it resolves to `<repo>/engine/dist`, outside
// `node_modules`, so vitest would inline it — the 29 MB card barrel and its
// source map through Vite's transform once for each isolated test file, ~5 s a
// file. Left external, each worker imports it as the running server does, in
// about a second: the suite went from 47 s to 16 s (2026-11-10). A RegExp,
// because a string only matches under `node_modules`. The price is that an
// engine frame in a failing test's stack names `dist`, not `src`.
export default defineConfig({
  test: {
    reporters: ["default", new ProgressReporter("server tests")],
    server: { deps: { external: [/\/engine\/dist\//] } },
  },
});
