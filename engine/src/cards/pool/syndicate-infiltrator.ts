import { defineCard } from "../define.js";

// EDHREC rank 27588.

export default defineCard({
  name: "Syndicate Infiltrator",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAs long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [2, 2],
      text: "As long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2.",
      condition: {
        kind: "aggregate",
        value: {
          aggregate: "distinct",
          of: "mana-value",
          filter: { ownedBy: "you" },
          in: "graveyards",
        },
        compare: { op: "gte", n: 5 },
      },
    },
  ],
});
