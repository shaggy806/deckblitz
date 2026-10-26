import { defineCard } from "../define.js";

// EDHREC rank 29958.
//
// Rulings:
//   [2004-10-04] Adding a counter is optional. If you forget to add one during your upkeep, you
//     cannot back up and add one later.

export default defineCard({
  name: "Discordant Dirge",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.\n{B}, Sacrifice this enchantment: Look at target opponent's hand and choose up to X cards from it, where X is the number of verse counters on this enchantment. That player discards those cards.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      // `countersOn: "source"` reads the counters the enchantment had as it
      // was sacrificed for the cost (rule 608.2h).
      effect: {
        kind: "discard-chosen",
        target: 0,
        lookOnly: true,
        upTo: { countersOn: "source", counter: "verse" },
      },
      resolve: null,
      text: "{B}, Sacrifice this enchantment: Look at target opponent's hand and choose up to X cards from it, where X is the number of verse counters on this enchantment. That player discards those cards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Discordant Dirge?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
});
