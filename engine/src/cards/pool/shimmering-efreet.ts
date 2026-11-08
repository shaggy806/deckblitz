import { defineCard } from "../define.js";

const PHASES_IN_TEXT =
  "Whenever this creature phases in, target creature phases out. (It phases in before its controller untaps during their next untap step.)";

// The generic `phases-in` trigger (B278). With no other creature it may
// target itself (its ruling): "target creature" isn't "another".
export default defineCard({
  name: "Shimmering Efreet",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "phasing"],
  text: `Flying\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${PHASES_IN_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "phases-in", who: "self" },
      targets: ["creature"],
      effect: { kind: "phase-out", target: 0 },
      resolve: null,
      text: PHASES_IN_TEXT,
    },
  ],
});
