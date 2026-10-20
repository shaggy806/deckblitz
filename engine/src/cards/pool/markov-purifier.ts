import { defineCard } from "../define.js";

// "If you gained life this turn" is an intervening-if (rule 603.4), met by any
// life gained this turn even if as much or more was lost (the ruling).
const TEXT =
  "At the beginning of your end step, if you gained life this turn, you may pay {2}. If you do, draw a card.";

export default defineCard({
  name: "Markov Purifier",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to draw a card?",
        cost: "{2}",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
