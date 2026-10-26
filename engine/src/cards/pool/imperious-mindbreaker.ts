import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Imperious Mindbreaker",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 4,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Imperious Mindbreaker is paired with another creature, each of those creatures has \"Whenever this creature attacks, each opponent mills cards equal to its toughness.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "mill", target: "each-opponent", amount: { toughnessOf: "source" } },
          resolve: null,
          text: "Whenever this creature attacks, each opponent mills cards equal to its toughness.",
        },
      ],
      text: "As long as Imperious Mindbreaker is paired with another creature, each of those creatures has \"Whenever this creature attacks, each opponent mills cards equal to its toughness.\"",
    },
  ],
});
