import { defineCard } from "../define.js";

export default defineCard({
  name: "Blockbuster",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{1}{R}, Sacrifice this enchantment: It deals 3 damage to each tapped creature and each player.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", tapped: true }, amount: 3 },
          { kind: "damage", amount: 3, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{1}{R}, Sacrifice this enchantment: It deals 3 damage to each tapped creature and each player.",
    },
  ],
});
