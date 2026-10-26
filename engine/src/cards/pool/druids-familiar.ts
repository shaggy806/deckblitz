import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Druid's Familiar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 2,
  toughness: 2,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, each of those creatures gets +2/+2.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantPt: [2, 2],
      text: "As long as this creature is paired with another creature, each of those creatures gets +2/+2.",
    },
  ],
});
