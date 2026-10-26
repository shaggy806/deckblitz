import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21690.

export default defineCard({
  name: "Observant Alseid",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  bestow: "{4}{W}",
  text: "Bestow {4}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nVigilance\nEnchanted creature gets +2/+2 and has vigilance.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["vigilance"],
      text: "Enchanted creature gets +2/+2 and has vigilance.",
    },
  ],
});
