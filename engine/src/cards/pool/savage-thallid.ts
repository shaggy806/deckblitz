import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 11271. Deathspore Thallid's spore clock.

export default defineCard({
  name: "Savage Thallid",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 5,
  toughness: 2,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.\nSacrifice a Saproling: Regenerate target Fungus.",
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
      targets: [{ kind: "permanent", filter: { subtype: "Fungus" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "Sacrifice a Saproling: Regenerate target Fungus.",
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
