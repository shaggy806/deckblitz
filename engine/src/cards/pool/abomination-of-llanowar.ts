import { defineCard } from "../define.js";

// A CDA (rule 604.3), so it works in every zone: "you" is its controller, or
// its owner off the battlefield. Itself is an Elf you control, or an Elf card
// in your graveyard — counted once either way.
const PT_TEXT =
  "Abomination of Llanowar's power and toughness are each equal to the number of Elves you control plus the number of Elf cards in your graveyard.";

export default defineCard({
  name: "Abomination of Llanowar",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Horror"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance", "menace"],
  text: `Vigilance; menace (This creature can't be blocked except by two or more creatures.)\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "count",
          filter: { subtype: "Elf", controlledBy: "you" },
          plus: [{ filter: { subtype: "Elf", ownedBy: "you" }, in: "graveyards" }],
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
