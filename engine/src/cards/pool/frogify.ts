import { defineCard } from "../define.js";

// EDHREC rank 4715.
//
// "Is a blue Frog creature" replaces its card types, creature types and
// colours (rule 205.1a; supertypes stay, the ruling); the loss is a
// `loseAllAbilities` static (layer 6), the base P/T layer 7b.
//
// Rulings:
//   Frogify may enchant a permanent that is only temporarily a creature, such as a Vehicle. If
//     this happens, Frogify's effect causes the enchanted permanent to remain a 1/1 blue Frog
//     creature even after the temporary effect expires.
//   If the affected creature gains an ability after Frogify becomes attached to it, it will keep
//     that ability.

const FROG_TEXT =
  "Enchanted creature loses all abilities and is a blue Frog creature with base power and toughness 1/1. (It loses all other card types and creature types.)";

export default defineCard({
  name: "Frogify",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${FROG_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["creature"],
      setSubtypes: ["Frog"],
      setColors: ["U"],
      setBasePt: { power: 1, toughness: 1 },
      loseAllAbilities: true,
      text: FROG_TEXT,
    },
  ],
});
