import { defineCard } from "../define.js";

// EDHREC rank 25060.

export default defineCard({
  name: "Feral Thallid",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 6,
  toughness: 3,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Remove three spore counters from this creature: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "spore", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a spore counter on this creature.",
    },
  ],
});
