import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] This change of life total counts as life gain or life loss, as appropriate.
//
// "Your life total becomes N" (rule 119.5): the loss down to N first — none
// when N is higher — then the gain up to it, none once it's reached. In this
// order a gain an effect changes (doubled, prevented) is the last thing that
// happens, as it should be; a zero gain or loss triggers nothing.

const TEXT =
  "At the beginning of your upkeep, count the number of permanents you control. Your life total becomes that number.";
const LIFE = { lifeTotal: "you" } as const;
const PERMANENTS = { countOf: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Touch of the Eternal",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { difference: [LIFE, PERMANENTS] } },
          { kind: "gain-life", amount: { difference: [PERMANENTS, LIFE] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
