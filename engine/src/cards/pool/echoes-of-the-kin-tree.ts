import { defineCard } from "../define.js";

// EDHREC rank 27204.

export default defineCard({
  name: "Echoes of the Kin Tree",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{2}{W}: Bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "{2}{W}: Bolster 1.",
    },
  ],
});
