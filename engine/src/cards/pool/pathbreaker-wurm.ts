import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 22219.

export default defineCard({
  name: "Pathbreaker Wurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 4,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have trample.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["trample"],
      text: "As long as this creature is paired with another creature, both creatures have trample.",
    },
  ],
});
