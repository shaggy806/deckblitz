import { defineCard } from "../define.js";

// EDHREC rank 9313.
// Makes Saproling → use "Saproling Token".

export default defineCard({
  name: "Thallid",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "Remove three spore counters from this creature: Create a 1/1 green Saproling creature token.",
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
