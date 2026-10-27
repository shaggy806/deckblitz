import { defineCard } from "../define.js";

// EDHREC rank 13057. A characteristic-defining ability (rule 604.3) counting
// every Goblin on the battlefield, whoever controls it, itself included.

const PT_TEXT = "Reckless One's power and toughness are each equal to the number of Goblins on the battlefield.";

export default defineCard({
  name: "Reckless One",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Avatar"],
  power: 0,
  toughness: 0,
  keywords: ["haste"],
  text: `Haste\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Goblin" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
