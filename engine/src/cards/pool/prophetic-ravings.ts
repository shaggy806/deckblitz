import { defineCard } from "../define.js";

// EDHREC rank 18643.
const GRANT_TEXT = 'Enchanted creature has haste and "{T}, Discard a card: Draw a card."';

export default defineCard({
  name: "Prophetic Ravings",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["haste"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true, discard: { count: 1 } },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{T}, Discard a card: Draw a card.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
