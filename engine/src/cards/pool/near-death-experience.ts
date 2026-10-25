import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, if you have exactly 1 life, you win the game.";

export default defineCard({
  name: "Near-Death Experience",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "life-total", atLeast: 1, atMost: 1 },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: TEXT,
    },
  ],
});
