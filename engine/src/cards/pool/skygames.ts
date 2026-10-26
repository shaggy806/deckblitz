import { defineCard } from "../define.js";

const GRANT_TEXT = 'Enchanted land has "{T}: Target creature gains flying until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Skygames",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          resolve: null,
          sorcerySpeed: true,
          text: "{T}: Target creature gains flying until end of turn. Activate only as a sorcery.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
