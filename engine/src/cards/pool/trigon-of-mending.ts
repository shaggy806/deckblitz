import { defineCard } from "../define.js";

// EDHREC rank 30335.

export default defineCard({
  name: "Trigon of Mending",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{W}{W}, {T}: Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Target player gains 3 life.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{W}{W}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["player"],
      effect: { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Target player gains 3 life.",
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
