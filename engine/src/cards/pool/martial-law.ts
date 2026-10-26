import { defineCard } from "../define.js";

export default defineCard({
  name: "Martial Law",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "detain", target: 0 },
      resolve: null,
      text: "At the beginning of your upkeep, detain target creature an opponent controls.",
    },
  ],
});
