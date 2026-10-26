import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 8978.
//
// "Each Fungus you control" — every Fungus permanent, whether or not it uses
// spore counters (the ruling).
//
// Rulings:
//   [2006-09-25] Sporesower Thallid's triggered ability will put a spore counter on each Fungus
//     creature you control, even if that Fungus doesn't have any abilities that makes use of them.

export default defineCard({
  name: "Sporesower Thallid",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 4,
  toughness: 4,
  text: "At the beginning of your upkeep, put a spore counter on each Fungus you control.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.",
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
      effect: { kind: "add-counter-all", filter: { subtype: "Fungus", controlledBy: "you" }, counter: "spore", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a spore counter on each Fungus you control.",
    },
  ],
});
