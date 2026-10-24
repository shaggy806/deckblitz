// The open pull requests, each against origin/main: commits ahead/behind, whether GitHub
// says it merges, its CI against main's own CI, and the files open PRs both touch.
// gh is not installed on the Windows machine; the public REST API needs no auth
// (60 requests an hour: this spends 2 per PR, plus 2).
// Run from the repo root after a fetch: node .claude/skills/sync-check/prs.mjs
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const repo = git("remote", "get-url", "origin").replace(/.*github\.com[:/]/, "").replace(/\.git$/, "");
const api = async (path) => {
  const res = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    headers: { "User-Agent": "sync-check" },
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? res.status);
  return body;
};
const checks = async (sha) => {
  const runs = (await api(`commits/${sha}/check-runs`)).check_runs;
  return runs.length ? runs.map((c) => `${c.name}=${c.conclusion ?? c.status}`).join(", ") : "none";
};
const count = (range) => {
  try { return git("rev-list", "--count", range); } catch { return "?"; }
};

let pulls;
try {
  pulls = await api("pulls?state=open&per_page=50");
} catch (e) {
  console.log(`(could not reach GitHub: ${e.message})`);
  process.exit(0);
}
if (!pulls.length) {
  console.log("none");
  process.exit(0);
}

const files = new Map();
for (const p of pulls) {
  const head = `origin/${p.head.ref}`;
  const detail = await api(`pulls/${p.number}`).catch(() => ({}));
  console.log(`#${p.number} ${p.head.ref} -> ${p.base.ref}  ${p.title}  (${p.updated_at.slice(0, 10)}${p.draft ? ", draft" : ""})`);
  console.log(`    ahead ${count(`origin/main..${head}`)}, behind ${count(`${head}..origin/main`)}; ` +
    `${detail.changed_files ?? "?"} files +${detail.additions ?? "?"}/-${detail.deletions ?? "?"}; ` +
    `mergeable ${detail.mergeable ?? "unknown"} (${detail.mergeable_state ?? "?"})`);
  console.log(`    CI: ${await checks(p.head.sha).catch((e) => `(${e.message})`)}`);
  try {
    files.set(p.number, new Set(git("diff", "--name-only", `origin/main...${head}`).split("\n").filter(Boolean)));
  } catch {
    files.set(p.number, new Set());
  }
}
console.log(`main CI (${git("rev-parse", "--short=8", "origin/main")}): ${await checks(git("rev-parse", "origin/main")).catch((e) => `(${e.message})`)}`);

const nums = [...files.keys()];
for (let i = 0; i < nums.length; i++) {
  for (let j = i + 1; j < nums.length; j++) {
    const shared = [...files.get(nums[i])].filter((f) => files.get(nums[j]).has(f));
    if (shared.length) console.log(`#${nums[i]} and #${nums[j]} both touch ${shared.length}: ${shared.slice(0, 8).join(", ")}${shared.length > 8 ? ", …" : ""}`);
  }
}
