import { defineCard } from "../define.js";

// EDHREC rank 5843. The charge counters are read as the ability resolves —
// from the Vial's last-known information if it has left (its ruling).

export default defineCard({
  name: "Aether Vial",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, you may put a charge counter on this artifact.\n{T}: You may put a creature card with mana value equal to the number of charge counters on this artifact from your hand onto the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "charge" } } },
        },
      },
      resolve: null,
      text: "{T}: You may put a creature card with mana value equal to the number of charge counters on this artifact from your hand onto the battlefield.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on Aether Vial?",
        effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a charge counter on this artifact.",
    },
  ],
});
