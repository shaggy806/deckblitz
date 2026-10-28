import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 12769.

export default defineCard({
  name: "Fresh Start",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets -5/-0 and loses all abilities.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-5, 0],
      loseAllAbilities: true,
      text: "Enchanted creature gets -5/-0 and loses all abilities.",
    },
  ],
});
