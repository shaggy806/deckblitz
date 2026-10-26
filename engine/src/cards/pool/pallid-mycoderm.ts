import { defineCard } from "../define.js";

// EDHREC rank 19540.
//
// Rulings:
//   A creature that's both a Fungus and a Saproling gets just +1/+1 from Pallid Mycoderm's last ability.

export default defineCard({
  name: "Pallid Mycoderm",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 2,
  toughness: 4,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.\nSacrifice a Saproling: Each creature you control that's a Fungus or a Saproling gets +1/+1 until end of turn.",
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
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ subtype: "Fungus" }, { subtype: "Saproling" }] },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice a Saproling: Each creature you control that's a Fungus or a Saproling gets +1/+1 until end of turn.",
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
