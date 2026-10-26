import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 28467.

export default defineCard({
  name: "Stern Mentor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, each of those creatures has \"{T}: Target player mills two cards.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player"],
          effect: { kind: "mill", target: 0, amount: 2 },
          resolve: null,
          text: "{T}: Target player mills two cards.",
        },
      ],
      text: "As long as this creature is paired with another creature, each of those creatures has \"{T}: Target player mills two cards.\"",
    },
  ],
});
