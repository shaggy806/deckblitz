import { defineCard } from "../define.js";

// EDHREC rank 21227.

export default defineCard({
  name: "Epiphany Storm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{R}, {T}, Discard a card: Draw a card.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: true, discard: { count: 1 } },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{R}, {T}, Discard a card: Draw a card.",
        },
      ],
      text: "Enchanted creature has \"{R}, {T}, Discard a card: Draw a card.\"",
    },
  ],
});
