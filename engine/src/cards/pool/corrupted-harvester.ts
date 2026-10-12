import { defineCard } from "../define.js";

export default defineCard({
  name: "Corrupted Harvester",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 6,
  toughness: 3,
  text: "{B}, Sacrifice a creature: Regenerate this creature.",
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
