import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Wingcrafter",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have flying.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["flying"],
      text: "As long as this creature is paired with another creature, both creatures have flying.",
    },
  ],
});
