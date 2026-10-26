import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 11809. Spiteful Sliver's shape, aimed at an
// opponent or a planeswalker.
//
// Rulings:
//   [2004-10-04] If it blocks a trample creature, it only gets dealt damage equal to what is
//     assigned to it. This means it will likely only get to deal 1 damage to the opponent.

const TEXT = "Whenever this creature is dealt damage, it deals that much damage to target opponent or planeswalker.";

export default defineCard({
  name: "Mogg Maniac",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
