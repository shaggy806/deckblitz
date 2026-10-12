import { defineCard } from "../define.js";

export default defineCard({
  name: "Fog of Gnats",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{B}: Regenerate this creature.",
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
