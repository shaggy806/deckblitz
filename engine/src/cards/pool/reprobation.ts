import { defineCard } from "../define.js";

// EDHREC rank 5793.
//
// "Is a Coward creature" replaces its card types and creature types (rule
// 205.1a; supertypes stay, the ruling) but not its colours; Frogify's shape.
//
// Rulings:
//   If a noncreature permanent becomes a creature and is enchanted with Reprobation, it will remain
//     a creature thanks to Reprobation's effect, even when the original effect that made it a
//     creature expires.
//   If the enchanted creature gains an ability after Reprobation becomes attached to it, it will
//     keep that ability.

const COWARD_TEXT =
  "Enchanted creature loses all abilities and is a Coward creature with base power and toughness 0/1. (It keeps all supertypes but loses all other types and creature types.)";

export default defineCard({
  name: "Reprobation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${COWARD_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["creature"],
      setSubtypes: ["Coward"],
      setBasePt: { power: 0, toughness: 1 },
      loseAllAbilities: true,
      text: COWARD_TEXT,
    },
  ],
});
