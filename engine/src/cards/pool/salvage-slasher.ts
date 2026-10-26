import { defineCard } from "../define.js";

// EDHREC rank 28842.

const TEXT = "This creature gets +1/+0 for each artifact card in your graveyard.";

export default defineCard({
  name: "Salvage Slasher",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "artifact", ownedBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
