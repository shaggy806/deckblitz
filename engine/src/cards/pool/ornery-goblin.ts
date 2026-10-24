import { defineCard } from "../define.js";

// EDHREC rank 22396.
//
// Rulings:
//   [2018-10-05] The triggered ability triggers once for each creature blocking or blocked by
//     Ornery Goblin. The ability resolves and deals damage to that creature before combat damage
//     is dealt. If that damage destroys all creatures blocking Ornery Goblin, Ornery Goblin
//     doesn’t become unblocked.

export default defineCard({
  name: "Ornery Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
    },
  ],
});
