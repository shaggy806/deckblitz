import { defineCard } from "../define.js";

export default defineCard({
  name: "Screeching Harpy",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy", "Beast"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{1}{B}: Regenerate this creature.",
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
