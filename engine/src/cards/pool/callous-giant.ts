import { defineCard } from "../define.js";

// EDHREC rank 31439.

export default defineCard({
  name: "Callous Giant",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 4,
  text: "If a source would deal 3 or less damage to this creature, prevent that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "self", prevent: true, ifAtMost: 3 },
      text: "If a source would deal 3 or less damage to this creature, prevent that damage.",
    },
  ],
});
