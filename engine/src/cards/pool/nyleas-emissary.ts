import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 22002.

export default defineCard({
  name: "Nylea's Emissary",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  bestow: "{5}{G}",
  text: "Bestow {5}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nTrample\nEnchanted creature gets +3/+3 and has trample.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +3/+3 and has trample.",
    },
  ],
});
