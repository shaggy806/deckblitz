import { defineCard } from "../define.js";

const ABILITY_TEXT = "{R}: This creature gains trample until end of turn.";

export default defineCard({
  name: "Deviant Glee",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+1 and has "${ABILITY_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: `Enchanted creature gets +2/+1 and has "${ABILITY_TEXT}"`,
    },
  ],
});
