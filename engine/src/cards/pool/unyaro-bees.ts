import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 27174.

export default defineCard({
  name: "Unyaro Bees",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{G}: This creature gets +1/+1 until end of turn.\n{3}{G}, Sacrifice this creature: It deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{G}: This creature gets +1/+1 until end of turn.",
    },
    {
      cost: { mana: "{3}{G}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{3}{G}, Sacrifice this creature: It deals 2 damage to any target.",
    },
  ],
});
