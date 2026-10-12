import { defineCard } from "../define.js";

export default defineCard({
  name: "Drudge Reavers",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\n{B}: Regenerate this creature.",
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
