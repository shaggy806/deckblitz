import { defineCard } from "../define.js";

// EDHREC rank 20537.

export default defineCard({
  name: "Arcane Spyglass",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice a land: Draw a card and put a charge counter on this artifact.\nRemove three charge counters from this artifact: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice a land: Draw a card and put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 3 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Remove three charge counters from this artifact: Draw a card.",
    },
  ],
});
