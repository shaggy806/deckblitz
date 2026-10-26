import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 12436. Any creature's entry, this one's
// controller's own included; not optional (the ruling).
//
// Rulings:
//   [2004-10-04] This is not optional.

export default defineCard({
  name: "Carnival of Souls",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a creature enters, you lose 1 life and add {B}.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "add-mana", mana: "B", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever a creature enters, you lose 1 life and add {B}.",
    },
  ],
});
