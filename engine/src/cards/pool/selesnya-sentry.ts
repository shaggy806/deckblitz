import { defineCard } from "../define.js";

export default defineCard({
  name: "Selesnya Sentry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 3,
  toughness: 2,
  text: "{5}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{5}{G}: Regenerate this creature.",
    },
  ],
});
