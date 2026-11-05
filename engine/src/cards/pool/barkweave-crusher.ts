import { defineCard } from "../define.js";

// EDHREC rank 27971.

export default defineCard({
  name: "Barkweave Crusher",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 5,
  text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
  static: [
    {
      affects: { scope: "self" },
      enlist: true,
      text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
    },
  ],
});
