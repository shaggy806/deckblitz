import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 7549.

export default defineCard({
  name: "Kasmina's Transmutation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature loses all abilities and has base power and toughness 1/1.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setBasePt: { power: 1, toughness: 1 },
      text: "Enchanted creature loses all abilities and has base power and toughness 1/1.",
    },
  ],
});
