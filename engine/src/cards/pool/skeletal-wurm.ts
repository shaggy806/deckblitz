import { defineCard } from "../define.js";

export default defineCard({
  name: "Skeletal Wurm",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Wurm"],
  power: 7,
  toughness: 6,
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
