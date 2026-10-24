import { defineCard } from "../define.js";

// EDHREC rank 7700.
//
// A creature that's tapped, can't attack, is summoning sick, or would have a
// cost to pay to attack doesn't have to (the ruling — rule 508.1d).
const TEXT = "All creatures have double strike and attack each combat if able.";

export default defineCard({
  name: "Avatar of Slaughter",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 8,
  toughness: 8,
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures" },
      grantKeywords: ["double-strike"],
      restrictions: ["must-attack"],
      text: TEXT,
    },
  ],
});
