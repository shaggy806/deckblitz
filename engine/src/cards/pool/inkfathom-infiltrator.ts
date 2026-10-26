import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 15577.

export default defineCard({
  name: "Inkfathom Infiltrator",
  manaCost: "{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 1,
  text: "This creature can't block and can't be blocked.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      grantKeywords: ["unblockable"],
      text: "This creature can't block and can't be blocked.",
    },
  ],
});
