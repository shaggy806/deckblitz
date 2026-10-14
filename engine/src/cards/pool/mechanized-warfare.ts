import { defineCard } from "../define.js";

// EDHREC rank 4248.
//
// Rulings:
//   [2022-10-14] If damage dealt by a red or artifact source you control is being divided or
//     assigned among multiple opponents and/or permanents opponents' control, divide the original
//     amount before adding 1. For example, if you cast a red spell that deals 4 damage divided
//     among any number of targets and you choose to have it deal 2 damage to a creature and 2
//     damage to that creature's controller, that spell will deal 3 damage to each of them instead.
//   [2022-10-14] If another effect modifies how much damage a source would deal to an opponent or
//     a permanent they control, including preventing some of it, the player being dealt damage or
//     the controller of the permanent being dealt damage chooses an order in which to apply those
//     effects. If all of the damage is prevented, Mechanized Warfare's effect no longer applies.
//   [2022-10-14] The additional 1 damage is dealt by the original source of damage. The additional
//     damage isn't dealt by Mechanized Warfare.

export default defineCard({
  name: "Mechanized Warfare",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "If a red or artifact source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus 1 instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 1,
        source: { anyOf: [{ colors: ["R"] }, { type: "artifact" }], controlledBy: "you" },
        to: "opponent-side",
      },
      text: "If a red or artifact source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus 1 instead.",
    },
  ],
});
