import { defineCard } from "../define.js";

// EDHREC rank 2846.

export default defineCard({
  name: "Archetype of Aggression",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Creatures you control have trample.\nCreatures your opponents control lose trample and can't have or gain trample.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["trample"],
      text: "Creatures you control have trample.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: ["trample"],
      text: "Creatures your opponents control lose trample and can't have or gain trample.",
    },
  ],
});
