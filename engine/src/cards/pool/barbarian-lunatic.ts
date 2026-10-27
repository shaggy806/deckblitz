import { defineCard } from "../define.js";

// EDHREC rank 30038.

export default defineCard({
  name: "Barbarian Lunatic",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 2,
  toughness: 1,
  text: "{2}{R}, Sacrifice this creature: It deals 2 damage to target creature.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 2 },
      resolve: null,
      text: "{2}{R}, Sacrifice this creature: It deals 2 damage to target creature.",
    },
  ],
});
