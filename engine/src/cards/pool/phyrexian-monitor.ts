import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Monitor",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Skeleton"],
  power: 2,
  toughness: 2,
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
