import { defineCard } from "../define.js";

// EDHREC rank 12886.
//
// Rulings:
//   [2020-08-07] If a permanent has {X} in its mana cost, X is considered to be 0.
//   [2020-08-07] Colorless mana won't give Engineered Explosives another charge counter. Colorless
//     is not a color.
//   [2020-08-07] You can choose any value for X as you cast Engineered Explosives. The value
//     chosen for X doesn't directly affect the number of charge counters Engineered Explosives
//     enters the battlefield with, but it does let you pay more mana and thus spend more colors of
//     mana to cast it.
//   [2020-08-07] Tokens that aren't a copy of something else don't have a mana cost. Anything
//     without a mana cost normally has a mana value of 0.

export default defineCard({
  name: "Engineered Explosives",
  manaCost: "{X}",
  colors: [],
  types: ["artifact"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\n{2}, Sacrifice this artifact: Destroy each nonland permanent with mana value equal to the number of charge counters on this artifact.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { notTypes: ["land"], manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "charge" } } } } },
      resolve: null,
      text: "{2}, Sacrifice this artifact: Destroy each nonland permanent with mana value equal to the number of charge counters on this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});
