import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15368.

export default defineCard({
  name: "Hopeful Eidolon",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  bestow: "{3}{W}",
  text: "Bestow {3}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)\nEnchanted creature gets +1/+1 and has lifelink.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "Enchanted creature gets +1/+1 and has lifelink.",
    },
  ],
});
