import { defineCard } from "../define.js";

export default defineCard({
  name: "Manor Skeleton",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{1}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
});
