import { defineCard } from "../define.js";

export default defineCard({
  name: "Pteron Ghost",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nSacrifice this creature: Regenerate target artifact.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["artifact"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Regenerate target artifact.",
    },
  ],
});
