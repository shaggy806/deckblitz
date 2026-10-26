import { defineCard } from "../define.js";

// EDHREC rank 27306. Epiphany Storm's granted ability, on a land.

const TEXT = 'Enchanted land has "{T}, Discard a card: Draw a card."';

export default defineCard({
  name: "Tin Street Market",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, discard: { count: 1 } },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{T}, Discard a card: Draw a card.",
        },
      ],
      text: TEXT,
    },
  ],
});
