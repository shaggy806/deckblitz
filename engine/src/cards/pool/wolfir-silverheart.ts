import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Wolfir Silverheart",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Warrior"],
  power: 4,
  toughness: 4,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, each of those creatures gets +4/+4.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantPt: [4, 4],
      text: "As long as this creature is paired with another creature, each of those creatures gets +4/+4.",
    },
  ],
});
