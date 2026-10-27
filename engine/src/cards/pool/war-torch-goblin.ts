import { defineCard } from "../define.js";

export default defineCard({
  name: "War-Torch Goblin",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: "{R}, Sacrifice this creature: It deals 2 damage to target blocking creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", blocking: true } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, Sacrifice this creature: It deals 2 damage to target blocking creature.",
    },
  ],
});
