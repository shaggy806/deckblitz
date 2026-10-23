import { defineCard } from "../define.js";

export default defineCard({
  name: "Psychotrope Thallid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your upkeep, put a spore counter on this creature.\nRemove three spore counters from this creature: Create a 1/1 green Saproling creature token.\n{1}, Sacrifice a Saproling: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "Remove three spore counters from this creature: Create a 1/1 green Saproling creature token.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Saproling" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice a Saproling: Draw a card.",
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
