import { defineCard } from "../define.js";

// EDHREC rank 15293.
// Makes Saproling → use "Saproling Token".

export default defineCard({
  name: "Elvish Farmer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 0,
  toughness: 2,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.\nSacrifice a Saproling: You gain 2 life.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "Remove three spore counters from this creature: Create a 1/1 green Saproling creature token.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Saproling" } } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Sacrifice a Saproling: You gain 2 life.",
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
