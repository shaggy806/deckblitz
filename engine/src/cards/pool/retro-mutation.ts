import { defineCard } from "../define.js";

// EDHREC rank 15527.
//
// Lignify's shape: "is a Turtle" replaces only its creature types
// (`setSubtypes`); "can't attack" is on the same static as the loss, so it
// stays (rule 613.7).
//
// Rulings:
//   Retro-Mutation overwrites all previous effects that set the creature's base power and toughness
//     to specific values. Any power- or toughness-setting effects that start to apply afterward
//     will overwrite this effect.

const TURTLE_TEXT =
  "Enchanted creature is a Turtle with base power and toughness 0/1. It can't attack and loses all abilities. (It also loses all other creature types.)";

export default defineCard({
  name: "Retro-Mutation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TURTLE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Turtle"],
      setBasePt: { power: 0, toughness: 1 },
      restrictions: ["cant-attack"],
      loseAllAbilities: true,
      text: TURTLE_TEXT,
    },
  ],
});
