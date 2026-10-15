import { defineCard } from "../define.js";

// EDHREC rank 17871.

export default defineCard({
  name: "Sting-Slinger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  text: "{1}{R}, {T}, Blight 1: This creature deals 2 damage to each opponent. (To blight 1, put a -1/-1 counter on a creature you control.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true, blight: 1 },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "{1}{R}, {T}, Blight 1: This creature deals 2 damage to each opponent.",
    },
  ],
});
