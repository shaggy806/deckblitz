import { defineCard } from "../define.js";

// EDHREC rank 24685.

export default defineCard({
  name: "Trigon of Corruption",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{B}{B}, {T}: Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Put a -1/-1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{B}{B}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Put a -1/-1 counter on target creature.",
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
