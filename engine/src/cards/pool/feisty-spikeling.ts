import { defineCard } from "../define.js";

export default defineCard({
  name: "Feisty Spikeling",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nDuring your turn, this creature has first strike.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
