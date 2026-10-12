import { defineCard } from "../define.js";

export default defineCard({
  name: "Asphodel Wanderer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{2}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
});
