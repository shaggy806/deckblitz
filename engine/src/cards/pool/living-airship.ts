import { defineCard } from "../define.js";

export default defineCard({
  name: "Living Airship",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{G}: Regenerate this creature.",
    },
  ],
});
