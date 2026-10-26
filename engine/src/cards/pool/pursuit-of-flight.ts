import { defineCard } from "../define.js";

const ABILITY_TEXT = "{U}: This creature gains flying until end of turn.";

export default defineCard({
  name: "Pursuit of Flight",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2 and has "${ABILITY_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: "{U}", tap: false },
          targets: [],
          effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: `Enchanted creature gets +2/+2 and has "${ABILITY_TEXT}"`,
    },
  ],
});
