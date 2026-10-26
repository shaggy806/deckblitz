import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 29634.
//
// Rulings:
//   [2012-05-01] Diregraf Escort can be paired with a Zombie. The protection will have no effect
//     on the pairing.

export default defineCard({
  name: "Diregraf Escort",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as this creature is paired with another creature, both creatures have protection from Zombies.",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      protection: { filter: { subtype: "Zombie" } },
      text: "As long as this creature is paired with another creature, both creatures have protection from Zombies.",
    },
  ],
});
