import { defineCard } from "../define.js";

// EDHREC rank 29792.

export default defineCard({
  name: "Audacious Infiltrator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Rogue"],
  power: 3,
  toughness: 1,
  text: "This creature can't be blocked by artifact creatures.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "artifact" } }],
      text: "This creature can't be blocked by artifact creatures.",
    },
  ],
});
