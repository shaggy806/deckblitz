import { defineCard } from "../define.js";

const ABILITY_TEXT = "{T}: Target creature gains haste until end of turn.";

export default defineCard({
  name: "Racecourse Fury",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nEnchanted land has "${ABILITY_TEXT}"`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: `Enchanted land has "${ABILITY_TEXT}"`,
    },
  ],
});
