import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 26729.

export default defineCard({
  name: "Hanweir Lancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have first strike.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["first-strike"],
      text: "As long as this creature is paired with another creature, both creatures have first strike.",
    },
  ],
});
