import { defineCard } from "../define.js";

// Rulings:
//   [2022-06-10] Owlbear Shepherd's ability has an intervening if clause, which means that it
//     checks to see if creatures you control have total power 8 or greater both as it would
//     trigger and as it resolves. If enough creatures have been removed or their total power is
//     reduced to below 8 by the time the ability tries to resolve, you will not draw a card.

const TEXT = "At the beginning of your end step, if creatures you control have total power 8 or greater, draw a card.";

export default defineCard({
  name: "Owlbear Shepherd",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Goblin", "Druid"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
