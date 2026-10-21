import { defineCard } from "../define.js";

const GRANT_TEXT = 'Enchanted land has "{T}: Target creature gains trample and haste until end of turn."';

export default defineCard({
  name: "Footfall Crater",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{1}" },
  text: `Enchant land\n${GRANT_TEXT}\nCycling {1} ({1}, Discard this card: Draw a card.)`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            ],
          },
          resolve: null,
          text: "{T}: Target creature gains trample and haste until end of turn.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
