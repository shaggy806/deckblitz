import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 22019.

export default defineCard({
  name: "Galvanic Alchemist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 4,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, each of those creatures has \"{2}{U}: Untap this creature.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsActivated: [
        {
          cost: { mana: "{2}{U}", tap: false },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: "{2}{U}: Untap this creature.",
        },
      ],
      text: "As long as this creature is paired with another creature, each of those creatures has \"{2}{U}: Untap this creature.\"",
    },
  ],
});
