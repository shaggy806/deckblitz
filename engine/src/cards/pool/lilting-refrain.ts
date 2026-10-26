import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 22520. X is the verse counters this
// enchantment had as it was sacrificed for the cost (rule 608.2h).

const COUNTER_TEXT =
  "Sacrifice this enchantment: Counter target spell unless its controller pays {X}, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Lilting Refrain",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may put a verse counter on this enchantment.\n${COUNTER_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: { countersOn: "source", counter: "verse" }, text: "Pay {X}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Lilting Refrain?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
});
