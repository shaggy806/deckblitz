import { defineCard } from "../define.js";

// EDHREC rank 21392.
export default defineCard({
  name: "Devouring Strossus",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nAt the beginning of your upkeep, sacrifice a creature.\nSacrifice a creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice a creature: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature.",
    },
  ],
});
