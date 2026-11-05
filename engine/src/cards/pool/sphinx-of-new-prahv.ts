import { defineCard } from "../define.js";

// EDHREC rank 24499.

export default defineCard({
  name: "Sphinx of New Prahv",
  manaCost: "{W}{W}{U}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nSpells your opponents cast that target this creature cost {2} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2 },
      text: "Spells your opponents cast that target this creature cost {2} more to cast.",
    },
  ],
});
