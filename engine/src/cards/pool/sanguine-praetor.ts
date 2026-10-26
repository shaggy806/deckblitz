import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 27803.
//
// The sacrificed creature's mana value is read as it last existed (rule
// 608.2h); Sanguine Praetor itself is destroyed too if it matches.

export default defineCard({
  name: "Sanguine Praetor",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar", "Praetor"],
  power: 7,
  toughness: 5,
  text: "{B}, Sacrifice a creature: Destroy each creature with the same mana value as the sacrificed creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: { manaValueOf: "sacrificed" } } } },
      },
      resolve: null,
      text: "{B}, Sacrifice a creature: Destroy each creature with the same mana value as the sacrificed creature.",
    },
  ],
});
