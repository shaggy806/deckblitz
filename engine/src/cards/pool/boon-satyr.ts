import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16900.

export default defineCard({
  name: "Boon Satyr",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Satyr"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  bestow: "{3}{G}{G}",
  text: "Flash\nBestow {3}{G}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +4/+2.",
  static: [{ affects: { scope: "attached" }, grantPt: [4, 2], text: "Enchanted creature gets +4/+2." }],
});
