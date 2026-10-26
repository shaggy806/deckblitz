import { defineCard } from "../define.js";

// EDHREC rank 20660.

const PT_TEXT = "Horde of Boggarts's power and toughness are each equal to the number of red permanents you control.";

export default defineCard({
  name: "Horde of Boggarts",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 0,
  toughness: 0,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${PT_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), counting itself while it's red.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { colors: ["R"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
