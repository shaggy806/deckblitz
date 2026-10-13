import { defineCard } from "../define.js";

// EDHREC rank 4533.
//
// Every other creature on the battlefield as it resolves — anyone's — copies
// the target's copiable values as they were then (what it copies, if it's a
// copy; a token's as the effect that made it said, without becoming tokens),
// except it isn't legendary (rule 707.9b), until the cleanup step (rule
// 514.2), when each is what it was before. Each keeps its counters, status
// and the non-copy effects on it (rule 707.4) — a Giant Growth still applies
// — and one that copies an unanimated Vehicle stops being a creature.
const TEXT =
  "Choose target creature you control. Each other creature becomes a copy of that creature until end of turn, except it isn't legendary.";

export default defineCard({
  name: "Nanogene Conversion",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "become-copy",
    filter: { type: "creature" },
    exceptOf: true,
    of: 0,
    until: "end-of-turn",
    exceptions: { notLegendary: true },
  },
});
