import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 28597.

export default defineCard({
  name: "Spectral Gateguards",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 5,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have vigilance.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["vigilance"],
      text: "As long as this creature is paired with another creature, both creatures have vigilance.",
    },
  ],
});
