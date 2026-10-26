import { defineCard } from "../define.js";

// EDHREC rank 10693.

export default defineCard({
  name: "Ring of Three Wishes",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three wish counters on it.\n{5}, {T}, Remove a wish counter from this artifact: Search your library for a card, put that card into your hand, then shuffle.",
  activated: [
    {
      cost: { mana: "{5}", tap: true, removeCounter: { kind: "wish", count: 1 } },
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      resolve: null,
      text: "{5}, {T}, Remove a wish counter from this artifact: Search your library for a card, put that card into your hand, then shuffle.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "wish", amount: 3 } },
      text: "This artifact enters with three wish counters on it.",
    },
  ],
});
