import { defineCard } from "../define.js";

// Dissension. EDHREC rank 26626.

const DRAW_TEXT = "{T}: Draw a card.";
const GRANT_TEXT = `Enchanted creature has "${DRAW_TEXT}"`;
const VIGILANCE_TEXT = "{W}: Enchanted creature gains vigilance until end of turn.";

export default defineCard({
  name: "Ocular Halo",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${VIGILANCE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: DRAW_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: VIGILANCE_TEXT,
    },
  ],
});
