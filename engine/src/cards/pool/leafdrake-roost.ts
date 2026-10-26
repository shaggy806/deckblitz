import { defineCard } from "../define.js";

// Dissension.
const GRANT_TEXT = 'Enchanted land has "{G}{U}, {T}: Create a 2/2 green and blue Drake creature token with flying."';

export default defineCard({
  name: "Leafdrake Roost",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{G}{U}", tap: true },
          targets: [],
          effect: { kind: "create-token", token: "Drake Token (Leafdrake Roost)", count: 1 },
          resolve: null,
          text: "{G}{U}, {T}: Create a 2/2 green and blue Drake creature token with flying.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
