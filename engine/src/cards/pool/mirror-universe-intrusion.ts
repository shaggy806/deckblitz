import { defineCard } from "../define.js";

export default defineCard({
  name: "Mirror Universe Intrusion",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Kicker {4}{U}{B} (You may pay an additional 4 as you cast this spell.)\nCreate a token that's a copy of target creature an opponent controls, except it has menace. If this spell was kicked, instead for each creature target opponent controls, create a token that's a copy of that creature, except it has menace.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "create-token-copy",
    of: 0,
    count: 1,
    who: "you",
    exceptions: { keywords: ["menace"] },
  },
  // Kicked, the spell targets an opponent instead (Tear Asunder's shape) — Clone Legion's copy loop.
  kicker: {
    cost: "{4}{U}{B}",
    targets: ["opponent"],
    effect: {
      kind: "for-each-permanent",
      filter: { type: "creature", controlledBy: "you" },
      controlledByTarget: 0,
      as: 1,
      effect: { kind: "create-token-copy", of: 1, count: 1, who: "you", exceptions: { keywords: ["menace"] } },
    },
  },
});
