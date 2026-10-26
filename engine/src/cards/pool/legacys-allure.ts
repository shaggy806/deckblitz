import { defineCard } from "../define.js";

// EDHREC rank 19335.
//
// Rulings:
//   The "power less than or equal to the number of treasure counters" restriction is a targeting
//   restriction, checked on announcement and again on resolution (the enchantment, sacrificed as
//   the cost, is read as it last existed).

export default defineCard({
  name: "Legacy's Allure",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, you may put a treasure counter on this enchantment.\nSacrifice this enchantment: Gain control of target creature with power less than or equal to the number of treasure counters on this enchantment. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            power: { op: "lte", n: { amount: { countersOn: "source", counter: "treasure" } } },
          },
        },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "Sacrifice this enchantment: Gain control of target creature with power less than or equal to the number of treasure counters on this enchantment.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a treasure counter on Legacy's Allure?",
        effect: { kind: "add-counter", target: "source", counter: "treasure", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a treasure counter on this enchantment.",
    },
  ],
});
