import { defineCard } from "../define.js";

// EDHREC rank 17568.

export default defineCard({
  name: "Eater of Hope",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{B}, Sacrifice another creature: Regenerate this creature.\n{2}{B}, Sacrifice two other creatures: Destroy target creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}, Sacrifice another creature: Regenerate this creature.",
    },
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: { filter: { type: "creature" }, count: 2 } },
      otherOnly: true,
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{B}, Sacrifice two other creatures: Destroy target creature.",
    },
  ],
});
