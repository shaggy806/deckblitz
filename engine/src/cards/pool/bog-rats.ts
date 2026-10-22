import { defineCard } from "../define.js";

export default defineCard({
  name: "Bog Rats",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked by Walls.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { subtype: "Wall" },
      text: "This creature can't be blocked by Walls.",
    },
  ],
});
