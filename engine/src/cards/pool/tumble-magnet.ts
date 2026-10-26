import { defineCard } from "../define.js";

// EDHREC rank 26721.

export default defineCard({
  name: "Tumble Magnet",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{T}, Remove a charge counter from this artifact: Tap target artifact or creature.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["artifact-or-creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}, Remove a charge counter from this artifact: Tap target artifact or creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 3 } },
      text: "This artifact enters with three charge counters on it.",
    },
  ],
});
