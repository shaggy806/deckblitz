import { defineCard } from "../define.js";

export default defineCard({
  name: "Crackling Triton",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 3,
  text: "{2}{R}, Sacrifice this creature: It deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{2}{R}, Sacrifice this creature: It deals 2 damage to any target.",
    },
  ],
});
