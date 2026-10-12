import { defineCard } from "../define.js";

export default defineCard({
  name: "Goldmeadow Dodger",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Rogue"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked by creatures with power 4 or greater.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 4 } },
      text: "This creature can't be blocked by creatures with power 4 or greater.",
    },
  ],
});
