import { defineCard } from "../define.js";

export default defineCard({
  name: "Grim Roustabout",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["unleash"],
  text: "Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)\n{1}{B}: Regenerate this creature.",
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
