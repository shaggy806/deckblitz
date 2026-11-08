import { defineCard } from "../define.js";

// Urza's Saga. With fewer than four cards in hand, discard them all (the ruling).
export default defineCard({
  name: "Attunement",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Return this enchantment to its owner's hand: Draw three cards, then discard four cards.",
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "return-to-hand", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 4 },
        ],
      },
      resolve: null,
      text: "Return this enchantment to its owner's hand: Draw three cards, then discard four cards.",
    },
  ],
});
