import { defineCard } from "../define.js";

const LOSE_TEXT = "Whenever you lose life for the first time each turn, you get {E}. (You get an energy counter. Damage causes loss of life.)";
const SAC_TEXT = "Pay {E}{E}, Sacrifice this enchantment: Each opponent loses 3 life. You gain life equal to the life lost this way.";

// The timing wrapper's `firstTimeEachTurn` on `loses-life` (B278): one
// energy a turn, however much was lost (its ruling).
export default defineCard({
  name: "Gonti's Machinations",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${LOSE_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "loses-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
