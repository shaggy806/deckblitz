import { defineCard } from "../define.js";

// EDHREC rank 26035.

export default defineCard({
  name: "Coalition Skyknight",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nEnlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
  static: [
    {
      affects: { scope: "self" },
      enlist: true,
      text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
    },
  ],
});
