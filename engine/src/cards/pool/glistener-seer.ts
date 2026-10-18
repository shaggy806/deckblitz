import { defineCard } from "../define.js";

// EDHREC rank 19118.

export default defineCard({
  name: "Glistener Seer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Advisor"],
  power: 0,
  toughness: 3,
  text: "This creature enters with three oil counters on it.\n{T}, Remove an oil counter from this creature: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{T}, Remove an oil counter from this creature: Scry 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 3 } },
      text: "This creature enters with three oil counters on it.",
    },
  ],
});
