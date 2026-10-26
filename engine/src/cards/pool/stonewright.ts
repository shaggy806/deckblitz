import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 27938.

export default defineCard({
  name: "Stonewright",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Stonewright is paired with another creature, each of those creatures has \"{R}: This creature gets +1/+0 until end of turn.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: "{R}: This creature gets +1/+0 until end of turn.",
        },
      ],
      text: "As long as Stonewright is paired with another creature, each of those creatures has \"{R}: This creature gets +1/+0 until end of turn.\"",
    },
  ],
});
