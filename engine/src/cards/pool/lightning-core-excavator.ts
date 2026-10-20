import { defineCard } from "../define.js";

const TEXT = "{5}, {T}, Sacrifice this creature: It deals 3 damage to any target.";

export default defineCard({
  name: "Lightning-Core Excavator",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
