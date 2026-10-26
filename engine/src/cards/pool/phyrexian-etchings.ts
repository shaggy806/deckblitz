import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 23025.
//
// The leaves trigger reads its age counters as the enchantment last existed
// on the battlefield (rule 603.10a).

const END = "At the beginning of your end step, draw a card for each age counter on this enchantment.";
const LEAVES = "When this enchantment is put into a graveyard from the battlefield, you lose 2 life for each age counter on it.";
const UPKEEP = cumulativeUpkeep("{B}");

export default defineCard({
  name: "Phyrexian Etchings",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP.text}\n${END}\n${LEAVES}`,
  triggered: [
    UPKEEP,
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "age" } },
      resolve: null,
      text: END,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "lose-life", amount: { product: [2, { countersOn: "source", counter: "age" }] } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
