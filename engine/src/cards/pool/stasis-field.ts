import { defineCard } from "../define.js";

// EDHREC rank 13686.
//
// Defender comes from the same static as the loss, so it stays (rule 613.7).
//
// Rulings:
//   [2023-04-14] If the enchanted creature has an ability that grants abilities to other objects,
//     Stasis Field's effect will stop it from doing so. If the enchanted creature gains an ability
//     after Stasis Field resolves, it will keep that ability.
//   [2023-04-14] Stasis Field overwrites all previous effects that set the creature's base power
//     and toughness to specific values.

export default defineCard({
  name: "Stasis Field",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has base power and toughness 0/2, has defender, and loses all other abilities.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 0, toughness: 2 },
      grantKeywords: ["defender"],
      loseAllAbilities: true,
      text: "Enchanted creature has base power and toughness 0/2, has defender, and loses all other abilities.",
    },
  ],
});
