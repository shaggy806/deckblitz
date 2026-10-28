import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 8713.

export default defineCard({
  name: "Entangler",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can block any number of creatures.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      blockAdditional: "any",
      text: "Enchanted creature can block any number of creatures.",
    },
  ],
});
