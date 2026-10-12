import { defineCard } from "../define.js";

export default defineCard({
  name: "Wake of Vultures",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{1}{B}, Sacrifice a creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}, Sacrifice a creature: Regenerate this creature.",
    },
  ],
});
