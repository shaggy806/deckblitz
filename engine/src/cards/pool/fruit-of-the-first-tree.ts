import { defineCard } from "../define.js";

// EDHREC rank 12707.
//
// Rulings:
//   [2014-11-24] Use the creature’s toughness when it left the battlefield to determine the value
//     of X. If that number is 0 or less, you won’t gain life or draw cards. (You won’t lose life
//     or discard cards either.)
//   [2014-11-24] Fruit of the First Tree can enchant any creature, but Fruit of the First Tree’s
//     controller will gain life and draw cards.

export default defineCard({
  name: "Fruit of the First Tree",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen enchanted creature dies, you gain X life and draw X cards, where X is its toughness.",
  targets: ["creature"],
  triggered: [
    {
      // The Aura's trigger, reading its host as it last existed (rule
      // 603.10a): `toughnessOf: "trigger-object"` is its last-known toughness.
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
          { kind: "draw", amount: { toughnessOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: "When enchanted creature dies, you gain X life and draw X cards, where X is its toughness.",
    },
  ],
});
