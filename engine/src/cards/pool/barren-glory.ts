import { defineCard } from "../define.js";

// An intervening-if (rule 603.4): both halves are checked as the trigger
// fires and again as it resolves (the ruling).
export default defineCard({
  name: "Barren Glory",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, if you control no permanents other than this enchantment and have no cards in hand, you win the game.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: {}, atLeast: 1, excludeSelf: true } },
          { kind: "hand-size", atMost: 0 },
        ],
      },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: "At the beginning of your upkeep, if you control no permanents other than this enchantment and have no cards in hand, you win the game.",
    },
  ],
});
