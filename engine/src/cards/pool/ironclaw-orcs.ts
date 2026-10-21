import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 31225.
//
// "Can't block creatures with power 2 or greater" is "can block only
// creatures with power 1 or less" — the same blocking restriction (rule
// 509.1b), checked as blocks are declared.
const TEXT = "This creature can't block creatures with power 2 or greater.";

export default defineCard({
  name: "Ironclaw Orcs",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "lte", n: 1 } },
      text: TEXT,
    },
  ],
});
