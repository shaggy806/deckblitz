import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 27122.
//
// Rulings:
//   Adding a counter is optional. If you forget to add one during your upkeep, you cannot back up
//     and add one later.
//
// X is the verse counters this enchantment had as it was sacrificed for the
// cost (rule 608.2h — Lilting Refrain's shape).

const SAC_TEXT =
  "{G}, Sacrifice this enchantment: Create X 3/3 green Beast creature tokens, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Midsummer Revel",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may put a verse counter on this enchantment.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "3/3 Beast Token",
        count: { countersOn: "source", counter: "verse" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Midsummer Revel?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
});
