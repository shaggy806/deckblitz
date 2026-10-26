import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 18906.

export default defineCard({
  name: "Baleful Eidolon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  bestow: "{4}{B}",
  text: "Bestow {4}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nDeathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nEnchanted creature gets +1/+1 and has deathtouch.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["deathtouch"],
      text: "Enchanted creature gets +1/+1 and has deathtouch.",
    },
  ],
});
