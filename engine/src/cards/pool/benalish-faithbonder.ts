import { defineCard } from "../define.js";

// EDHREC rank 26797.

export default defineCard({
  name: "Benalish Faithbonder",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nEnlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
  static: [
    {
      affects: { scope: "self" },
      enlist: true,
      text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
    },
  ],
});
