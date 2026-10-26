import { defineCard } from "../define.js";

// EDHREC rank 29658.

export default defineCard({
  name: "Trigon of Thought",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{U}{U}, {T}: Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Draw a card.",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{U}{U}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Draw a card.",
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
