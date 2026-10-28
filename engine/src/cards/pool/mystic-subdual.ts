import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16328.

export default defineCard({
  name: "Mystic Subdual",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets -2/-0 and loses all abilities. (Mutating onto the creature won't give it new abilities. It can gain abilities in other ways.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-2, 0],
      loseAllAbilities: true,
      text: "Enchanted creature gets -2/-0 and loses all abilities.",
    },
  ],
});
