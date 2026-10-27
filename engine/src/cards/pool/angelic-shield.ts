import { defineCard } from "../define.js";

export default defineCard({
  name: "Angelic Shield",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "Creatures you control get +0/+1.\nSacrifice this enchantment: Return target creature to its owner's hand.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      text: "Creatures you control get +0/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "Sacrifice this enchantment: Return target creature to its owner's hand.",
    },
  ],
});
