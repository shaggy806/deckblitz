import { defineCard } from "../define.js";

export default defineCard({
  name: "Moonglove Extract",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Sacrifice this artifact: It deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Sacrifice this artifact: It deals 2 damage to any target.",
    },
  ],
});
