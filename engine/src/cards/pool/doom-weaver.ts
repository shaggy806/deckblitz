import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Doom Weaver",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spider", "Horror"],
  power: 1,
  toughness: 8,
  text: "Reach\nSoulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Doom Weaver is paired with another creature, each of those creatures has \"When this creature dies, draw cards equal to its power.\"",
  keywords: ["reach"],
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: { powerOf: "source" } },
          resolve: null,
          text: "When this creature dies, draw cards equal to its power.",
        },
      ],
      text: "As long as Doom Weaver is paired with another creature, each of those creatures has \"When this creature dies, draw cards equal to its power.\"",
    },
  ],
});
