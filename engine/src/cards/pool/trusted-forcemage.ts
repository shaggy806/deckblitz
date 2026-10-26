import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 30793.

export default defineCard({
  name: "Trusted Forcemage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, each of those creatures gets +1/+1.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantPt: [1, 1],
      text: "As long as this creature is paired with another creature, each of those creatures gets +1/+1.",
    },
  ],
});
