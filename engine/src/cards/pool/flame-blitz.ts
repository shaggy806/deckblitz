import { defineCard } from "../define.js";

const END_STEP_TEXT = "At the beginning of your end step, this enchantment deals 5 damage to each planeswalker.";

export default defineCard({
  name: "Flame Blitz",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: `${END_STEP_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "planeswalker" }, amount: 5 },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
});
