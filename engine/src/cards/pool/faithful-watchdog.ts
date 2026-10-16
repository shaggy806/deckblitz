import { defineCard } from "../define.js";

// EDHREC rank 8917. Modern Horizons 3 Commander.

const COUNTERS_TEXT = "This creature enters with three +1/+1 counters on it.";

export default defineCard({
  name: "Faithful Watchdog",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: `Vigilance\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: COUNTERS_TEXT,
    },
  ],
});
