import { defineCard } from "../define.js";

// EDHREC rank 19095.

export default defineCard({
  name: "Sunset Pyramid",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three brick counters on it.\n{2}, {T}, Remove a brick counter from this artifact: Draw a card.\n{2}, {T}: Scry 1.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "brick", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Remove a brick counter from this artifact: Draw a card.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{2}, {T}: Scry 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "brick", amount: 3 } },
      text: "This artifact enters with three brick counters on it.",
    },
  ],
});
