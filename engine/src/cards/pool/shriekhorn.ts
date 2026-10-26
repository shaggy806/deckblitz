import { defineCard } from "../define.js";

// EDHREC rank 17591.

export default defineCard({
  name: "Shriekhorn",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{T}, Remove a charge counter from this artifact: Target player mills two cards.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: "{T}, Remove a charge counter from this artifact: Target player mills two cards.",
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
