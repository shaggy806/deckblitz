import { defineCard } from "../define.js";

// EDHREC rank 29478.
const TEXT = "If a source would deal damage to a Cleric creature you control, prevent 1 of that damage.";

export default defineCard({
  name: "Daunting Defender",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        toFilter: { type: "creature", subtype: "Cleric", controlledBy: "you" },
        preventAmount: 1,
      },
      text: TEXT,
    },
  ],
});
