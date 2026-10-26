import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Lightning Mauler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have haste.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["haste"],
      text: "As long as this creature is paired with another creature, both creatures have haste.",
    },
  ],
});
