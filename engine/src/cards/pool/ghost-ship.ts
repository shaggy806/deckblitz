import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghost Ship",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{U}{U}{U}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{U}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{U}{U}{U}: Regenerate this creature.",
    },
  ],
});
