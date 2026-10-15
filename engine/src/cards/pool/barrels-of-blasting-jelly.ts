import { defineCard } from "../define.js";

// EDHREC rank 11069. "It deals 5 damage": the artifact, sacrificed to pay the
// cost, as it last existed (Mouser Foundry's shape).

export default defineCard({
  name: "Barrels of Blasting Jelly",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}: Add one mana of any color. Activate only once each turn.\n{5}, {T}, Sacrifice this artifact: It deals 5 damage to target creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}: Add one mana of any color. Activate only once each turn.",
      oncePerTurn: true,
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 5 },
      resolve: null,
      text: "{5}, {T}, Sacrifice this artifact: It deals 5 damage to target creature.",
    },
  ],
});
