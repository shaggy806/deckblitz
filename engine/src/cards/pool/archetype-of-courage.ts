import { defineCard } from "../define.js";

// EDHREC rank 4555.

export default defineCard({
  name: "Archetype of Courage",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Creatures you control have first strike.\nCreatures your opponents control lose first strike and can't have or gain first strike.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["first-strike"],
      text: "Creatures you control have first strike.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: ["first-strike"],
      text: "Creatures your opponents control lose first strike and can't have or gain first strike.",
    },
  ],
});
