import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 30384. The land's controller activates the granted
// ability (the ruling) — Hot Springs, on any land.

const GRANTED_TEXT = "{T}: Prevent the next 1 damage that would be dealt to any target this turn.";
const GRANT_TEXT = `Enchanted land has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Flowering Field",
  manaCost: "{1}{W}",
  colors: ["W"],
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
