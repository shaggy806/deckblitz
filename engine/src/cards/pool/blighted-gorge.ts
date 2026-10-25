import { defineCard } from "../define.js";

export default defineCard({
  name: "Blighted Gorge",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{4}{R}, {T}, Sacrifice this land: It deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}{R}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{4}{R}, {T}, Sacrifice this land: It deals 2 damage to any target.",
    },
  ],
});
