import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 30644.

export default defineCard({
  name: "Geist Trappers",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 5,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have reach.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["reach"],
      text: "As long as this creature is paired with another creature, both creatures have reach.",
    },
  ],
});
