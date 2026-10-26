import { defineCard } from "../define.js";

// EDHREC rank 10579. Magic 2011.
//
// The source is the red instant or sorcery spell itself (Pyromancer's
// Gauntlet's source filter): a spell that has a creature deal the damage
// isn't doubled (the Soul's Fire ruling). Each Fire Servant doubles again.
//
// Rulings:
//   [2010-08-15] If a red instant or sorcery spell you control divides damage among multiple
//     recipients (such as Fireball does), the damage is divided before Fire Servant's effect
//     doubles it.
//   [2010-08-15] Fire Servant's ability applies no matter who or what the damage would be dealt
//     to: a creature, a player, or a planeswalker.

export default defineCard({
  name: "Fire Servant",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  text: "If a red instant or sorcery spell you control would deal damage, it deals double that damage instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        multiplier: 2,
        source: { colors: ["R"], typesAnyOf: ["instant", "sorcery"], controlledBy: "you" },
      },
      text: "If a red instant or sorcery spell you control would deal damage, it deals double that damage instead.",
    },
  ],
});
