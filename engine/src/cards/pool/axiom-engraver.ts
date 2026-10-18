import { defineCard } from "../define.js";

// EDHREC rank 20935.

export default defineCard({
  name: "Axiom Engraver",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 1,
  toughness: 3,
  text: "This creature enters with two oil counters on it.\n{T}, Remove an oil counter from this creature, Discard a card: Draw a card.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: "This creature enters with two oil counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 }, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Remove an oil counter from this creature, Discard a card: Draw a card.",
    },
  ],
});
