import { defineCard } from "../define.js";

// EDHREC rank 25722.

const TEXT = "{3}, {T}, Sacrifice this artifact: It deals 2 damage to any target.";

export default defineCard({
  name: "Explosive Apparatus",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
