import { defineCard } from "../define.js";

export default defineCard({
  name: "Sentry of the Underworld",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Griffin", "Skeleton"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\n{W}{B}, Pay 3 life: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{W}{B}", tap: false, payLife: 3 },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{W}{B}, Pay 3 life: Regenerate this creature.",
    },
  ],
});
