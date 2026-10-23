import { defineCard } from "../define.js";

// EDHREC rank 18643.

const GRANTED_TEXT = "{T}, Discard a card: Draw a card.";
const TEXT = `Enchanted creature has haste and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Prophetic Ravings",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
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
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
