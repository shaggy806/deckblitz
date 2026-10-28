import { defineCard } from "../define.js";

// EDHREC rank 2348.
//
// "Is a Treefolk" replaces its creature types (`setSubtypes`, the rulings), and the
// loss is a `loseAllAbilities` static.
//
// Rulings:
//   [2007-10-01] Lignify will overwrite static abilities that come from the creature itself (such
//     as the one on Verduran Enchantress) because Lignify causes the creature to lose that ability
//     before it gets a chance to apply.
//   [2007-10-01] If Lignify leaves the battlefield, the creature goes back to being what it was
//     before. Any effects that applied while the Lignify was on the battlefield, such as Giant
//     Growth or Lace with Moonglove, will continue to apply.
//   [2007-10-01] If the enchanted creature has a characteristic-defining ability that specifies
//     its color, that ability will still have its effect because it's applied before the creature
//     loses the ability.
//   [2007-10-01] Lignify overwrites previous effects that changed the enchanted creature's
//     creature types. Any such effects that apply after Lignify enters will work normally.
//   [2007-10-01] If a previous effect switched the creature's power and toughness, that effect
//     still applies (though it will apply to the creature's new power and toughness).
//   [2007-10-01] Lignify overwrites characteristic-defining abilities that specify the enchanted
//     creature's power or toughness (such as the one Dauntless Dourbark has) or that specify its
//     creature types (such as changeling does).
//   [2007-10-01] Lignify causes the enchanted creature to lose all abilities it had at the time it
//     became enchanted. Any abilities granted to the creature after Lignify entered the
//     battlefield will work normally.
//   [2009-10-01] Lignify will overwrite any previous effects that set the enchanted creature's
//     power or toughness (such as Serendib Sorcerer does). Any such effects that apply after
//     Lignify entered will work normally.
//   [2009-10-01] Lignify will not overwrite effects such as those from Glorious Anthem, counters,
//     or Giant Growth that change the enchanted creature's power or toughness without setting it
//     to a specific value. Apply such effects after applying Lignify.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.

export default defineCard({
  name: "Lignify",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["kindred", "enchantment"],
  subtypes: ["Treefolk", "Aura"],
  text: "Enchant creature\nEnchanted creature is a Treefolk with base power and toughness 0/4 and loses all abilities.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Treefolk"],
      setBasePt: { power: 0, toughness: 4 },
      loseAllAbilities: true,
      text: "Enchanted creature is a Treefolk with base power and toughness 0/4 and loses all abilities.",
    },
  ],
});
