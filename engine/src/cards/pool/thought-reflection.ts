import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 9598.
//
// Rulings:
//   Each card draw is doubled ("draw three" draws six). Multiple Thought Reflections are
//   cumulative: two make each draw four.

export default defineCard({
  name: "Thought Reflection",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "If you would draw a card, draw two cards instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "you", instead: { draws: 2 } },
      text: "If you would draw a card, draw two cards instead.",
    },
  ],
});
