import { defineCard } from "../define.js";

// EDHREC rank 5682.
//
// Rulings:
//   [2004-10-04] The mana value of this card is still 8, even if you only pay {B}{B} to cast it.

export default defineCard({
  name: "Avatar of Woe",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 5,
  keywords: ["fear"],
  text: "If there are ten or more creature cards total in all graveyards, this spell costs {6} less to cast.\nFear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n{T}: Destroy target creature. It can't be regenerated.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{T}: Destroy target creature. It can't be regenerated.",
    },
  ],
  selfCostReduction: {
    condition: {
      kind: "aggregate",
      value: { aggregate: "count", filter: { type: "creature" }, in: "graveyards" },
      compare: { op: "gte", n: 10 },
    },
    reduceGeneric: 6,
  },
});
