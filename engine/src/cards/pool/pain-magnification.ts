import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent is dealt 3 or more damage by a single source, that player discards a card.";

export default defineCard({
  name: "Pain Magnification",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "opponent", atLeast: 3 },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
