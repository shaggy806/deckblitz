import { defineCard } from "../define.js";

// Starter 1999. EDHREC rank 10353.
//
// Rulings:
//   [2016-06-08] Battle Squadron's last ability applies in all zones. While it's on the
//     battlefield, it counts itself, so it'll be at least 1/1.
const PT_TEXT = "Battle Squadron's power and toughness are each equal to the number of creatures you control.";

export default defineCard({
  name: "Battle Squadron",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), counting itself.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
