import { defineCard } from "../define.js";

// EDHREC rank 27941.

const TEXT = "{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.";

export default defineCard({
  name: "Scalding Cauldron",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
