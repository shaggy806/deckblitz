import { defineCard } from "../define.js";

// EDHREC rank 22698.

export default defineCard({
  name: "Tamiyo's Immobilizer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: "This artifact enters with four oil counters on it.\n{T}, Remove an oil counter from this artifact: Tap target artifact or creature.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: ["artifact-or-creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}, Remove an oil counter from this artifact: Tap target artifact or creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 4 } },
      text: "This artifact enters with four oil counters on it.",
    },
  ],
});
