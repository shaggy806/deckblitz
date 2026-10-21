import { defineCard } from "../define.js";

// EDHREC rank 20824. Dragon Mantle's granted ability; once activated it
// resolves even if the Aura has left (the ruling).

const LOOT_TEXT = "{T}: Draw a card, then discard a card.";
const ENCHANTED_TEXT = `Enchanted creature gets +0/+2 and has "${LOOT_TEXT}"`;

export default defineCard({
  name: "Hard Cover",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENCHANTED_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          resolve: null,
          text: LOOT_TEXT,
        },
      ],
      text: ENCHANTED_TEXT,
    },
  ],
});
