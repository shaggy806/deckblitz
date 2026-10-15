import { defineCard } from "../define.js";

// EDHREC rank 14181.

export default defineCard({
  name: "Ruinous Rampage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Ruinous Rampage deals 3 damage to each opponent.\n• Exile all artifacts with mana value 3 or less.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Ruinous Rampage deals 3 damage to each opponent.",
        targets: [],
        effect: { kind: "damage", amount: 3, who: "each-opponent" },
      },
      {
        text: "Exile all artifacts with mana value 3 or less.",
        targets: [],
        effect: { kind: "exile-all", filter: { type: "artifact", manaValue: { op: "lte", n: 3 } } },
      },
    ],
  },
});
