import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 13183.

export default defineCard({
  name: "Celestial Archon",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Archon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "first-strike"],
  bestow: "{5}{W}{W}",
  text: "Bestow {5}{W}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying, first strike\nEnchanted creature gets +4/+4 and has flying and first strike.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["flying", "first-strike"],
      text: "Enchanted creature gets +4/+4 and has flying and first strike.",
    },
  ],
});
