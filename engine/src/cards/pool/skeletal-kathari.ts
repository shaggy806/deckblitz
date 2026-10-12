import { defineCard } from "../define.js";

export default defineCard({
  name: "Skeletal Kathari",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Skeleton"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{B}, Sacrifice a creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}, Sacrifice a creature: Regenerate this creature.",
    },
  ],
});
