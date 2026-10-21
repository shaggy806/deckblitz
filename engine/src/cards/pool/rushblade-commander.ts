import { defineCard } from "../define.js";

// EDHREC rank 14046. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4) — and it includes this Warrior itself.

export default defineCard({
  name: "Rushblade Commander",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Azra", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Warriors your team controls have haste.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Warrior" },
      grantKeywords: ["haste"],
      text: "Warriors your team controls have haste.",
    },
  ],
});
