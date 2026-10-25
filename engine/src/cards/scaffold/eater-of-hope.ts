import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
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
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}, Sacrifice another creature: Regenerate this creature.",
      otherOnly: true,
    },
  ],
  // TODO(scaffold): {2}{B}, Sacrifice two other creatures: Destroy target creature.
});
