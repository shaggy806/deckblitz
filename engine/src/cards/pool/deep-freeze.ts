import { defineCard } from "../define.js";

// EDHREC rank 18293.
//
// Defender comes with the loss, so it stays (`loseAllAbilities`); blue and Wall are
// added (`addColors`, `addSubtypes`).
//
// Rulings:
//   [2018-04-27] Effects that modify a creature’s power and/or toughness, such as the effect of
//     Titanic Growth, will apply to the creature no matter when they started to take effect. The
//     same is true for any counters that change its power and/or toughness and effects that switch
//     its power and toughness.
//   [2018-04-27] If the enchanted creature has an ability that grants abilities to other objects,
//     Deep Freeze’s effect will stop it from doing so. If the enchanted creature gains an ability
//     after Deep Freeze resolves, it will keep that ability.
//   [2018-04-27] Deep Freeze overwrites all previous effects that set the creature’s base power
//     and toughness to specific values. Any power- or toughness-setting effects that start to
//     apply after the ability resolves will overwrite this effect.

export default defineCard({
  name: "Deep Freeze",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has base power and toughness 0/4, has defender, loses all other abilities, and is a blue Wall in addition to its other colors and types.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 0, toughness: 4 },
      grantKeywords: ["defender"],
      loseAllAbilities: true,
      addColors: ["U"],
      addSubtypes: ["Wall"],
      text: "Enchanted creature has base power and toughness 0/4, has defender, loses all other abilities, and is a blue Wall in addition to its other colors and types.",
    },
  ],
});
