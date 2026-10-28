import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 7124.

export default defineCard({
  name: "Utter Insignificance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature loses all abilities and has base power and toughness 1/1.\n{2}{C}: Exile enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{C}", tap: false },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: "{2}{C}: Exile enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setBasePt: { power: 1, toughness: 1 },
      text: "Enchanted creature loses all abilities and has base power and toughness 1/1.",
    },
  ],
});
