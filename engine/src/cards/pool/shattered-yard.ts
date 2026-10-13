import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Glassworks // Shattered Yard (glassworks-shattered-yard.ts).
const END = "At the beginning of your end step, this Room deals 1 damage to each opponent.";

export default defineCard({
  name: "Shattered Yard",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${END}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: END,
    },
  ],
  faces: ["Glassworks // Shattered Yard", "Glassworks", "Shattered Yard"],
  split: true,
});
