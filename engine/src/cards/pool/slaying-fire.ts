import { defineCard } from "../define.js";

// Adamant "instead": one damage instruction, its amount chosen by the red
// mana spent to cast it.
export default defineCard({
  name: "Slaying Fire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Slaying Fire deals 3 damage to any target.\nAdamant — If at least three red mana was spent to cast this spell, it deals 4 damage instead.",
  targets: ["any-target"],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpentOfColors: { R: 3 } } },
    then: { kind: "damage", amount: 4, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});
