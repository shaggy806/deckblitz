import { defineCard } from "../define.js";

// EDHREC rank 18139.

const PT_TEXT = "Faerie Swarm's power and toughness are each equal to the number of blue permanents you control.";

export default defineCard({
  name: "Faerie Swarm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), counting itself while it's blue.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { colors: ["U"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
