import { defineCard } from "../define.js";

// EDHREC rank 7599.
const TEXT = "Creatures without flying can't attack.";

export default defineCard({
  name: "Magus of the Moat",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures", withoutKeyword: "flying" },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
