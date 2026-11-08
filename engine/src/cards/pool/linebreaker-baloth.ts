import { defineCard } from "../define.js";

// EDHREC rank 25076.

export default defineCard({
  name: "Linebreaker Baloth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)\nThis creature can't be blocked by creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      enlist: true,
      text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
    },
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
