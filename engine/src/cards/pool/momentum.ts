import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 28986.
//
// Rulings:
//   [2004-10-04] Putting on a counter is optional. If you forget, you can't go back later even if
//     it is something you usually do.

const COUNTER_TEXT = "At the beginning of your upkeep, you may put a growth counter on this Aura.";
const PUMP_TEXT = "Enchanted creature gets +1/+1 for each growth counter on this Aura.";

export default defineCard({
  name: "Momentum",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${COUNTER_TEXT}\n${PUMP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a growth counter on Momentum?",
        effect: { kind: "add-counter", target: "source", counter: "growth", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "growth", pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
