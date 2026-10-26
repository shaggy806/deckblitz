import { defineCard } from "../define.js";

// EDHREC rank 9473.
//
// Rulings:
//   [2014-07-18] Circle of Flame's ability triggers only if a creature without flying is declared
//     as an attacker during the declare attackers step.
//
// Palazzo Archers' "attacks you or a planeswalker you control" (`attackingYou`
// with no `defender`), for a creature without flying as it's declared.

const TEXT =
  "Whenever a creature without flying attacks you or a planeswalker you control, this enchantment deals 1 damage to that creature.";

export default defineCard({
  name: "Circle of Flame",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true, filter: { notKeyword: "flying" } },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
