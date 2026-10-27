import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}: Target player loses 3 life.";
const TEXT = `Enchanted land has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Caustic Tar",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player"],
          effect: { kind: "lose-life", amount: 3, target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
