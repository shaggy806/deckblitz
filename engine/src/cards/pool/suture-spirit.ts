import { defineCard } from "../define.js";

export default defineCard({
  name: "Suture Spirit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{W/B}{W/B}{W/B}: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{W/B}{W/B}{W/B}", tap: false },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{W/B}{W/B}{W/B}: Regenerate target creature.",
    },
  ],
});
