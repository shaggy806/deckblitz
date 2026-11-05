import { defineCard } from "../define.js";

// EDHREC rank 5818.

export default defineCard({
  name: "Archetype of Finality",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Gorgon"],
  power: 2,
  toughness: 3,
  text: "Creatures you control have deathtouch.\nCreatures your opponents control lose deathtouch and can't have or gain deathtouch.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["deathtouch"],
      text: "Creatures you control have deathtouch.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: ["deathtouch"],
      text: "Creatures your opponents control lose deathtouch and can't have or gain deathtouch.",
    },
  ],
});
