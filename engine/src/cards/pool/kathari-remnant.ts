import { defineCard } from "../define.js";

export default defineCard({
  name: "Kathari Remnant",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Bird", "Skeleton"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{B}: Regenerate this creature.\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
