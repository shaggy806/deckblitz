import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 22196.

export default defineCard({
  name: "Purphoros's Emissary",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Ox"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  bestow: "{6}{R}",
  text: "Bestow {6}{R} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nMenace (This creature can't be blocked except by two or more creatures.)\nEnchanted creature gets +3/+3 and has menace.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["menace"],
      text: "Enchanted creature gets +3/+3 and has menace.",
    },
  ],
});
