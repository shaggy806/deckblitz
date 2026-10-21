import { defineCard } from "../define.js";

const TEXT = "{4}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.";

export default defineCard({
  name: "Silent Dart",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
