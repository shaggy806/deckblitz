import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 21650.

export default defineCard({
  name: "Elgaud Shieldmate",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have hexproof. (They can't be the targets of spells or abilities your opponents control.)",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantKeywords: ["hexproof"],
      text: "As long as this creature is paired with another creature, both creatures have hexproof. (They can't be the targets of spells or abilities your opponents control.)",
    },
  ],
});
