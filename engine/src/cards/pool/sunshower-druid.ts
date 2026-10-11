import { defineCard } from "../define.js";

// EDHREC rank 6827.
//
// Rulings:
//   [2024-07-26] If the target creature is an illegal target as Sunshower Druid's ability tries
//     to resolve, it won't resolve and none of its effects will happen. You won't gain 1 life.
//
// One targeted trigger: with its only target gone it doesn't resolve at all,
// so the life goes with the counter.
const ETB_TEXT = "When this creature enters, put a +1/+1 counter on target creature and you gain 1 life.";

export default defineCard({
  name: "Sunshower Druid",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Druid"],
  power: 0,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
