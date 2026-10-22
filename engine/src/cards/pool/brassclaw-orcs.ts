import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 31509.
//
// Ironclaw Orcs' restriction: "can block only creatures with power 1 or less" (rule 509.1b),
// checked as blocks are declared.
const TEXT = "This creature can't block creatures with power 2 or greater.";

export default defineCard({
  name: "Brassclaw Orcs",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 3,
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
