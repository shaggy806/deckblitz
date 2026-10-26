import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Deadeye Navigator",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Deadeye Navigator is paired with another creature, each of those creatures has \"{1}{U}: Exile this creature, then return it to the battlefield under your control.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsActivated: [
        {
          cost: { mana: "{1}{U}", tap: false },
          targets: [],
          effect: { kind: "flicker", target: "source", underYourControl: true },
          resolve: null,
          text: "{1}{U}: Exile this creature, then return it to the battlefield under your control.",
        },
      ],
      text: "As long as Deadeye Navigator is paired with another creature, each of those creatures has \"{1}{U}: Exile this creature, then return it to the battlefield under your control.\"",
    },
  ],
});
