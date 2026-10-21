import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 29401.
//
// The granted trigger is the land's, so "your upkeep" and the {W}{W} are its
// controller's (Clawing Torment's shape).
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {W}{W}. If you do, you gain 1 life.";

export default defineCard({
  name: "Farmstead",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nEnchanted land has "${UPKEEP_TEXT}"`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "may", prompt: "Pay {W}{W} to gain 1 life?", cost: "{W}{W}", effect: { kind: "gain-life", amount: 1 } },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Enchanted land has "${UPKEEP_TEXT}"`,
    },
  ],
});
