import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 29352.
//
// Rulings:
//   [2004-10-04] Adding a counter is optional. If you forget to add one during your upkeep, you
//     cannot back up and add one later.
// `countersOn: "source"` reads the last-known verse counters once the
// enchantment was sacrificed as the cost (Lilting Refrain).

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a verse counter on this enchantment.";
const SAC_TEXT =
  "{2}{R}, Sacrifice this enchantment: It deals X damage to any target, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Torch Song",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "verse" }, target: 0 },
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
        prompt: "Put a verse counter on Torch Song?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
