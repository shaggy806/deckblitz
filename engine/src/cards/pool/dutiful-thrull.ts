import { defineCard } from "../define.js";

export default defineCard({
  name: "Dutiful Thrull",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  text: "{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
