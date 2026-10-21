import { defineCard } from "../define.js";

// EDHREC rank 14182.
//
// Rulings:
//   [2013-07-01] Nightmare's ability counts all lands you control with the subtype Swamp, not just
//     ones named Swamp.
//   [2013-07-01] The ability that defines Nightmare's power and toughness works everywhere, not
//     just on the battlefield.

const PT_TEXT = "Nightmare's power and toughness are each equal to the number of Swamps you control.";

export default defineCard({
  name: "Nightmare",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horse"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Swamp", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
