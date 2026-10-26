import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 23365.

export default defineCard({
  name: "Nearheath Pilgrim",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have lifelink.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["lifelink"],
      text: "As long as this creature is paired with another creature, both creatures have lifelink.",
    },
  ],
});
