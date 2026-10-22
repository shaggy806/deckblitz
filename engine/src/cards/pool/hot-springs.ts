import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 31728.

const GRANTED_TEXT = "{T}: Prevent the next 1 damage that would be dealt to any target this turn.";
const GRANT_TEXT = `Enchanted land has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Hot Springs",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${GRANT_TEXT}`,
  targets: ["land-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "prevent-damage", target: 0, amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
