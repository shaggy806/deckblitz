import { defineCard } from "../define.js";


export default defineCard({
  name: "Disruptor Pistol",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{4}, {T}, Sacrifice this artifact: It deals 5 damage to target creature.",
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "{4}, {T}, Sacrifice this artifact: It deals 5 damage to target creature.",
    },
  ],
});
