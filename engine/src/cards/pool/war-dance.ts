import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 28616.
//
// Rulings:
//   [2004-10-04] Adding a counter is optional. If you forget to add one during your upkeep, you
//     cannot back up and add one later.
//
// Lilting Refrain's shape: `countersOn: "source"` reads the verse counters
// War Dance last had, once it was sacrificed to pay the cost.

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a verse counter on this enchantment.";
const SAC_TEXT =
  "Sacrifice this enchantment: Target creature gets +X/+X until end of turn, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "War Dance",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { countersOn: "source", counter: "verse" },
        toughness: { countersOn: "source", counter: "verse" },
        duration: "end-of-turn",
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
        prompt: "Put a verse counter on War Dance?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
