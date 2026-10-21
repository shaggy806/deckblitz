import { defineCard } from "../define.js";

// Ob Nixilis, the Ascended's intervening-if: any life gained this turn, by
// you, however much — one Bat (the rulings).
const TEXT =
  "At the beginning of each end step, if you gained life this turn, create a 1/1 black Bat creature token with flying.";

export default defineCard({
  name: "Regal Bloodlord",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
