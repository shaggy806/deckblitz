import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21397.

export default defineCard({
  name: "Leafcrown Dryad",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph", "Dryad"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  bestow: "{3}{G}",
  text: "Bestow {3}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nReach\nEnchanted creature gets +2/+2 and has reach.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["reach"],
      text: "Enchanted creature gets +2/+2 and has reach.",
    },
  ],
});
