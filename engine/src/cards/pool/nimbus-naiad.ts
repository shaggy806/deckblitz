import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23160.

export default defineCard({
  name: "Nimbus Naiad",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  bestow: "{4}{U}",
  text: "Bestow {4}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying\nEnchanted creature gets +2/+2 and has flying.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
});
