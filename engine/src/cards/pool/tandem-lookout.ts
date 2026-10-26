import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Tandem Lookout",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Tandem Lookout is paired with another creature, each of those creatures has \"Whenever this creature deals damage to an opponent, draw a card.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "opponent" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals damage to an opponent, draw a card.",
        },
      ],
      text: "As long as Tandem Lookout is paired with another creature, each of those creatures has \"Whenever this creature deals damage to an opponent, draw a card.\"",
    },
  ],
});
