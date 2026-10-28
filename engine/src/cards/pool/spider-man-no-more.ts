import { defineCard } from "../define.js";

// EDHREC rank 7924. "Is a Citizen" replaces only its creature types
// (setSubtypes, rule 205.1a); defender comes from the same static, so it stays.

const STATIC_TEXT =
  "Enchanted creature is a Citizen with base power and toughness 1/1. It has defender and loses all other abilities. (It also loses all other creature types.)";

export default defineCard({
  name: "Spider-Man No More",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Citizen"],
      setBasePt: { power: 1, toughness: 1 },
      grantKeywords: ["defender"],
      loseAllAbilities: true,
      text: STATIC_TEXT,
    },
  ],
});
