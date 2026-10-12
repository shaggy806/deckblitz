import { defineCard } from "../define.js";

export default defineCard({
  name: "Malach of the Dawn",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{W}{W}{W}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{W}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{W}{W}{W}: Regenerate this creature.",
    },
  ],
});
