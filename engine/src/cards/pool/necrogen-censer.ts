import { defineCard } from "../define.js";

// EDHREC rank 30177.

export default defineCard({
  name: "Necrogen Censer",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with two charge counters on it.\n{T}, Remove a charge counter from this artifact: Target player loses 2 life.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 2, target: 0 },
      resolve: null,
      text: "{T}, Remove a charge counter from this artifact: Target player loses 2 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 2 } },
      text: "This artifact enters with two charge counters on it.",
    },
  ],
});
